import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Link,
  Divider,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Google } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SignInCard() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (isSignUp) {
      if (!formData.name) {
        setError('Please enter your name');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const payload = isSignUp 
        ? { 
            name: formData.name, 
            username: formData.username, 
            password: formData.password 
          }
        : { 
            username: formData.username, 
            password: formData.password 
          };

      const response = await axios.post(`http://localhost:8000${endpoint}`, payload);

      if (response.data.message === (isSignUp ? 'User registered successfully' : 'Login successful')) {
        if (!isSignUp) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        navigate(isSignUp ? '/auth' : '/dashboard'); // Redirect to auth page after signup
        if (!isSignUp) {
          window.location.reload(); // Refresh to update auth state
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

//   const handleGoogleAuth = () => {
//     // Redirect to Google OAuth (you can implement this later)
//     window.location.href = 'http://localhost:5000/api/auth/google';
//   };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        width: '100%', 
        maxWidth: 400,
        borderRadius: 2
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="bold">
        {isSignUp ? 'Create Account' : 'Welcome back'}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        {isSignUp ? 'Please enter your details' : 'Sign in to your account'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {isSignUp && (
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            size="small"
          />
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
          size="small"
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          value={formData.password}
          onChange={handleChange}
          size="small"
        />

        {isSignUp && (
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            size="small"
          />
        )}

        {!isSignUp && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <FormControlLabel
              control={<Checkbox size="small" color="primary" />}
            />
          </Box>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (isSignUp ? 'Sign up' : 'Sign in')}
        </Button>

        <Divider sx={{ my: 2 }}>OR</Divider>

        {/* <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleAuth}
          sx={{ mb: 2, py: 1 }}
        >
          Sign {isSignUp ? 'up' : 'in'} with Google
        </Button> */}

        <Box textAlign="center">
          <Typography variant="body2">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link 
              component="button" 
              type="button" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({
                  name: '',
                  username: '',
                  password: '',
                  confirmPassword: ''
                });
              }}
              variant="body2"
              fontWeight="bold"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}