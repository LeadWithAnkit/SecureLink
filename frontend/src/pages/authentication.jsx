import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar, Alert } from '@mui/material';

const defaultTheme = createTheme();

export default function Authentication() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    // Test background image on component mount
    React.useEffect(() => {
        console.log("Testing background image...");
        const img = new Image();
        img.src = '/background2.jpg';
        img.onload = () => console.log("Background image loaded successfully");
        img.onerror = () => console.log("Background image failed to load - check if file exists in public folder");
    }, []);

    const handleAuth = async () => {
        if (!username || !password) {
            setError("Username and password are required");
            return;
        }

        if (formState === 1 && !name) {
            setError("Name is required for registration");
            return;
        }

        setLoading(true);
        setError("");

        try {
            if (formState === 0) {
                await handleLogin(username, password);
            } else if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setMessage(result || "Registration successful!");
                setOpen(true);
                setError("");
                setName("");
                setUsername("");
                setPassword("");
                setFormState(0);
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    const handleCloseSnackbar = () => {
        setOpen(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAuth();
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <div style={{
                display: 'flex',
                height: '100vh',
                background: "url('/background2.jpg') no-repeat center center fixed",
                backgroundSize: 'cover',
                position: 'relative'
            }}>
                {/* Dark overlay for better readability */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)'
                }}></div>
                
                {/* Left spacer - for larger screens */}
                <div style={{ 
                    flex: 1,
                    display: { xs: 'none', md: 'block' } 
                }}></div>
                
                {/* Right form panel */}
                <div style={{
                    flex: '0 0 500px',
                    background: 'white',
                    padding: '2rem',
                    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 2,
                    overflowY: 'auto'
                }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <Typography component="h1" variant="h5" gutterBottom>
                            {formState === 0 ? "Sign In" : "Sign Up"}
                        </Typography>

                        <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
                            <Button 
                                variant={formState === 0 ? "contained" : "outlined"} 
                                onClick={() => { setFormState(0); setError(""); }}
                                disabled={loading}
                                fullWidth
                            >
                                Sign In
                            </Button>
                            <Button 
                                variant={formState === 1 ? "contained" : "outlined"} 
                                onClick={() => { setFormState(1); setError(""); }}
                                disabled={loading}
                                fullWidth
                            >
                                Sign Up
                            </Button>
                        </div>

                        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    value={name}
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={loading}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus={formState === 0}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                id="password"
                                disabled={loading}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mt: 1 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleAuth}
                                disabled={loading}
                                size="large"
                            >
                                {loading ? "Processing..." : (formState === 0 ? "Login" : "Register")}
                            </Button>
                        </Box>
                    </Box>
                </div>
            </div>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}