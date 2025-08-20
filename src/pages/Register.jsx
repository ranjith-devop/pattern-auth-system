import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Link,
  CircularProgress,
  Grid
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';
import AuthLayout from '../components/AuthLayout';
import PatternCanvas from '../components/PatternCanvas';
import PatternDisplay from '../components/PatternDisplay';
import EmojiSelector from '../components/EmojiSelector';
import { AuthService } from '../utils/authService';
import { PatternUtils } from '../utils/patternUtils'; // ✅ Fixed: Proper import at the top

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    pattern: null,
    confirmPattern: null,
    emojis: []
  });

  const steps = [
    'Account Information',
    'Create Pattern',
    'Confirm Pattern',
    'Select Emojis'
  ];

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const handlePatternChange = (field) => (patternData) => {
    setFormData(prev => ({
      ...prev,
      [field]: patternData
    }));
    setError('');
  };

  const handleEmojiChange = (emojis) => {
    setFormData(prev => ({
      ...prev,
      emojis
    }));
    setError('');
  };

  // ✅ Fixed: Moved comparison logic to separate function to avoid re-computation
  const comparePatterns = (pattern1, pattern2) => {
    if (!pattern1 || !pattern2) return { isMatch: false, similarity: 0 };
    return PatternUtils.comparePatterns(pattern1, pattern2, 60); // Lenient threshold
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.username.trim() || !formData.email.trim()) {
          setError('Please fill in all fields');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (formData.username.length < 3) {
          setError('Username must be at least 3 characters long');
          return false;
        }
        return true;
      
      case 1:
        if (!formData.pattern || formData.pattern.points.length < 5) {
          setError('Please draw a pattern with at least 5 points');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.confirmPattern) {
          setError('Please confirm your pattern');
          return false;
        }
        // ✅ Fixed: Use the separate function
        const comparison = comparePatterns(formData.pattern, formData.confirmPattern);
        if (!comparison.isMatch) {
          setError(`Patterns don't match closely enough. Similarity: ${comparison.similarity}% (need >60%)`);
          return false;
        }
        return true;
      
      case 3:
        if (formData.emojis.length !== 3) {
          setError('Please select exactly 3 emojis');
          return false;
        }
        return true;
      
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleRegister = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      const user = AuthService.register(
        formData.username,
        formData.email,
        formData.pattern,
        formData.emojis
      );
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={formData.username}
              onChange={handleInputChange('username')}
              sx={{ mb: 3 }}
              helperText="At least 3 characters"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleInputChange('email')}
              helperText="Valid email address required"
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Draw a unique pattern that you can remember easily. This will be your primary authentication method.
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <PatternCanvas
                  onPatternChange={handlePatternChange('pattern')}
                  showStats={true}
                  width={350}
                  height={250}
                />
              </Grid>
              {formData.pattern && (
                <Grid item xs={12} md={6}>
                  <PatternDisplay 
                    patternData={formData.pattern}
                    title="Your Pattern"
                    showControls={true}
                    showStats={true}
                    width={350}
                    height={250}
                    autoPlay={true}
                  />
                </Grid>
              )}
            </Grid>
            
            {formData.pattern && (
              <Alert severity="success" sx={{ mt: 3 }}>
                Great! Pattern saved with {formData.pattern.points.length} points.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Draw the same pattern again to confirm. Try to match the shape and flow as closely as possible.
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <PatternDisplay 
                  patternData={formData.pattern}
                  title="Original Pattern"
                  showControls={false}
                  width={300}
                  height={200}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <PatternCanvas
                  onPatternChange={handlePatternChange('confirmPattern')}
                  width={300}
                  height={200}
                />
              </Grid>
            </Grid>
            
            {/* ✅ Fixed: Moved comparison logic to avoid re-computation */}
            {formData.confirmPattern && (() => {
              const comparison = comparePatterns(formData.pattern, formData.confirmPattern);
              return (
                <Alert 
                  severity={comparison.isMatch ? 'success' : 'warning'} 
                  sx={{ mt: 3 }}
                >
                  {comparison.isMatch 
                    ? `Perfect! Patterns match with ${comparison.similarity}% similarity`
                    : `Patterns don't match well enough. Similarity: ${comparison.similarity}% (need >60%)`
                  }
                </Alert>
              );
            })()}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Select exactly 3 emojis in order. This will be your secondary authentication method.
            </Typography>
            
            <EmojiSelector
              onEmojiChange={handleEmojiChange}
              selectedEmojis={formData.emojis}
              title="Choose Your 3 Security Emojis"
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register with pattern and emoji authentication"
    >
      <Box>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {label}
                </Typography>
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}
                
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                  </Alert>
                )}

                <Box sx={{ mt: 3, mb: 2 }}>
                  <Button
                    disabled={loading}
                    onClick={index === steps.length - 1 ? handleRegister : handleNext}
                    variant="contained"
                    size="large"
                    sx={{ mr: 2, minWidth: 120 }}
                    startIcon={loading && <CircularProgress size={16} />}
                  >
                    {loading ? 'Creating...' : (index === steps.length - 1 ? 'Create Account' : 'Next Step')}
                  </Button>
                  <Button
                    disabled={index === 0 || loading}
                    onClick={handleBack}
                    size="large"
                    sx={{ minWidth: 100 }}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {success && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CheckIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" color="success.main">
              Account Created Successfully!
            </Typography>
          </Box>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ 
                textDecoration: 'none',
                fontWeight: 600,
                color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Register;
