// test/course.test.js
require('dotenv').config();
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../index'); // Ensure this points to your app setup file
const Course = require('../courses_model');
const StudentModel = require('../student_model');

describe('Course API Tests', () => {
  let sandbox;

  // Setup a sandbox environment for sinon
  beforeAll(() => {
    sandbox = sinon.createSandbox();
  });

  // Restore the sandbox after each test to ensure clean state
  afterEach(() => {
    sandbox.restore();
  });

  // Disconnect mongoose after all tests to close DB connections
  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /get_courses', () => {
    it('should get courses for a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      // Stub the necessary methods
      sandbox.stub(jwt, 'verify').returns({ userId });
      const courses = [{ courseName: 'Test Course', description: 'Test Description' }];
      sandbox.stub(Course, 'find').resolves(courses);

      const response = await request(app)
        .get('/get_courses')
        .set('Authorization', `Bearer ${token}`);

      // Verify the response and stub interactions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(courses);
    });

    it('should return 500 on internal server error', async () => {
      const token = jwt.sign({ userId: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);

      // Simulate an error
      sandbox.stub(jwt, 'verify').throws(new Error('JWT error'));
      sandbox.stub(Course, 'find').rejects(new Error('Database error'));

      const response = await request(app)
        .get('/get_courses')
        .set('Authorization', `Bearer ${token}`);

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error.' });
    });
  });

  describe('POST /add_course', () => {
    it('should add a new course', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);
      const courseData = { courseName: 'New Course', description: 'Course Description' };
      const savedCourse = { ...courseData, user: userId, resources: 'somefile' };

      // Stub the necessary methods
      sandbox.stub(jwt, 'verify').returns({ userId });
      sandbox.stub(Course.prototype, 'save').resolves(savedCourse);

      const response = await request(app)
        .post('/add_course')
        .set('Authorization', `Bearer ${token}`)
        .send(courseData);

      // Verify the response and stub interactions
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(savedCourse);
    });

    it('should return 500 on internal server error', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);
      const courseData = { courseName: 'New Course', description: 'Course Description' };

      // Simulate an error
      sandbox.stub(jwt, 'verify').returns({ userId });
      sandbox.stub(Course.prototype, 'save').rejects(new Error('Database error'));

      const response = await request(app)
        .post('/add_course')
        .set('Authorization', `Bearer ${token}`)
        .send(courseData);

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error.' });
    });
  });

  describe('POST /get_course_info', () => {
    it('should get course information', async () => {
      const courseName = 'Test Course';
      const course = { courseName, description: 'Test Description' };

      // Stub the necessary methods
      sandbox.stub(Course, 'findOne').resolves(course);

      const response = await request(app)
        .post('/get_course_info')
        .send({ courseName });

      // Verify the response and stub interactions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(course);
    });

    it('should return 404 if course not found', async () => {
      const courseName = 'Nonexistent Course';

      // Stub the necessary methods
      sandbox.stub(Course, 'findOne').resolves(null);

      const response = await request(app)
        .post('/get_course_info')
        .send({ courseName });

      // Verify the response
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Course not found' });
    });

    it('should return 500 on internal server error', async () => {
      const courseName = 'Test Course';

      // Simulate an error
      sandbox.stub(Course, 'findOne').rejects(new Error('Database error'));

      const response = await request(app)
        .post('/get_course_info')
        .send({ courseName });

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /get_student_courses', () => {
    it('should get student courses', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);
      const student = { _id: userId, courses: ['Course 1', 'Course 2'] };
      const courses = [
        { courseName: 'Course 1', description: 'Description 1' },
        { courseName: 'Course 2', description: 'Description 2' },
      ];

      // Stub the necessary methods
      sandbox.stub(jwt, 'verify').returns({ userId });
      sandbox.stub(StudentModel, 'findOne').resolves(student);
      sandbox.stub(Course, 'find').resolves(courses);

      const response = await request(app)
        .get('/get_student_courses')
        .set('Authorization', `Bearer ${token}`);

      // Verify the response and stub interactions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(courses);
    });

    it('should return 404 if user not found', async () => {
      const token = jwt.sign({ userId: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);

      // Simulate user not found
      sandbox.stub(jwt, 'verify').returns({ userId: new mongoose.Types.ObjectId() });
      sandbox.stub(StudentModel, 'findOne').resolves(null);

      const response = await request(app)
        .get('/get_student_courses')
        .set('Authorization', `Bearer ${token}`);

      // Verify the response
      expect(response.status).toBe(404);
      expect(response.text).toBe('User not found');
    });

    it('should return 404 if no courses found', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);
      const student = { _id: userId, courses: ['Nonexistent Course'] };

      // Simulate no courses found
      sandbox.stub(jwt, 'verify').returns({ userId });
      sandbox.stub(StudentModel, 'findOne').resolves(student);
      sandbox.stub(Course, 'find').resolves([]);

      const response = await request(app)
        .get('/get_student_courses')
        .set('Authorization', `Bearer ${token}`);

      // Verify the response
      expect(response.status).toBe(404);
      expect(response.text).toBe('No courses found');
    });

    it('should return 500 on internal server error', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      // Simulate an error
      sandbox.stub(jwt, 'verify').returns({ userId });
      sandbox.stub(StudentModel, 'findOne').rejects(new Error('Database error'));
      sandbox.stub(Course, 'find').rejects(new Error('Database error'));

      const response = await request(app)
        .get('/get_student_courses')
        .set('Authorization', `Bearer ${token}`);

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.text).toBe('Error in fetching courses');
    });
  });
});
