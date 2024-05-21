import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Paper, List, ListItem, ListItemText, Card, CardContent } from '@mui/material';

const ViewSubmissions = () => {
  const { courseName, title } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [idealAnswer, setIdealAnswer] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isStudent = localStorage.getItem('student');

    if (token === null || isStudent === 'true') {
      console.log("Redirecting to login...");
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('http://localhost:3000/view_submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ courseName, title })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setSubmissions(data);

        // Extract instructions and ideal answer from the first submission
        if (data.length > 0) {
          setInstructions(data[0].instructions);
          setIdealAnswer(data[0].idealAnswer);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };

    fetchSubmissions();
  }, [courseName, title]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBackToLearningActivity = () => {
    navigate('/course', { state: { Name: courseName } });
  };


  const handleHome = () => {
    navigate('/dashboard');
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'show', textOverflow: 'ellipsis', maxWidth: '150%' }}>
            {courseName}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit" sx={{ maxWidth: 100, px: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)', backgroundColor: '#042a58' } }} onClick={handleBackToLearningActivity}>Back</Button>
          <Button color="inherit" sx={{ maxWidth: 100, px: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)', backgroundColor: '#042a58' }}} onClick={handleHome}>Home</Button>
          <Button color="inherit" sx={{ maxWidth: 100, px: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)', backgroundColor: '#042a58' } }} onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '4rem' }}>
        <Container>
          <Typography variant="h4" sx={{ mb: 3 }}>Submissions for {title} in {courseName}</Typography>
          <Card elevation={1} sx={{ mb: 3 }}>
            <CardContent>
              {instructions && <Typography variant="body1" sx={{ mb: 1 }}><strong>Instructions:</strong> {instructions}</Typography>}
              {idealAnswer && <Typography variant="body1" sx={{ mb: 1 }}><strong>Ideal Answer:</strong> {idealAnswer}</Typography>}
              {submissions.length === 0 ? (
                <Typography variant="body1" sx={{ color: '#666' }}>
                  Still waiting for a submission...
                </Typography>
              ) : (
                <List>
                  {submissions.map(submission => (
                    <ListItem key={submission._id} sx={{ mb: 2 }}>
                      <Paper elevation={3} sx={{ p: 2, width: '100%' }}>
                        <Typography variant="h6">{submission.studentName}</Typography>
                        <Typography variant="body1"><strong>Student Answer:</strong> {submission.answer}</Typography>
                        <Typography variant="body2"><strong>Submitted At:</strong> {new Date(submission.submittedAt).toLocaleString()}</Typography>
                      </Paper>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

        </Container>
      </Box>
    </Box>
  );
};

export default ViewSubmissions;
