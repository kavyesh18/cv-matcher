# AI-Powered Resume Parser & Job Role Matcher  

## 🚀 Overview  
This is a MERN stack web application that allows users to upload their resumes, extract key skills and job preferences using the **Gemini AI API**, and fetch relevant job roles using the **Adzuna Job API**. The extracted job roles are displayed in a clean UI for easy job application.  

## 🛠 Features  
- **User Authentication:** Users must register and sign in to use the platform.  
- **Resume Upload:** Supports PDF, DOCX, and TXT formats.  
- **AI-Powered Parsing:** Uses Gemini AI API to extract skills and job preferences.  
- **Job Recommendations:** Fetches job roles using Adzuna API based on extracted skills.  
- **Clean UI:** Displays job roles with title, company, location, and a direct link to apply.  

## 🔄 Application Flow  

1️⃣ **User Registration & Login**  
   - Users must **register** before accessing the platform.  
   - After successful registration, users can **sign in**.  

2️⃣ **Resume Upload**  
   - Users are redirected to the **Resume Upload Dashboard**.  
   - Upload a **PDF, DOCX, or TXT** resume.  
   - The resume is processed using **Gemini AI** to extract **key skills and job preferences**.  
   - Extracted data is stored in **MongoDB**.  

3️⃣ **Job Role Matching**  
   - Users are redirected to the **Job Listings Page**.  
   - The system fetches **relevant job roles** using the **Adzuna API**.  
   - Job listings are displayed with details like:  
     - **Job Title**  
     - **Company Name**  
     - **Location**  
     - **Apply Link**  

## 🔧 Technologies Used  
- **Frontend:** React.js (with Axios for API requests)  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **AI API:** Google **Gemini AI**  
- **Job API:** **Adzuna API** (URL: `https://api.adzuna.com/v1/api/jobs/gb/search/1`)  
- **Authentication:** JWT (JSON Web Token)  

## 🛠 Setup & Installation  

### 📌 Prerequisites  
- Node.js & **npm/yarn** installed  
- MongoDB (local or cloud instance)  
- API keys for Gemini AI and Adzuna API (Register to get these keys)  

### 🔥 Installation Steps  

1. **Clone the repository**  
   ```bash  
   git clone https://github.com/your-username/ai-resume-matcher.git  
   cd ai-resume-matcher  
   ```  

2. **Install dependencies**  
   ```bash  
   npm install  # For both frontend and backend  
   ```  

3. **Set up environment variables**  
   Create a `.env` file in the backend directory and add:  
   ```env  
   PORT=5000  
   MONGODB_URI=mongodb://localhost:27017/cv-matcher  
   JWT_SECRET=your_jwt_secret  
   GEMINI_API_KEY=your_gemini_api_key  
   ADZUNA_APP_ID=your_adzuna_app_id  
   ADZUNA_API_KEY=your_adzuna_api_key  
   ```  

4. **Start the Backend Server**  
   ```bash  
   cd backend  
   npm start  
   ```  

5. **Start the Frontend Server**  
   ```bash  
   cd frontend  
   npm start  
   ```  

## 📌 API Endpoints  

| Endpoint               | Method | Description |  
|------------------------|--------|-------------|  
| `/api/auth/register`   | POST   | Register a new user |  
| `/api/auth/login`      | POST   | User login |  
| `/api/resume/upload`   | POST   | Upload and process resume |  
| `/api/jobs/fetch`      | GET    | Fetch job listings based on extracted skills |  

