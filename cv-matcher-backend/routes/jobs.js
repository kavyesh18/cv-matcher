const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/relevant', auth, async (req, res) => {
  try {
    // Get user from database
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get technical skills
    const skills = user.technicalSkills || [];
    if (!skills.length) {
      return res.status(400).json({ message: 'No technical skills found in profile' });
    }

    console.log('User technical skills:', skills);

    // Take most relevant skill for search
    const mainSkill = encodeURIComponent(skills[0].trim());
    console.log('Main search skill:', mainSkill);

    // Build API URL with parameters
    const baseUrl = 'https://api.adzuna.com/v1/api/jobs/gb/search/1';
    const queryString = new URLSearchParams({
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_API_KEY,
      what: mainSkill,
      results_per_page: '10'
    }).toString();

    const apiUrl = `${baseUrl}?${queryString}`;
    console.log('API URL:', apiUrl.replace(process.env.ADZUNA_API_KEY, '***'));

    // Make the request
    const response = await axios({
      method: 'GET',
      url: apiUrl,
      headers: {
        'Accept': 'application/json'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Default
      }
    });

    // Validate response
    if (!response.data || !response.data.results) {
      console.error('Invalid API response:', response.data);
      throw new Error('Invalid response structure from Adzuna API');
    }

    // Process jobs
    const jobs = response.data.results
      .filter(job => job && job.title) // Filter out invalid jobs
      .map(job => ({
        id: job.id,
        title: job.title,
        company: job.company?.display_name || 'Company not specified',
        location: job.location?.display_name || 'Location not specified',
        description: job.description || 'No description available',
        salary: job.salary_min ? 
          `£${Math.floor(job.salary_min).toLocaleString()} - £${Math.floor(job.salary_max).toLocaleString()}` : 
          'Salary not specified',
        url: job.redirect_url,
        created: new Date(job.created).toLocaleDateString()
      }));

    console.log(`Found ${jobs.length} matching jobs`);
    return res.json(jobs);

  } catch (error) {
    console.error('Job search error:', {
      message: error.message,
      response: {
        data: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      }
    });

    // Handle specific error cases
    if (error.response?.status === 400) {
      return res.status(400).json({
        message: 'Invalid request to job search API',
        error: error.response?.data?.error || error.message,
        details: 'Please check the search parameters'
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        message: 'API authentication error',
        error: 'Please check API credentials'
      });
    }

    return res.status(500).json({
      message: 'Error fetching job listings',
      error: error.message
    });
  }
});

module.exports = router; 