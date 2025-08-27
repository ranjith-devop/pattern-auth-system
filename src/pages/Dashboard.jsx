import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  Avatar,
  Grid,
  Chip,
  Stack,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  Security as SecurityIcon,
  AccountCircle as ProfileIcon,
  Timeline as StatsIcon,
  AccessTime as TimeIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Draw as DrawIcon,
  EmojiEmotions as EmojiIcon
} from '@mui/icons-material';
import { AuthService } from '../utils/authService';
import PatternDisplay from '../components/PatternDisplay';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          mb: 4 
        }}
      >
        <Toolbar>
          <SecurityIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pattern Auth Dashboard
          </Typography>
          <Button 
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Welcome back, {user.username}! 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You've successfully authenticated using our advanced pattern + emoji system.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* User Profile Card */}
          <Grid item xs={12} lg={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      mr: 2,
                      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                    }}
                  >
                    <ProfileIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h2">
                      Profile
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Account information
                    </Typography>
                  </Box>
                </Box>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Username"
                      secondary={user.username}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={user.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Created"
                      secondary={formatDate(user.createdAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Login"
                      secondary={formatDate(user.lastLogin)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Methods Card */}
          <Grid item xs={12} lg={8}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Your Security Methods
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Multi-factor authentication with pattern and emoji verification
                </Typography>

                <Grid container spacing={3}>
                  {/* Pattern Authentication */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DrawIcon sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Pattern Authentication
                        </Typography>
                      </Box>
                      {user.pattern && user.pattern.stats ? (
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            ✅ Pattern registered with {user.pattern.points.length} points
                          </Typography>
                          <Typography variant="body2">
                            ⏱️ Drawing time: {(user.pattern.stats.totalTime / 1000).toFixed(1)}s
                          </Typography>
                          <Typography variant="body2">
                            🖊️ Average speed: {user.pattern.stats.avgSpeed.toFixed(1)} pts/s
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2">Pattern data available</Typography>
                      )}
                    </Paper>
                  </Grid>

                  {/* Emoji Authentication */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EmojiIcon sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Emoji Authentication
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Your security emojis:
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {user.emojis && user.emojis.map((emoji, index) => (
                          <Chip
                            key={index}
                            label={`${index + 1}. ${emoji}`}
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.2)',
                              color: 'inherit',
                              fontSize: '1rem'
                            }}
                          />
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Pattern Visualization */}
          {user.pattern && (
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Your Authentication Pattern
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Visualization of your registered pattern with interactive playback
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <PatternDisplay 
                      patternData={user.pattern}
                      title="Registered Authentication Pattern"
                      showControls={true}
                      showStats={true}
                      width={500}
                      height={300}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Security Features Card */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Advanced Security Features
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  State-of-the-art authentication capabilities implemented in this system
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                      <DrawIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="subtitle2" gutterBottom color="primary.main">
                        Pattern Recognition
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Advanced DTW algorithms
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light' }}>
                      <EmojiIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                      <Typography variant="subtitle2" gutterBottom color="secondary.main">
                        Emoji Verification
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Secondary authentication
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                      <TimeIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="subtitle2" gutterBottom color="success.main">
                        Behavioral Analysis
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Timing and speed detection
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                      <SecurityIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="subtitle2" gutterBottom color="warning.main">
                        Adaptive Security
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Smart tolerance algorithms
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Demo Success Card */}
          <Grid item xs={12}>
            <Card elevation={3} sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'success.main' }}>
                  🎉 Demo Completed Successfully!
                </Typography>
                <Typography variant="body1" paragraph>
                  Congratulations! You have successfully completed the advanced pattern-based authentication demo 
                  with emoji secondary verification. This system demonstrates:
                </Typography>
                
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  <Chip label="Pattern Registration" color="primary" />
                  <Chip label="Behavioral Analysis" color="secondary" />
                  <Chip label="Emoji Authentication" color="success" />
                  <Chip label="Secure Authentication" color="info" />
                  <Chip label="Responsive Design" color="warning" />
                  <Chip label="Modern UI/UX" color="error" />
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This implementation includes advanced features like Dynamic Time Warping (DTW) for pattern comparison, 
                  behavioral biometrics analysis, emoji-based secondary authentication, and adaptive security algorithms. 
                  The system is fully responsive and works across all device sizes with reduced accuracy matching 
                  for better user experience.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {user.pattern?.points?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pattern Points Recorded
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary.main" fontWeight="bold">
                        3
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Security Emojis Set
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        50%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pattern Match Threshold
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate('/register')}
                      size="large"
                    >
                      Create Another Account
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleLogout}
                      size="large"
                    >
                      Try Different Login
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => window.location.reload()}
                      size="large"
                    >
                      Refresh Dashboard
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Information Card */}
          <Grid item xs={12}>
            <Card elevation={3} sx={{ bgcolor: 'info.light' }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'info.main' }}>
                  🔧 System Information & Technical Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'info.dark' }}>
                      Authentication Methods:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0 }}>
                        <Typography variant="body2">
                          • <strong>Primary:</strong> Pattern-based drawing authentication
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <Typography variant="body2">
                          • <strong>Secondary:</strong> 3-emoji sequence verification
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <Typography variant="body2">
                          • <strong>Behavioral:</strong> Drawing speed and timing analysis
                        </Typography>
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'info.dark' }}>
                      Technical Features:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0 }}>
                        <Typography variant="body2">
                          • <strong>Algorithm:</strong> Dynamic Time Warping (DTW)
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <Typography variant="body2">
                          • <strong>Accuracy:</strong> Reduced threshold (50%+) for demo
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <Typography variant="body2">
                          • <strong>Storage:</strong> Local browser storage
                        </Typography>
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <Typography variant="body2">
                          • <strong>Framework:</strong> React + Vite + Material-UI
                        </Typography>
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> This is a demonstration system with reduced security thresholds 
                    for easier testing. Production systems would implement stricter matching criteria, 
                    server-side validation, encrypted storage, and additional security measures.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box sx={{ mt: 6, pb: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Pattern-based Authentication System Demo • Built with React + Vite + Material-UI
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Advanced biometric authentication with reduced accuracy for demonstration purposes
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
