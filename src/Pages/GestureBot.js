import React from 'react';
import { Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function GestureBot({ user }) {
  const navigate = useNavigate();

  if (!user) {
    navigate('/'); // Go back if not logged in
    return null;
  }

  return (
    <Container>
      <Typography variant="h3" sx={{ my: 4 }}>
        Gesture Bot
      </Typography>
      <Typography variant="body1">
        Camera and avatar stuff coming here soon!
      </Typography>
    </Container>
  );
}

export default GestureBot;