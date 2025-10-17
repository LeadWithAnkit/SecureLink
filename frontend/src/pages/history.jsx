import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, IconButton, Typography, Snackbar, Alert } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [error, setError] = useState(''); // For Snackbar
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (err) {
                setError('Failed to fetch history');
                setOpenSnackbar(true);
            }
        };
        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <div style={{ padding: '1rem' }}>
            {/* Home button */}
            <IconButton onClick={() => navigate("/home")}>
                <HomeIcon />
            </IconButton>

            {/* Meetings list */}
            {meetings.length > 0 ? (
                meetings.map((meeting, i) => (
                    <Card key={i} variant="outlined" sx={{ marginBottom: 2 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                Code: {meeting.meetingCode}
                            </Typography>
                            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                Date: {formatDate(meeting.date)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Typography>No meeting history found.</Typography>
            )}

            {/* Snackbar for errors */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </div>
    );
}

