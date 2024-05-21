import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Card, CardContent, CardActions } from '@mui/material';

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
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
    async function fetchCourses() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/get_student_courses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }

    fetchCourses();
  }, [courses]);

  const openCourse = (courseName) => {
    navigate('/student_course', { state: { Name: courseName } });
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

  // const handleHome = () => {
  //   navigate('/student_dashboard');
  // };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'show', textOverflow: 'ellipsis', maxWidth: '150%' }}>
            Course Dashboard
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {/* <Button color="inherit" sx={{ maxWidth: 100, px: 10 }} onClick={handleHome}>Home</Button> */}
          <Button color="inherit" sx={{ maxWidth: 100, px: 10 }} onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '4rem', backgroundColor: '#f0f0f0' }}>
        <Container>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {courses.map((course) => (
              <Card key={course._id} sx={{ width: '300px', cursor: 'pointer' }} onClick={() => openCourse(course.courseName)}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {course.courseName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Open</Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default StudentDashboard;
