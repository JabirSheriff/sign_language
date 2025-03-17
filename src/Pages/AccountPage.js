import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { auth } from '../firebase';
import { updateProfile, updatePassword } from 'firebase/auth';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

function AccountPage({ user }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    navigate('/'); // Redirect to landing if not logged in
    return null;
  }

  const handleUpdateName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: fullName });
      setSuccess('Name updated successfully!');
      setError('');
    } catch (err) {
      setError('Failed to update name.');
      setSuccess('');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      await updatePassword(auth.currentUser, newPassword);
      setSuccess('Password updated successfully!');
      setError('');
      setNewPassword('');
    } catch (err) {
      setError('Failed to update password. Log out and log in again if this persists.');
      setSuccess('');
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container sx={{ mt: 8, py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#007ACC' }}>
        Account Settings
      </Typography>
      <Box sx={{ maxWidth: 400, mx: 'auto' }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Email: {user.email} (cannot be changed)
        </Typography>

        {/* Update Full Name */}
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
        <Button
          variant="contained"
          sx={{ mt: 1, mb: 3, backgroundColor: '#007ACC' }}
          onClick={handleUpdateName}
        >
          Update Name
        </Button>

        {/* Update Password */}
        <TextField
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
        <Button
          variant="contained"
          sx={{ mt: 1, mb: 3, backgroundColor: '#007ACC' }}
          onClick={handleUpdatePassword}
        >
          Update Password
        </Button>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        {success && <Typography color="green" sx={{ mb: 2 }}>{success}</Typography>}
      </Box>
    </Container>
  );
}

export default AccountPage;