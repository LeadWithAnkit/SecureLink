import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import SignInCard from './components/SignInCard';

// Use default theme - no need for external AppTheme
const defaultTheme = createTheme();

export default function Authentication(props) {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline enableColorScheme />
      <Container 
        component="main" 
        maxWidth="lg"
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={8}
          alignItems="center"
          justifyContent="center"
          sx={{ width: '100%' }}
        >
          {/* Left side - Branding */}
          <Stack spacing={2} sx={{ maxWidth: 500, textAlign: { xs: 'center', md: 'left' } }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              margin: 0,
              background: 'linear-gradient(45deg, magenta, #1976d2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              SecureLink
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              color: '#666',
              margin: 0
            }}>
              Connect with your loved ones securely. Cover your relationships at distance with end-to-end encryption and premium features.
            </p>
          </Stack>

          {/* Right side - Auth Card */}
          <SignInCard />
        </Stack>
      </Container>
    </ThemeProvider>
  );
}