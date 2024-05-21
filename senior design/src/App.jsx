
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ViewCourse from './pages/ViewCourse';
import StudentDashboard from './student/StudentDashboard';
import StudentViewCourse from './student/StudentViewCourse';
import StudentActivity from './student/StudentActivity';
import ViewSubmissions from './pages/ViewSubmissions';
function App() {
  return (
   


<Router>

        <Routes>
          <Route exact path="/" element={<Signup/>}/>
        
          <Route exact path="/login" element={<Login/>}/>

          <Route exact path="/dashboard" element={<Dashboard/>} />
          <Route exact path="/student_dashboard" element={<StudentDashboard/>} />

          <Route exact path="/course" element={<ViewCourse/>} />
          <Route exact path="/student_course" element={<StudentViewCourse/>} />
          <Route exact path="/student_activity" element={<StudentActivity/>} />
          <Route exact path="/course/:courseName/activity/:title/submissions" element={<ViewSubmissions />} />
        </Routes>

    </Router>
  );
}

export default App;
