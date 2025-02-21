const express = require('express');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const User = require('../models/User');
const fs = require('fs');
const pdf = require('pdf-parse');
const queue = require('../utils/queue');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/resumes';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept pdf, doc, docx files
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting variables
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function extractResumeInfo(filePath) {
  try {
    console.log('Starting resume extraction from:', filePath);
    let textContent = '';
    
    if (filePath.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      console.log('File buffer size:', dataBuffer.length);
      
      const data = await pdf(dataBuffer);
      textContent = data.text;
      console.log('Extracted text length:', textContent.length);
      
      if (!textContent || textContent.length === 0) {
        throw new Error('No text content extracted from PDF');
      }
    } else {
      throw new Error('Only PDF files are currently supported');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log('AI model initialized');

    // Simplified prompt focusing on structured output
    const prompt = `Extract information from this resume and format it exactly as shown below:
{
  "technicalSkills": [
    // List all technical skills found in the resume
  ],
  "softSkills": [
    // List all soft skills found in the resume
  ],
  "jobPreferences": "Write a brief summary of career interests and job preferences",
  "resumeScore": 75 // Score between 0-100 based on content quality
}

Resume text:
${textContent}

Important: Return ONLY valid JSON, exactly matching the structure above. No additional text or explanations.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.8,
      }
    });
    
    if (!result?.response?.text) {
      throw new Error('Empty response from AI model');
    }

    let responseText = result.response.text();
    console.log('Raw AI response:', responseText);

    // Clean the response text
    responseText = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Try to find JSON object in the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const jsonStr = jsonMatch[0];
    console.log('Extracted JSON string:', jsonStr);

    try {
      const parsedResponse = JSON.parse(jsonStr);

      // Set default values if any required field is missing
      const validatedResponse = {
        technicalSkills: Array.isArray(parsedResponse.technicalSkills) ? parsedResponse.technicalSkills : [],
        softSkills: Array.isArray(parsedResponse.softSkills) ? parsedResponse.softSkills : [],
        jobPreferences: typeof parsedResponse.jobPreferences === 'string' ? parsedResponse.jobPreferences : '',
        resumeScore: typeof parsedResponse.resumeScore === 'number' ? 
          Math.min(100, Math.max(0, parsedResponse.resumeScore)) : 50
      };

      console.log('Validated response:', validatedResponse);
      return validatedResponse;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Failed to parse JSON string:', jsonStr);
      
      // Return a default response instead of throwing
      return {
        technicalSkills: [],
        softSkills: [],
        jobPreferences: "Could not extract preferences",
        resumeScore: 50
      };
    }
  } catch (error) {
    console.error('Resume extraction error:', error);
    throw error;
  }
}

// Upload and analyze resume
router.post('/upload', auth, (req, res) => {
  const uploadSingle = upload.single('resume');

  uploadSingle(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: err.message });
      } else if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      console.log('File uploaded successfully:', req.file.path);

      // Find user
      const user = await User.findById(req.userId);
      if (!user) {
        fs.unlink(req.file.path, () => {});
        return res.status(404).json({ message: 'User not found' });
      }

      try {
        // Process resume
        console.log('Starting resume analysis...');
        const resumeAnalysis = await extractResumeInfo(req.file.path);
        
        if (!resumeAnalysis) {
          throw new Error('Failed to analyze resume');
        }

        // Update user with resume info
        user.resume = req.file.path;
        user.technicalSkills = resumeAnalysis.technicalSkills || [];
        user.softSkills = resumeAnalysis.softSkills || [];
        user.jobPreferences = resumeAnalysis.jobPreferences || '';
        user.resumeScore = resumeAnalysis.resumeScore || 0;

        await user.save();
        console.log('User updated with resume data');

        // Send response
        res.json({
          message: 'Resume analyzed successfully',
          technicalSkills: user.technicalSkills,
          softSkills: user.softSkills,
          jobPreferences: user.jobPreferences,
          resumeScore: user.resumeScore
        });
      } catch (analysisError) {
        console.error('Analysis error:', analysisError);
        fs.unlink(req.file.path, () => {});
        return res.status(500).json({ 
          message: `Error analyzing resume: ${analysisError.message}` 
        });
      }
    } catch (error) {
      console.error('Server error:', error);
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(500).json({ 
        message: `Server error: ${error.message}` 
      });
    }
  });
});

module.exports = router;