import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('student', data.student);
        
        if (data.student) {
          localStorage.setItem('fullName', data.userData.fullName);
          navigate('/student_dashboard');
        } else {
          navigate('/dashboard');
        }

        console.log('Login successful');
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error during login');
    }
  };

  const handleSignupRedirect = () => {
    navigate('/');
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 700}}>
          Welcome to Learn AI
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Login
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontWeight: 'bold' }}
          >
            Login
          </Button>
        </Box>
        <Button onClick={handleSignupRedirect} fullWidth sx={{ mt: 2, fontWeight: 'bold' }}>
          DO NOT HAVE AN ACCOUNT? SIGNUP
        </Button>
      </Container>
    </Box>
  );
}

export default Login;
