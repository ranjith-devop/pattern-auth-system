import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Grid,
  Divider
} from '@mui/material';
import {
  Login as LoginIcon,
  Security as SecurityIcon,
  EmojiEmotions as EmojiIcon
} from '@mui/icons-material';
import AuthLayout from '../components/AuthLayout';
import PatternCanvas from '../components/PatternCanvas';
import PatternDisplay from '../components/PatternDisplay';
import EmojiSelector from '../components/EmojiSelector';
import { AuthService } from '../utils/authService';
import { PatternUtils } from '../utils/patternUtils'; // ✅ Fixed: Proper import

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');
  const [pattern, setPattern] = useState(null);
  const [emojis, setEmojis] = useState([]);
  const [loginStep, setLoginStep] = useState(1);
  const [patternResult, setPatternResult] = useState(null);

  const handlePatternSubmit = async () => {
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    if (!pattern || pattern.points.length < 3) {
      setError('Please draw your authentication pattern');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const users = AuthService.getUsers();
      const user = users.find(u => u.username === username);
      
      if (!user) {
        setError('User not found');
        setLoading(false);
        return;
      }

      // ✅ Fixed: Direct function call instead of require()
      const comparison = PatternUtils.comparePatterns(user.pattern, pattern, 50);
      setPatternResult(comparison);

      if (comparison.isMatch) {
        setSuccess(`Pattern accepted! Similarity: ${comparison.similarity}%`);
        setLoginStep(2);
      } else {
        setError(`Pattern doesn't match. Similarity: ${comparison.similarity}% (need >50%)`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiSubmit = async () => {
    if (emojis.length !== 3) {
      setError('Please select exactly 3 emojis');
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.login(username, pattern, emojis);
      setSuccess('Login successful! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetLogin = () => {
    setLoginStep(1);
    setPattern(null);
    setEmojis([]);
    setPatternResult(null);
    setError('');
    setSuccess('');
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Secure authentication with pattern and emoji verification"
    >
      <Box>
        {/* Progress Indicator */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Chip 
              icon={<SecurityIcon />}
              label="Pattern Authentication"
              color={loginStep === 1 ? 'primary' : patternResult?.isMatch ? 'success' : 'default'}
              variant={loginStep === 1 ? 'filled' : 'outlined'}
            />
            <Chip 
              icon={<EmojiIcon />}
              label="Emoji Verification"
              color={loginStep === 2 ? 'primary' : 'default'}
              variant={loginStep === 2 ? 'filled' : 'outlined'}
              disabled={loginStep === 1}
            />
          </Stack>
        </Box>

        {loginStep === 1 && (
          <Box>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Draw your authentication pattern
              </Typography>
              <PatternCanvas
                onPatternChange={setPattern}
                disabled={loading}
                showStats={true}
                width={400}
                height={300}
              />
            </Box>

            {patternResult && (
              <Card sx={{ mb: 3, bgcolor: patternResult.isMatch ? 'success.light' : 'error.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Pattern Analysis Results
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip 
                      label={`Similarity: ${patternResult.similarity}%`}
                      color={patternResult.isMatch ? 'success' : 'error'}
                      size="small"
                    />
                    <Chip 
                      label={`Distance: ${patternResult.details.avgDistance}px`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      label={`Points: ${patternResult.details.pointCount2}`}
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={handlePatternSubmit}
              disabled={loading || !username || !pattern}
              startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
              sx={{ mb: 3, py: 1.5 }}
            >
              {loading ? 'Analyzing Pattern...' : 'Verify Pattern'}
            </Button>
          </Box>
        )}

        {loginStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: 'success.main' }}>
              ✅ Pattern Verified Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Now select your 3 security emojis in the correct order
            </Typography>

            <EmojiSelector
              onEmojiChange={setEmojis}
              selectedEmojis={emojis}
              title="Enter Your Security Emojis"
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                onClick={resetLogin}
                variant="outlined"
                size="large"
                sx={{ minWidth: 120 }}
              >
                Start Over
              </Button>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={handleEmojiSubmit}
                disabled={loading || emojis.length !== 3}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Signing In...' : 'Complete Sign In'}
              </Button>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">🎉 {success}</Typography>
          </Alert>
        )}

        <Card sx={{ mb: 3, bgcolor: 'info.light' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              🔧 Demo Information
            </Typography>
            <Typography variant="body2">
              This system uses <strong>reduced accuracy</strong> pattern matching (50%+ similarity) 
              for easier demonstration. The pattern comparison is more lenient for better user experience.
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Pattern matching uses DTW-like algorithms with behavioral analysis
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
              sx={{ 
                textDecoration: 'none',
                fontWeight: 600,
                color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Create one here
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Login;
