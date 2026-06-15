import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobsListing from './pages/JobsListing';
import JobDetails from './pages/JobDetails';
import CandidateProfile from './pages/CandidateProfile';
import SavedJobs from './pages/SavedJobs';
import MyApplications from './pages/MyApplications';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ApplicantsList from './pages/ApplicantsList';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobsListing />} />
              <Route path="/jobs/:id" element={<JobDetails />} />

              {/* Shared Protected Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <CandidateProfile />
                  </ProtectedRoute>
                }
              />

              {/* Candidate Protected Routes */}
              <Route
                path="/saved"
                element={
                  <ProtectedRoute allowedRoles={['Candidate']}>
                    <SavedJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute allowedRoles={['Candidate']}>
                    <MyApplications />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Protected Routes */}
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute allowedRoles={['Recruiter']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/:id/applicants"
                element={
                  <ProtectedRoute allowedRoles={['Recruiter', 'Admin']}>
                    <ApplicantsList />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
