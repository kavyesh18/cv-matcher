import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile, updateProfilePicture, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.username || '',
    email: currentUser?.email || '',
    profilePicture: currentUser?.profilePicture || null
  });

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(
          'https://cv-matcher-backend-p9yp.onrender.com/api/users/profile/picture',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${currentUser.token}`
            }
          }
        );
        setProfileData(prev => ({ ...prev, profilePicture: response.data.url }));
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        'https://cv-matcher-backend-p9yp.onrender.com/api/users/profile',
        { username: profileData.name, email: profileData.email },
        {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        }
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <span className="mr-2">←</span>
          Back to Dashboard
        </button>

        <div className="bg-white shadow-md rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profileData.profilePicture ? (
                    <img 
                      src={profileData.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">
                      {currentUser?.username?.charAt(0).toUpperCase() || '👤'}
                    </span>
                  )}
                </div>
                <label 
                  htmlFor="profile-upload" 
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700"
                >
                  📷
                </label>
                <input
                  type="file"
                  id="profile-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Profile Information Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={profileData.name}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className={`block w-full rounded-md ${
                      isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={profileData.email}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className={`block w-full rounded-md ${
                      isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <div>
                  {isEditing ? (
                    <div className="space-x-4">
                      <button
                        onClick={handleSaveChanges}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;