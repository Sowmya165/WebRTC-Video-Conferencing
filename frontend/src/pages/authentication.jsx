import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';

const defaultTheme = createTheme();

export default function Authentication() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
            }
        } catch (err) {
            console.log(err);
            let msg = err.response?.data?.message || "An error occurred";
            setError(msg);
        }
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                {/* Left Panel - Modern Gradient Design */}
                {/* Left Panel - Image with Dark Overlay */}
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        // You can replace this URL with your own image, or use '/background.png' if you have one in your public folder
                        backgroundImage: 'url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        padding: 4,
                        textAlign: 'center',
                        position: 'relative',
                        // This creates the professional dark tint over the image
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)', // 60% dark overlay
                            zIndex: 1
                        },
                        // This ensures the text stays above the dark overlay
                        '& > *': {
                            zIndex: 2,
                            position: 'relative'
                        }
                    }}
                >
                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
                        LinkUp
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 300, maxWidth: '500px' }}>
                        Connect face-to-face with anyone, anywhere. High-quality video meetings right from your browser.
                    </Typography>
                </Grid>

                {/* Right Panel - Form */}
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={12} square sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                            px: { xs: 2, md: 6 }
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: '#1a73e8', width: 56, height: 56 }}>
                            <LockOutlinedIcon fontSize="large" />
                        </Avatar>
                        
                        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                            {formState === 0 ? "Welcome Back" : "Create an Account"}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3, width: '100%' }}>
                            <Button 
                                fullWidth 
                                variant={formState === 0 ? "contained" : "outlined"} 
                                onClick={() => { setFormState(0); setError(""); }}
                                sx={{ borderRadius: 2 }}
                            >
                                Sign In
                            </Button>
                            <Button 
                                fullWidth 
                                variant={formState === 1 ? "contained" : "outlined"} 
                                onClick={() => { setFormState(1); setError(""); }}
                                sx={{ borderRadius: 2 }}
                            >
                                Sign Up
                            </Button>
                        </Box>

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
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center', minHeight: '20px' }}>
                                {error}
                            </Typography>

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem', borderRadius: 2, backgroundColor: '#1a73e8' }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login" : "Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message}
            />
        </ThemeProvider>
    );
}