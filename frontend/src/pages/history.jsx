import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, AppBar, Toolbar, IconButton, Grid, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VideocamIcon from '@mui/icons-material/Videocam';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function History() {
    let navigate = useNavigate();
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // This grabs the history using the function from your context
                const history = await getHistoryOfUser();
                setMeetings(history || []);
            } catch (e) {
                console.log("Error fetching history", e);
            }
        }
        fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
            
            {/* Navigation Bar (Matches Home Page) */}
            <AppBar position="static" elevation={1} sx={{ backgroundColor: 'white', color: '#202124' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 5%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.5px' }}>
                            LinkUp {/* Or Apna Video Call, whichever you chose! */}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                            onClick={() => navigate("/home")}
                            sx={{ backgroundColor: '#f1f3f4', color: '#202124', '&:hover': { backgroundColor: '#e8eaed' } }}
                        >
                            <HomeIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Container maxWidth="md" sx={{ mt: 6, mb: 6, flex: 1 }}>
                
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#202124', mb: 1 }}>
                        Meeting History
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: '#5f6368' }}>
                        A record of all the video calls you have joined.
                    </Typography>
                </Box>

                {/* History Grid */}
                {meetings.length > 0 ? (
                    <Grid container spacing={3}>
                        {meetings.map((item, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card 
                                    sx={{ 
                                        borderRadius: 3, 
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                                        transition: 'all 0.2s ease-in-out',
                                        border: '1px solid #e8eaed',
                                        '&:hover': { 
                                            transform: 'translateY(-5px)', 
                                            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                                            borderColor: '#1a73e8'
                                        } 
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                                            <Box sx={{ backgroundColor: '#e3f2fd', p: 1, borderRadius: 2, display: 'flex' }}>
                                                <VideocamIcon sx={{ color: '#1a73e8' }} />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#202124', wordBreak: 'break-all' }}>
                                                {item.meetingCode}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#5f6368' }}>
                                            <CalendarTodayIcon sx={{ fontSize: '1.1rem' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {formatDate(item.date)}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    /* Empty State - If user has no history yet */
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 10, p: 4, backgroundColor: 'white', borderRadius: 4, border: '1px dashed #dadce0' }}>
                        <VideocamIcon sx={{ fontSize: 60, color: '#dadce0', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#5f6368', fontWeight: 500 }}>
                            No meeting history found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#80868b', mt: 1 }}>
                            Join a meeting from the home page to see it listed here!
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}