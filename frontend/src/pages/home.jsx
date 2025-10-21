import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, IconButton, TextField, Typography, Box } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) {
            alert("Please enter a meeting code");
            return;
        }
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    }

    // Background style
    const backgroundStyle = {
        backgroundImage: "url('/background2.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        position: 'relative'
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1
    };

    const contentStyle = {
        position: 'relative',
        zIndex: 2,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
    };

    return (
        <div style={backgroundStyle}>
            <div style={overlayStyle}></div>
            <div style={contentStyle}>
                <div className="navBar">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h6" component="h2" style={{ color: 'white' }}>
                            SecureLink
                        </Typography>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: '1rem' }}>
                        <IconButton 
                            onClick={() => navigate("/history")}
                            style={{ color: 'white' }}
                        >
                            <RestoreIcon />
                        </IconButton>
                        <Typography variant="body2" style={{ color: 'white' }}>History</Typography>

                        <Button 
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/auth");
                            }}
                            variant="outlined"
                            style={{ color: 'white', borderColor: 'white' }}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="meetContainer">
                    <div className="leftPanel">
                        <Box sx={{ 
                            background: 'rgba(255, 255, 255, 0.95)', 
                            padding: 3, 
                            borderRadius: 2,
                            boxShadow: 3
                        }}>
                            <Typography variant="h4" gutterBottom>
                                Providing Quality Video Call Just Like Quality Education
                            </Typography>

                            <div style={{ display: 'flex', gap: "10px", alignItems: 'center', marginTop: '2rem' }}>
                                <TextField 
                                    onChange={e => setMeetingCode(e.target.value)} 
                                    id="meeting-code" 
                                    label="Meeting Code" 
                                    variant="outlined" 
                                    value={meetingCode}
                                    size="small"
                                    fullWidth
                                />
                                <Button onClick={handleJoinVideoCall} variant='contained' size="large">
                                    Join
                                </Button>
                            </div>
                        </Box>
                    </div>
                    <div className='rightPanel'>
                        <Box sx={{ 
                            background: 'rgba(255, 255, 255, 0.95)', 
                            padding: 3, 
                            borderRadius: 2,
                            boxShadow: 3
                        }}>
                            <img 
                                src='/logo.png' 
                                alt="SecureLink Logo" 
                                style={{ 
                                    width: '100%', 
                                    maxWidth: '400px',
                                    borderRadius: '10px'
                                }} 
                            />
                        </Box>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(HomeComponent);