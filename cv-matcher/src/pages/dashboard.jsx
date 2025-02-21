import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingOverlay from '../components/LoadingOverlay';

const DashboardPage = () => {
  const { logout, currentUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|doc|docx)$/)) {
      toast.error('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      const baseURL = 'https://cv-matcher-backend-p9yp.onrender.com';
      console.log('Attempting to connect to:', baseURL);

      // Test server connection first
      try {
        await axios.get(`${baseURL}/api/health`);
      } catch (connectionError) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      }

      console.log('Uploading resume...');
      const response = await axios.post(
        `${baseURL}/api/resume/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000, // 30 second timeout
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log('Upload response:', response.data);

      if (response.data) {
        toast.success('Resume uploaded and analyzed successfully!');
        navigate('/job-apply', { 
          state: { 
            technicalSkills: response.data.technicalSkills,
            softSkills: response.data.softSkills,
            jobPreferences: response.data.jobPreferences,
            resumeScore: response.data.resumeScore 
          } 
        });
      }
    } catch (error) {
      console.error('Upload error details:', error);
      
      if (error.message === 'Cannot connect to server. Please check if the server is running.') {
        toast.error(error.message);
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please check your internet connection and try again.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again');
      } else {
        const errorMessage = error.response?.data?.message || 'Error uploading resume';
        toast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isUploading && <LoadingOverlay />}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">CV Matcher</h1>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-blue-600 flex items-center space-x-2"
              >
                <span>🏠</span>
                <span>Home</span>
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xl">
                    {currentUser?.username?.charAt(0).toUpperCase() || '👤'}
                  </span>
                </div>
                <span className="text-gray-700">{currentUser?.username}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <button 
                    onClick={() => navigate('/profile')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    User Profile
                  </button>
                  <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    Saved Jobs
                  </button>
                  <button 
                    onClick={logout}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Resume</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <div className="mt-2">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;