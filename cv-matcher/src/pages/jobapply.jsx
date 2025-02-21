import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const JobApplyPage = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);
  const [jobPreferences, setJobPreferences] = useState('');
  const [resumeScore, setResumeScore] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    console.log('Location state:', location.state); // Debug log
    if (location.state) {
      const { technicalSkills, softSkills, jobPreferences, resumeScore } = location.state;
      setTechnicalSkills(technicalSkills || []);
      setSoftSkills(softSkills || []);
      setJobPreferences(jobPreferences || '');
      setResumeScore(resumeScore || 0);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!technicalSkills.length) {
        console.log('No technical skills available');
        return;
      }
      
      setIsLoadingJobs(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('Fetching jobs...');
        const response = await axios.get(
          'https://cv-matcher-backend-p9yp.onrender.com/api/jobs/relevant',
          {
            headers: { 
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} jobs`);
          setJobs(response.data);
        } else {
          console.warn('Unexpected response format:', response.data);
          setJobs([]);
        }
      } catch (error) {
        console.error('Job fetch error:', error.response?.data || error.message);
        let errorMessage = 'Failed to fetch job listings';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        setJobs([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [technicalSkills]);

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Analysis Results</h2>
              
              {/* Resume Score */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Resume Score</h3>
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">{resumeScore}%</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600">
                      Your resume strength based on content analysis
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Skills */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Technical Skills</h3>
                {technicalSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {technicalSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No technical skills found</p>
                )}
              </div>

              {/* Soft Skills */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Soft Skills</h3>
                {softSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No soft skills found</p>
                )}
              </div>

              {/* Job Preferences */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Career Interests</h3>
                {jobPreferences ? (
                  <p className="text-gray-600">{jobPreferences}</p>
                ) : (
                  <p className="text-gray-500 italic">No career interests specified</p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 text-gray-600 hover:text-blue-600 flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Back to Dashboard</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Upload New Resume
                </button>
              </div>
            </div>
          </div>

          {/* Relevant Jobs Section */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Relevant Job Opportunities</h2>
              
              {isLoadingJobs ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-6">
                  {jobs.map(job => (
                    <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                          <p className="text-gray-600">{job.company}</p>
                          <p className="text-gray-500 text-sm">{job.location}</p>
                          <p className="text-gray-500 text-sm mt-2">{job.salary}</p>
                        </div>
                        <p className="text-sm text-gray-500">{job.created}</p>
                      </div>
                      <p className="text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                      <div className="mt-4">
                        <a 
                          href={job.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Apply Now
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No relevant jobs found. Try updating your skills.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplyPage; 