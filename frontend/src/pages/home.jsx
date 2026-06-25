import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import { Button, TextField, Typography, Box, AppBar, Toolbar } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}> 
            
            {/* Navigation Bar */}
            <AppBar position="static" elevation={1} sx={{ backgroundColor: 'white', color: '#202124' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 5%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.5px' }}>
                            LinkUp
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button 
                            color="inherit" 
                            startIcon={<RestoreIcon />} 
                            onClick={() => navigate("/history")}
                            sx={{ textTransform: 'none', fontSize: '1rem', fontWeight: 500 }}
                        >
                            History
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            endIcon={<LogoutIcon />} 
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/auth");
                            }}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: { xs: 4, md: 10 } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', gap: 6 }}>
                    
                    {/* Left Panel - Text & Input */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '500px' }}>
                        <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#202124' }}>
                            Premium video meetings. Now free for everyone.
                        </Typography>
                        
                        <Typography variant="h6" sx={{ color: '#5f6368', fontWeight: 400, mb: 2 }}>
                            We re-engineered the service we built for secure business meetings, Apna Video Call, to make it free and available for all.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
                            <TextField 
                                value={meetingCode}
                                onChange={e => setMeetingCode(e.target.value)} 
                                label="Enter meeting code" 
                                variant="outlined" 
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#ffffff' } }}
                            />
                            <Button 
                                onClick={handleJoinVideoCall} 
                                variant='contained' 
                                size="large"
                                sx={{ borderRadius: 2, backgroundColor: '#1a73e8', padding: '0 30px', fontSize: '1.1rem', textTransform: 'none', whiteSpace: 'nowrap', boxShadow: 'none' }}
                            >
                                Join
                            </Button>
                        </Box>
                    </Box>

                    {/* Right Panel - Seamless Illustration */}
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <img 
                            src='/logo3.png' 
                            alt="Video Call Illustration" 
                            style={{ 
                                width: '100%', 
                                maxWidth: '500px', 
                                height: 'auto', 
                                /* This is the magic CSS trick! It makes the white box around the image disappear */
                                mixBlendMode: 'multiply' 
                            }} 
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg"; }}
                        />
                    </Box>

                </Box>
            </Box>
        </Box>
    )
}

export default withAuth(HomeComponent)