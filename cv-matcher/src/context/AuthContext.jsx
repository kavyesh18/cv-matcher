import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import config from '../config/config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Configure axios defaults
  axios.defaults.baseURL = config.API_URL;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const signup = async (username, email, password) => {
    try {
      console.log('Attempting signup with:', { username, email });
      const response = await axios.post(`${config.API_URL}/api/auth/register`, {
        username,
        email,
        password
      });

      console.log('Signup response:', response.data);

      if (response.data) {
        toast.success('Account created successfully!');
        navigate('/login');
        return true;
      }
    } catch (error) {
      console.error('Signup error:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Failed to create account';
      toast.error(errorMessage);
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${config.API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      setToken(token);
      setCurrentUser(user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.success('Logged in successfully!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const updateUserProfile = async (updatedProfile) => {
    try {
      const response = await axios.put('/api/users/profile', {
        username: updatedProfile.username,
        email: updatedProfile.email
      });

      setCurrentUser(response.data.user);
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  };

  const updateProfilePicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setCurrentUser(response.data.user);
      toast.success('Profile picture updated successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile picture');
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete('/api/users/profile');
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem('token');
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      throw error;
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateUserProfile,
    updateProfilePicture,
    deleteAccount,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 