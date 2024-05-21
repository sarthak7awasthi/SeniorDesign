import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        navigate('/login');
        console.log('Signup successful');
      } else {
        const data = await response.json();
        setError(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setError('Error during signup');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight:700}}>
          Welcome to Learn AI
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Signup
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!email || !password || !confirmPassword}
            sx={{ mt: 2, fontWeight: 'bold' }}
          >
            SIGNUP
          </Button>
        </Box>
        <Button onClick={handleLoginRedirect} fullWidth sx={{ mt: 2, fontWeight: 'bold' }}>
          ALREADY HAVE AN ACCOUNT? LOGIN
        </Button>
      </Container>
    </Box>
  );
}

export default Signup;
