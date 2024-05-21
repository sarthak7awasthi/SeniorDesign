import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AppBar, Toolbar, Typography, Button, Box, Container, Card, CardContent, CardActions, Paper, TextField, List, ListItem, ListItemText } from '@mui/material';

function StudentActivity() {
    const { state } = useLocation();
    const [name, setName] = useState(state?.Name);
    const [title, setTitle] = useState(state?.Title);
    const [activity, setActivity] = useState(null);
    const [studentAnswer, setStudentAnswer] = useState('');
    const [messages, setMessages] = useState([]);
    const [lastAnswer, setLastAnswer] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const isStudent = localStorage.getItem('student');

        if (token === null || isStudent === 'false') {
            console.log("Redirecting to login...");
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await fetch('http://localhost:3000/get_individual_activity', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ courseName: name, title: title })
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch activity');
                }
                const data = await response.json();
                setActivity(data);
            } catch (error) {
                console.error('Error fetching activity:', error);
            }
        };
        if (name && title) {
            fetchActivity();
        }
    }, [name, title]);

    const handleChatSubmit = async (event) => {
        event.preventDefault();
        if (event.nativeEvent.submitter.id === 'ask-clara') {
            try {
                const data = {
                    question: activity.title,
                    ideal_answer: activity.idealAnswer,
                    student_answer: studentAnswer,
                };

                setMessages(prev => [...prev, { text: studentAnswer, type: 'student' }]);
                setLastAnswer(studentAnswer);

                const response = await fetch('https://Raj0102.pythonanywhere.com/get_feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error('Failed to get feedback');
                }
                const responseData = await response.json();
                setMessages(prev => [...prev, { text: responseData.feedback, type: 'feedback' }]);
                setStudentAnswer('');
            } catch (error) {
                console.error('ERROR:', error);
            }
        } else {
            const submissionData = {
                studentName: localStorage.getItem('fullName'),
                title: activity.title,
                courseName: activity.courseName,
                idealAnswer: activity.idealAnswer,
                instructions: activity.instructions,
                answer: lastAnswer
            };

            fetch('http://localhost:3000/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire({
                            title: 'Submitted!',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                    } else {
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to submit. Please try again.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                })
                .catch((error) => {
                    console.error('ERROR:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to submit. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });

            navigate('/student_course', { state: { Name: name } });
        }
    };

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

    const handleHome = () => {
        navigate('/student_dashboard');
    };

    const handleBack = () => {
        navigate('/student_course', { state: { Name: name } });
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(to bottom right, #f5f5f5, #ffffff)' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150%' }}>
                        Student Activity
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button color="inherit" sx={{ maxWidth: 100, px: 10, '&:hover': { transform: 'scale(1.03)', backgroundColor: '#042a58' } }} onClick={handleBack}>Back</Button>
              <Button color="inherit" sx={{ maxWidth: 100, px: 10, '&:hover': { transform: 'scale(1.03)', backgroundColor: '#042a58' } }} onClick={handleHome}>Home</Button>
              <Button color="inherit" sx={{ maxWidth: 100, px: 10, '&:hover': { transform: 'scale(1.03)', backgroundColor: '#042a58' } }} onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '4rem' }}>
                <Container>
                    {activity && (
                        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>{activity.title}</Typography>
                                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Roboto, sans-serif', fontWeight: 550 }}>
                                    {activity.instructions}</Typography>
                                {/* <Typography variant="body1" sx={{ mb: 2 }}>Ideal Answer: {activity.idealAnswer}</Typography> */}
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Materials</Typography>
                                    <List>
                                        {activity.materials.map((material, index) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={<a href={material}>{material}</a>} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5">Chat Area</Typography>
                        <Paper sx={{ p: 2, mb: 2, maxHeight: '400px', minHeight: '100px', overflow: 'auto', borderRadius: 2, boxShadow: 3 }}>
                            {messages.map((msg, index) => (
                                <Box key={index} sx={{ textAlign: msg.type === 'student' ? 'right' : 'left', mb: 1 }}>
                                    <Typography variant="body2" component="p" sx={{ display: 'inline-block', bgcolor: msg.type === 'student' ? '#e0f7fa' : '#f1f8e9', p: 1, borderRadius: 1 }}>
                                        {msg.text}
                                    </Typography>
                                </Box>
                            ))}
                        </Paper>
                        <Box component="form" onSubmit={handleChatSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                value={studentAnswer}
                                onChange={e => setStudentAnswer(e.target.value)}
                                placeholder="Your answer"
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                sx={{
                                    bgcolor: 'background.paper', // Ensures a proper background color
                                    borderRadius: 1,             // Adds some border radius for better appearance
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.23)', // Default border color
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#007BFF', // Change border color on hover
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#007BFF', // Change border color when focused
                                        },
                                    },
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                <Button id="ask-clara" type="submit" variant="contained" color="primary" sx={{ backgroundColor: '#007bff' }}>
                                    Ask Clara
                                </Button>
                                <Button
                                    id="submit-button"
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    sx={{
                                        backgroundColor: '#28a745',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: '#218838',
                                            transform: 'scale(1.02)',
                                        },
                                    }}
                                >
                                    SUBMIT
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}

export default StudentActivity;
