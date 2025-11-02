import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthService } from './utils/authService';

// Simple helper and small wrappers with clear names
const isLoggedIn = () => Boolean(AuthService.getCurrentUser());

const RequireAuth = ({ children }) => (isLoggedIn() ? children : <Navigate to="/login" replace />);
const RedirectIfAuth = ({ children }) => (!isLoggedIn() ? children : <Navigate to="/dashboard" replace />);

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public pages (redirect to dashboard if already logged in) */}
          <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

          {/* Protected pages (require login) */}
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
