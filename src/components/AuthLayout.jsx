import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';

const AuthLayout = ({ children, title, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 2, md: 4 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)'
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isMobile ? 'auto' : '80vh'
          }}
        >
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 4,
              maxWidth: 800,
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                }}
              >
                <SecurityIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                {title}
              </Typography>
              
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 400, mx: 'auto' }}
              >
                {subtitle}
              </Typography>
            </Box>

            {/* Content */}
            {children}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
