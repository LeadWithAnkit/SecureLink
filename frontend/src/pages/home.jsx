import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField, Typography, Box, AppBar, Toolbar } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory, handleLogout, userData } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) {
            alert("Please enter a meeting code");
            return;
        }

        try {
            await addToUserHistory(meetingCode);
            navigate(`/meet?room=${meetingCode}`);
        } catch (error) {
            console.error("Error joining meeting:", error);
            navigate(`/meet?room=${meetingCode}`);
        }
    }

    const handleCreateNewMeeting = () => {
        const newMeetingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        navigate(`/meet?room=${newMeetingCode}`);
    }

    return (
        <div className="homeContainer">
            {/* Navigation Bar */}
            <AppBar position="static" className="navBar" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 'none' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <div className="navLeft">
                        <img src='/logo.png' alt='SecureLink Logo' style={{ height: '40px' }} />
                    </div>

                    <div className="navRight" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <IconButton 
                            onClick={() => navigate("/history")}
                            title="Meeting History"
                            sx={{ color: 'black' }}
                        >
                            <RestoreIcon />
                        </IconButton>
                        
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            Welcome, {userData?.name || 'User'}
                        </Typography>

                        <Button 
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            variant="outlined"
                            sx={{ 
                                borderColor: 'black', 
                                color: 'black',
                                '&:hover': {
                                    borderColor: 'magenta',
                                    backgroundColor: 'rgba(255, 0, 255, 0.04)'
                                }
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                </Toolbar>
            </AppBar>

            {/* Main Content - Matching Screenshot Style */}
            <div className="homeMainContainer">
                <div className="homeContent">
                    <div className="homeTextSection">
                        <Typography 
                            variant="h2" 
                            component="h1" 
                            gutterBottom 
                            sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                lineHeight: 1.2
                            }}
                        >
                            <span style={{color: "magenta"}}>Connect</span> with your loved Ones
                        </Typography>
                        
                        <Typography 
                            variant="h5" 
                            component="p" 
                            gutterBottom 
                            sx={{ 
                                color: 'text.secondary', 
                                mb: 4,
                                fontSize: { xs: '1.1rem', md: '1.3rem' }
                            }}
                        >
                            Cover your relation at distance by SecureLink
                        </Typography>

                        {/* Action Buttons */}
                        <div className="homeActionButtons">
                            <Button 
                                onClick={handleCreateNewMeeting}
                                variant="contained" 
                                size="large"
                                sx={{ 
                                    py: 2, 
                                    px: 4,
                                    fontSize: '1.1rem',
                                    backgroundColor: 'magenta',
                                    '&:hover': {
                                        backgroundColor: '#d400d4'
                                    },
                                    mr: 2
                                }}
                            >
                                Get Started
                            </Button>

                            <Button 
                                onClick={() => document.getElementById('joinMeetingSection').scrollIntoView({ behavior: 'smooth' })}
                                variant="outlined" 
                                size="large"
                                sx={{ 
                                    py: 2, 
                                    px: 4,
                                    fontSize: '1.1rem',
                                    borderColor: 'magenta',
                                    color: 'magenta',
                                    '&:hover': {
                                        borderColor: '#d400d4',
                                        backgroundColor: 'rgba(255, 0, 255, 0.04)'
                                    }
                                }}
                            >
                                Join Meeting
                            </Button>
                        </div>
                    </div>
                    
                    <div className="homeImageSection">
                        <img 
                            src='/mobile.png' 
                            alt="Video Call Illustration" 
                            className="homeMainImage"
                        />
                    </div>
                </div>

                {/* Join Meeting Section */}
                <div id="joinMeetingSection" className="joinMeetingSection">
                    <Box sx={{ 
                        textAlign: 'center', 
                        maxWidth: '600px', 
                        margin: '0 auto',
                        padding: '4rem 2rem'
                    }}>
                        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                            Join Existing Meeting
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                            <TextField 
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                                label="Enter Meeting Code" 
                                variant="outlined"
                                placeholder="e.g., ABC123"
                                sx={{ 
                                    minWidth: '250px',
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: 'magenta',
                                        },
                                    }
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleJoinVideoCall();
                                    }
                                }}
                            />
                            <Button 
                                onClick={handleJoinVideoCall}
                                variant="contained"
                                disabled={!meetingCode.trim()}
                                sx={{ 
                                    py: 1.5,
                                    px: 4,
                                    backgroundColor: 'magenta',
                                    '&:hover': {
                                        backgroundColor: '#d400d4'
                                    }
                                }}
                            >
                                Join Now
                            </Button>
                        </Box>

                        {/* Guest User Notice */}
                        {userData?.isGuest && (
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    mt: 3, 
                                    p: 2, 
                                    bgcolor: 'warning.light', 
                                    borderRadius: 2,
                                    color: 'warning.contrastText',
                                    display: 'inline-block'
                                }}
                            >
                                💡 You're using a guest account. Meeting history will not be saved.
                            </Typography>
                        )}
                    </Box>
                </div>
            </div>
        </div>
    )
}

export default withAuth(HomeComponent);