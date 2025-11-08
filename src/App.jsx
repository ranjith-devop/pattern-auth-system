// App.js (or wherever you use Router)
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthService } from './utils/authService';

const isLoggedIn = () => Boolean(AuthService.getCurrentUser());

const RequireAuth = ({ children }) => (isLoggedIn() ? children : <Navigate to="/login" replace />);
const RedirectIfAuth = ({ children }) => (!isLoggedIn() ? children : <Navigate to="/dashboard" replace />);

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
