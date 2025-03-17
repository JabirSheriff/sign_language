import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Popper,
  Paper,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/system';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import LogoutIcon from '@mui/icons-material/Logout';

const StyledAppBar = styled(AppBar)({
  position: 'fixed', // Stick to top
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: '#007ACC', // VS Code blue
});

const CapsuleButton = styled(Button)({
  borderRadius: '20px', // Capsule shape
  backgroundColor: 'white',
  color: '#007ACC',
  padding: '6px 16px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#E0E0E0', // Light gray on hover
  },
});

const BigButton = styled(Button)({
  backgroundColor: '#007ACC',
  color: 'white',
  padding: '20px 40px',
  fontSize: '1.5rem',
  borderRadius: '12px',
  textTransform: 'none',
  width: '100%',
  '&:hover': {
    backgroundColor: '#005F9E', // Darker blue on hover
  },
});

function LandingPage({ user }) {
  const navigate = useNavigate();
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openTooltip, setOpenTooltip] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setOpenLogin(false);
      setEmail('');
      setPassword('');
      setError('');
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError('Wrong email or password!');
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      setSignupSuccess(true);
      setEmail('');
      setPassword('');
      setFullName('');
      setError('');
      setTimeout(() => {
        setOpenSignup(false);
        setSignupSuccess(false);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError('Signup failed—check your email/password!');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setOpenTooltip(false);
  };

  const handleToggleTooltip = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenTooltip(!openTooltip);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
                 {/* Navbar */}
      <StyledAppBar>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            SignVerse
          </Typography>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 2, color: 'white' }}>
                Hi {user.displayName}!
              </Typography>
              <Avatar sx={{ bgcolor: 'white', color: '#007ACC', mr: 1 }}>
                {user.displayName ? user.displayName[0].toUpperCase() : '?'}
              </Avatar>
              <IconButton onClick={handleToggleTooltip} sx={{ color: 'white' }}>
                {openTooltip ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              </IconButton>
              <Popper open={openTooltip} anchorEl={anchorEl} placement="bottom-end">
                <Paper sx={{ p: 1, minWidth: '150px' }}> {/* Wider tooltip */}
                  <Button
                    startIcon={<PersonIcon />}
                    onClick={() => navigate('/account')}
                    sx={{ 
                      color: '#007ACC', 
                      display: 'flex', 
                      justifyContent: 'flex-start', 
                      width: '100%', 
                      mb: 1,
                      textTransform: 'none' 
                    }}
                  >
                    Account
                  </Button>
                  <Button
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ 
                      color: '#007ACC', 
                      display: 'flex', 
                      justifyContent: 'flex-start', 
                      width: '100%',
                      textTransform: 'none' 
                    }}
                  >
                    Logout
                  </Button>
                </Paper>
              </Popper>
            </Box>
          ) : (
            <Box>
              <CapsuleButton
                sx={{ mr: 2 }}
                startIcon={<PersonIcon />}
                onClick={() => setOpenLogin(true)}
              >
                Login
              </CapsuleButton>
              <CapsuleButton
                onClick={() => setOpenSignup(true)}
                startIcon={<PersonIcon />}
              >
                Sign Up
              </CapsuleButton>
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>

      {/* Hero Section */}
      <Container sx={{ mt: 8 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#007ACC' }}>
            {user ? `Hey ${user.displayName}! Pick a section:` : 'Your SignVerse Hub'}
          </Typography>
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
            <Grid item xs={12} sm={5}>
              <BigButton onClick={() => navigate('/gesture-bot')}>
                Gesture Bot
              </BigButton>
            </Grid>
            <Grid item xs={12} sm={5}>
              <BigButton onClick={() => navigate('/chatbot')}>
                Chatbot
              </BigButton>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Login Popup */}
      <Dialog open={openLogin} onClose={() => !loading && setOpenLogin(false)}>
        <DialogTitle>Login to SignVerse</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Typography color="error">{error}</Typography>}
            </>
          )}
        </DialogContent>
        {!loading && (
          <DialogActions>
            <Button onClick={() => setOpenLogin(false)}>Cancel</Button>
            <Button onClick={handleLogin} color="primary">
              Login
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Signup Popup */}
      <Dialog open={openSignup} onClose={() => !loading && setOpenSignup(false)}>
        <DialogTitle>Sign Up for SignVerse</DialogTitle>
        <DialogContent>
          {loading ? (
            signupSuccess ? (
              <Typography variant="h6" align="center">
                Thank you for signing up! You are being redirected to SignVerse...
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )
          ) : (
            <>
              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Typography color="error">{error}</Typography>}
            </>
          )}
        </DialogContent>
        {!loading && !signupSuccess && (
          <DialogActions>
            <Button onClick={() => setOpenSignup(false)}>Cancel</Button>
            <Button onClick={handleSignup} color="primary">
              Sign Up
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
}

export default LandingPage;