import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    description: '',
    resources: null
  });
  
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
    async function fetchCourses() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/get_courses', {
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
    navigate('/course', { state: { Name: courseName } });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewCourse({ ...newCourse, [name]: value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    console.log("here", file), newCourse;
    setNewCourse({ ...newCourse, resources: file });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log("file", newCourse)
      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('courseName', newCourse.courseName);
      formData.append('description', newCourse.description);
      formData.append('resources', newCourse.resources);

      const response = await fetch('http://localhost:3000/add_course', {
        method: 'POST',
        headers: {
         
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      console.log('New course created');
      setShowModal(false);
      setNewCourse({
        courseName: '',
        description: '',
        resources: null
      });
    } catch (error) {
      console.error('Error creating course:', error);
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

  // const handleHome = () => {
  //   navigate('/dashboard');
  // };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'show', textOverflow: 'ellipsis', maxWidth: '150%' }}>
            Teacher Dashboard
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {/* <Button color="inherit" sx={{ maxWidth: 100, px: 10 }} onClick={handleHome}>Home</Button> */}
          <Button color="inherit" sx={{ maxWidth: 100, px: 2, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)', backgroundColor: '#042a58' } }} onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '4rem', backgroundColor: '#f0f0f0' }}>
        <Container>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            {courses.map((course) => (
              <Card key={course._id} sx={{ width: '320px', cursor: 'pointer', transition: 'transform 0.3s', '&:hover': { transform: 'scale(0.98)', backgroundColor: '#E4F6F8' } }} onClick={() => openCourse(course.courseName)}>
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
          <Button variant="contained" color="primary" onClick={() => setShowModal(true)}>Create Course</Button>
        </Container>
      </Box>
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Create Course</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="dense"
              label="Course Name"
              type="text"
              name="courseName"
              fullWidth
              value={newCourse.courseName}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={4}
              value={newCourse.description}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              label="Resources"
              type="file"
              name="resources"
              fullWidth
              onChange={handleFileChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <DialogActions>
              <Button onClick={() => setShowModal(false)} color="secondary">Cancel</Button>
              <Button type="submit" color="primary">Create</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Dashboard;
