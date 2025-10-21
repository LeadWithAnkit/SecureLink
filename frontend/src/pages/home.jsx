import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, IconButton, TextField, Typography } from '@mui/material';
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

    return (
        <>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h6" component="h2">
                        SecureLink
                    </Typography>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: '1rem' }}>
                    <IconButton onClick={() => navigate("/history")}>
                        <RestoreIcon />
                    </IconButton>
                    <Typography variant="body2">History</Typography>

                    <Button 
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                        variant="outlined"
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
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
                            />
                            <Button onClick={handleJoinVideoCall} variant='contained'>
                                Join
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img src='/logo.png' alt="SecureLink Logo" style={{ width: '100%', maxWidth: '400px' }} />
                </div>
            </div>
        </>
    );
}

export default withAuth(HomeComponent);