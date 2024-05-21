import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemText, Box, Container, Modal, TextField, MenuItem } from '@mui/material';
import CreateActivityModal from './CreateActivityModal';

function ViewCourse() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const name = state?.Name;
    const [courseInfo, setCourseInfo] = useState({});
    const [courseName, setCourseName] = useState(name || '');
    const [fileUrl, setFileUrl] = useState('');
    const [currentSection, setCurrentSection] = useState('learning-activities');
    const [learningActivities, setLearningActivities] = useState([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [message, setmessage] = useState(false);
    const [isEnrollModalOpen, setEnrollModalOpen] = useState(false);
    const [enrollFormData, setEnrollFormData] = useState({ fullName: '', email: '', courseName });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const isStudent = localStorage.getItem('student');

        if (token === null || isStudent === 'true') {
            console.log("Redirecting to login...");
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const getCourseFile = async () => {
          try {
         
         
            const response = await fetch(`http://localhost:3000/get_course_file/${courseName}`);
            if (!response.ok) {
              throw new Error('Failed to fetch');
            }
            const data = await response.json();
    
         
            const { url } = data;
            console.log("url", data)
            setFileUrl(url);
          } catch (error) {
            console.error('Error fetching course file:', error);
       
          }
        };
    
        getCourseFile();
    
        return () => {
      
        };
      }, []);

    useEffect(() => {
        const fetchCourseInfo = async () => {
            try {
                const response = await fetch('http://localhost:3000/get_course_info', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ courseName: state.Name })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch course information');
                }

                const courseData = await response.json();
                console.log("info", courseData);
                setCourseInfo(courseData);
            } catch (error) {
                console.error('Error fetching course information:', error);
            }
        };

        fetchCourseInfo();
    }, [state?.Name]);

    useEffect(() => {
        const fetchLearningActivities = async () => {
            try {
                const response = await fetch('http://localhost:3000/get_student_activities', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ courseName: state.Name })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch learning activities');
                }

                const activitiesData = await response.json();
                setLearningActivities(activitiesData);
            } catch (error) {
                console.error('Error fetching learning activities:', error);
            }
        };

        fetchLearningActivities();
    }, [state?.Name, isCreateModalOpen]);

    const handleCreateActivity = async (formData) => {
        try {
            const holder = { courseName: state.Name, title: formData.title, materials: [], instructions: formData.instructions, idealAnswer: formData.idealAnswer };
            console.log("Holder", holder);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/add_activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(holder)
            });

            if (!response.ok) {
                throw new Error('Failed to create learning activity');
            }
            setCreateModalOpen(false);
            setmessage(false);

        } catch (error) {
            console.error('Error creating learning activity:', error);
        }
    };

    const handleEnrollStudent = async (event) => {
        event.preventDefault();
        try {
            console.log("data", enrollFormData);
            const response = await fetch('http://localhost:3000/enroll_student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enrollFormData)
            });

            if (!response.ok) {
                throw new Error('Failed to enroll student');
            }
            setEnrollModalOpen(false);
            navigate('/course', { state: { Name: courseName } });
        } catch (error) {
            console.error('Error enrolling student:', error);
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
        navigate('/dashboard');
    };

    const handleActivityClick = (activity) => {
        navigate(`/course/${courseName}/activity/${activity.title}/submissions`, { state: { courseName, title: activity.title } });
    };

    return (
        <Box sx={{ display: 'flex', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 3, whiteSpace: 'nowrap', overflow: 'show', textOverflow: 'ellipsis', maxWidth: '150%' }}>
                        {courseName}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button color="inherit" sx={{ maxWidth: 100, px: 10 }} onClick={handleHome}>Home</Button>
                    <Button color="inherit" sx={{ maxWidth: 100, px: 10 }} onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', backgroundColor: '#5A9BD5', color: 'white' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {['Learning Activities', 'Past Assignments', 'Course Info', 'Syllabus', 'Contact Information', 'Announcements'].map((text) => (
                            <ListItem button key={text} onClick={() => setCurrentSection(text.replace(' ', '-').toLowerCase())}>
                                <ListItemText primary={text} sx={{ color: '#FFFFFF' }} />
                            </ListItem>
                        ))}
                        <ListItem button onClick={() => setEnrollModalOpen(true)}>
                            <ListItemText primary="Enroll a student" sx={{ color: '#FFFFFF' }} />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Container sx={{ mt: 4 }}>
                    {currentSection === 'course-info' && <Box sx={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '1rem' }}>Head over to the course info page to get started.</Box>}
                    {currentSection === 'syllabus' && (
    <Box sx={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '1rem' }}>
        <Typography variant="h6" sx={{ marginBottom: '1rem' }}>Syllabus</Typography>
        {/* Replace the below anchor tag with your file link */}
        {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer">Syllabus File</a>}
    </Box>
)}

                    {currentSection === 'contact-information' && <Box sx={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '1rem' }}>Contact information...</Box>}
                    {currentSection === 'announcements' && <Box sx={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '1rem' }}>Announcements...</Box>}
                    <Button variant="contained" color="primary" onClick={() => setCreateModalOpen(true)} sx={{ mb: 2 }}>
                        Create Activity
                    </Button>
                    {currentSection === 'learning-activities' && (
                        <Box sx={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '1rem' }}>
                            {learningActivities.length === 0 ? (
                                <Typography variant="body1" sx={{ color: '#333' }}>
                                    No Learning Activity yet, hit the Create Activity button to add!
                                </Typography>
                            ) : (
                                learningActivities.map(activity => (
                                    <Box
                                        key={activity._id}
                                        sx={{
                                            mb: 2,
                                            p: 2,
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s, transform 0.3s',
                                            '&:hover': {
                                                backgroundColor: '#e0e0e0',
                                                transform: 'translateY(-2px)',
                                            }
                                        }}
                                        onClick={() => handleActivityClick(activity)}
                                    >
                                        <Typography variant="h6">{activity.title}</Typography>
                                        <Typography>Status: {activity.status ? 'Open' : 'Locked'}</Typography>
                                    </Box>
                                ))
                            )}
                        </Box>
                    )}


                </Container>
            </Box>
            <CreateActivityModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onCreate={handleCreateActivity} />
            <Modal
                open={isEnrollModalOpen}
                onClose={() => setEnrollModalOpen(false)}
                aria-labelledby="enroll-student-modal"
                aria-describedby="enroll-student-form"
            >
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 4,
                    m: 4,
                    bgcolor: 'background.paper',
                    borderRadius: '8px',
                    maxWidth: 400,  // Set maximum width
                    width: '90%',   // Set width to 90% to make it responsive
                    mx: 'auto'      // Center the box horizontally
                }}>
                    <Typography id="enroll-student-modal" variant="h6" component="h2">
                        Enroll Student
                    </Typography>
                    <form onSubmit={handleEnrollStudent}>
                        <TextField
                            label="Full Name"
                            value={enrollFormData.fullName}
                            onChange={(e) => setEnrollFormData({ ...enrollFormData, fullName: e.target.value })}
                            required
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={enrollFormData.email}
                            onChange={(e) => setEnrollFormData({ ...enrollFormData, email: e.target.value })}
                            required
                            fullWidth
                            margin="normal"
                        />
                        <Button type="submit" variant="contained" color="primary">Enroll</Button>
                    </form>
                </Box>
            </Modal>

        </Box>
    );
}

export default ViewCourse;
