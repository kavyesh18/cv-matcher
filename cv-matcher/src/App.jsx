import {Routes, Route} from 'react-router-dom'
import './index.css'
import LandingPage from './pages/landingpage'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import DashboardPage from './pages/dashboard'
import UserProfilePage from './pages/userprofile'
import ProtectedRoute from './components/ProtectedRoute'
import JobApplyPage from './pages/jobapply'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/job-apply" 
        element={
          <ProtectedRoute>
            <JobApplyPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App
