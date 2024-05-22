require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const UserModel = require('./auth_model'); 
const Activity = require('./learn_activity_model');
const StudentModel = require('./student_model');
const Course = require('./courses_model');
const SubmissionModel = require('./submission_model');
const nodemailer = require('nodemailer');
const multer = require('multer');
const AWS = require('aws-sdk');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
  });

const storage = multer.memoryStorage(); 
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB file size limit
});

const express = require('express');
const app = express();

const cors = require('cors');


app.use(cors());
const JWT_SECRET = process.env.JWT_SECRET;




const s3 = new AWS.S3({
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.ACCESS_KEY,        
  secretAccessKey: process.env.SECRET_KEY,     
});
app.post('/add_course',  upload.single('resources'), async (req, res) => {
  try {
    const { courseName, description } = req.body;
    const resource = req.file;
    
    console.log("yep", courseName, description, req.body)
    if (!resource) {
      return res.status(400).send('File not uploaded');
    }

    console.log("File uploaded:", courseName, description, req.body, resource);
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    const s3Key = `${userId}/${Date.now()}_${resource.originalname}`;

    const params = {
      Bucket: "learnai",
      Key: s3Key,
      Body: resource.buffer,
    };


    s3.putObject(params, async (err, data) => {
      if (err) {
        console.log("Error uploading to S3:", err);
        return res.status(500).send('Failed to upload file');
      }

      console.log("File uploaded to S3:", data);

    
      const newCourse = new Course({
        user: userId,
        courseName,
        description,
        resources: s3Key, 
      });

      await newCourse.save();

      res.status(201).json(newCourse);
    });
  } catch (error) {
    console.error('Error adding new course:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/add_activity', upload.single('materials'), async (req, res) => {
  try {

      console.log("body", req.body);
      const { courseName, title, instructions, idealAnswer } = req.body;
      const materials = req.file;
      console.log("file", materials);
      const status = true;
      console.log("req.body", req.body)
      if (!materials) {
        console.log("goes here");
        return res.status(400).send('File not uploaded');
      }
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    
    const user = userId;
    const s3Key = `${userId}/${Date.now()}_${materials.originalname}`

    const params = {
      Bucket: "learnai",
      Key: s3Key,
      Body: materials.buffer,
    };
    s3.putObject(params, async (err, data) => {
      if (err) {
        console.log("Error uploading to S3:", err);
        return res.status(500).send('Failed to upload file');
      }

      console.log("File uploaded to S3:", data);

    
    const userInfo = await UserModel.findById(userId);
    const instructorId = userInfo.email;
    const materials= [s3Key]

    if (!user ||  !title || !instructorId || !instructions || !courseName || !idealAnswer || status === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }


  const newActivity = new Activity({
      user,
      title,
      courseName,
      instructorId,
      materials,
      instructions,
      idealAnswer,
      status
  });


  await newActivity.save();



  res.status(201).json({ message: 'Learning activity created successfully' });
  });
    
    
} catch (error) {
  console.error('Error creating learning activity:', error);
  res.status(500).json({ error: 'Internal server error' });
}
});



const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());





app.get('/get_course_file/:courseName', async (req, res) => {
  try {
    const courseName = req.params.courseName;
    console.log("called", courseName);
  
    const course = await Course.findOne({ courseName });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
  }


    const params = {
      Bucket: "learnai", 
      Key: course.resources,   
      Expires: 60 
    };

    const url = s3.getSignedUrl('getObject', params);

    console.log("url", url);
    res.status(200).json({ url });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    console.log("body", req.body);
    
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
    const user = new UserModel({
      email: req.body.email,
      password: hashedPassword
    
    });
    await user.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).send('Error in signup');
  }
});


app.post('/login', async (req, res) => {
  try {
  
    let user = await UserModel.findOne({ email: req.body.email });
    let userType = 'instructor'; 

   
    if (!user) {
      user = await StudentModel.findOne({ email: req.body.email });
      userData = { fullName: user.fullName };
      userType = 'student';
    }

    if (!user) {
      return res.status(404).send('User not found');
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).send('Invalid password');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    if (userType === 'student') {
    
      return res.status(200).json({ token, student: true,  userData });
    } else {
      
      return res.status(200).json({ token, student: false });
    }
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).send('Error in login');
  }
});


app.post('/logout',  async (req, res) => {
  try {
    

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    const userId = decodedToken.userId;
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send('Invalid token');
      } else {
        res.status(200).send('Logged out successfully');
      }
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).send('Error in logout');
  }
});



app.get('/get_courses', async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decodedToken.userId;
      const user = userId;
      const courses = await Course.find({ user });
  
      res.status(200).json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });





  app.post('/get_course_info', async (req, res) => {
    try {
        const { courseName } = req.body;
        console.log("body", req.body);
     
        const course = await Course.findOne({ courseName });

      
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

    
        res.status(200).json(course);
    } catch (error) {
        console.error('Error fetching course information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/get_activities', async (req, res) => {
    try {
    
      const activities = await Activity.find();
  
      res.status(200).json(activities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });


  



app.post('/enroll_student', async (req, res) => {
  try {


 
    const { email, fullName, courseName } = req.body;

   const studentTemp = await StudentModel.findOne({ email: req.body.email });
    if (!studentTemp) {
      
    const password = Math.random().toString(36).slice(-8);

    
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const newStudent = new StudentModel({
      email,
      password: hashedPassword,
      fullName,
      student: true,
      courses: [courseName]
    });


    await newStudent.save();

  
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // For TLS
      auth: {
          user: 'learnai.senior.design@outlook.com',
          pass: 'PassWord76^'
      }
  });
  
  const mailOptions = {
      from: 'learnai.senior.design@outlook.com',
      to: email,
      subject: 'Welcome to Your LearnAI App!',
      text: `Dear ${fullName},\n\nWelcome to Your Education App!\n\nYour account has been successfully created.\n\nEmail: ${email}\nPassword: ${password}\n\nPlease login using these credentials.\n\nBest regards,\nYour Education App Team`
  };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
    
    console.log("sent")
    res.status(201).send('Student created successfully!');
  }
  else{
    
    studentTemp.courses.push(courseName);
    await studentTemp.save();
    res.status(201).send('Student enrolled successfully!');
  }
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/get_student_courses', async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1];
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await StudentModel.findOne({ _id: decoded.userId });
    console.log("student", user)
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
   
    const courses = await Course.find({ courseName: { $in: user.courses } });
    console.log("list", courses);
    if (!courses || courses.length === 0) {
      return res.status(404).send('No courses found');
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error in fetching courses:', error);
    res.status(500).send('Error in fetching courses');
  }
});


app.post('/get_student_activities', async (req, res) => {
  try {
    const { courseName } = req.body;

    if (!courseName) {
      return res.status(400).json({ error: 'Course name is required' });
    }

    const learningActivities = await Activity.find({ courseName });

    res.json(learningActivities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/get_individual_activity', async (req, res) => {
  const { courseName, title } = req.body;

  try {
    const activity = await Activity.findOne({ courseName, title });
  
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }


    console.log("materials", activity);
    const params = {
      Bucket: "learnai", 
      Key: activity.materials[0],   
      Expires: 60 
    };

    const url = s3.getSignedUrl('getObject', params);
 
    res.json({ activity, url });

  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//ENDPOINT TO SUBMIT ANSWER - **STUDENT**
app.post('/submit', async (req, res) => {
  try {
    const { studentName, title, courseName, idealAnswer, instructions, answer } = req.body;
    console.log("body", req.body)
    const newSubmission = new SubmissionModel({
      studentName,
      title,
      courseName,
      idealAnswer,
      instructions,
      answer
    });

    await newSubmission.save();
    res.status(201).json({ message: 'Submission created successfully' });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//ENDPOINT TO GET SUBMISSIONS - **INSTRUCTOR**
app.post('/view_submissions', async (req, res) => {
  try {
    const { courseName, title } = req.body;

    const submissions = await SubmissionModel.find({ courseName, title });

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ error: 'No submissions found' });
    }

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = app;
