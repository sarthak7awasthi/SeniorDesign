import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Drawer, List, ListItem, ListItemText, Paper } from '@mui/material';

function ViewCourse() { 
  const { state } = useLocation();
  const name = state?.Name;
  const [courseInfo, setCourseInfo] = useState({});
  const [courseName, setCourseName] = useState(name || '');
  const [currentSection, setCurrentSection] = useState('Learning-activity');
  const [learningActivities, setLearningActivities] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
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
  }, [state?.Name]);

  const handleActivityClick = (activityTitle) => {
    navigate('/student_activity', { state: { Name: courseName, Title: activityTitle } });
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

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150%' }}>
            {courseName}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit" sx={{ maxWidth: 100, px: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)', backgroundColor: '#042a58' } }} onClick={handleHome}>Home</Button>
          <Button color="inherit" sx={{ maxWidth: 100, px: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)', backgroundColor: '#042a58' } }} onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', backgroundColor: '#18192d', color: 'white' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button onClick={() => setCurrentSection('Learning-activity')}>
              <ListItemText primary="Learning Activities" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem button onClick={() => setCurrentSection('course-info')}>
              <ListItemText primary="Course Info" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem button onClick={() => setCurrentSection('syllabus')}>
              <ListItemText primary="Syllabus" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem button onClick={() => setCurrentSection('contact')}>
              <ListItemText primary="Contact Information" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem button onClick={() => setCurrentSection('announcements')}>
              <ListItemText primary="Announcements" sx={{ color: 'white' }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '4rem' }}>
        <Container>
          {currentSection === 'course-info' && <Paper sx={{ p: 2, mb: 2 }}>Head over to the course info page to get started.</Paper>}

          {currentSection === 'syllabus' && (
            <Box sx={{ mb: 2 }}>
             
                <Paper  sx={{ p: 2, mb: 2, cursor: 'pointer' }} >
             
                <Typography variant="h6" sx={{ marginBottom: '1rem' }}>Syllabus</Typography>
                {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer">Syllabus File</a>}
                </Paper>
              
            </Box>
          )}
          {currentSection === 'contact' && <Paper sx={{ p: 2, mb: 2 }}>Contact information...</Paper>}
          {currentSection === 'announcements' && <Paper sx={{ p: 2, mb: 2 }}>Announcements...</Paper>}
          {currentSection === 'Learning-activity' && (
            <Box sx={{ mb: 2 }}>
              {learningActivities.map(activity => (
                <Paper key={activity._id} sx={{ p: 2, mb: 2, cursor: 'pointer', transition: 'transform 0.3s', '&:hover': { transform: 'scale(0.98)', backgroundColor: '#E4F6F8' }  }} onClick={() => handleActivityClick(activity.title)}>
                  <Typography variant="h6">{activity.title}</Typography>
                  <Typography>Status: {activity.status ? 'Open' : 'Locked'}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default ViewCourse;
