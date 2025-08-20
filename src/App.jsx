import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthService } from './utils/authService';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const currentUser = AuthService.getCurrentUser();
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const currentUser = AuthService.getCurrentUser();
  return !currentUser ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh' }}>
        <Routes>
          {/* Default redirect */}
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
          
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
