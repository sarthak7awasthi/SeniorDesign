
require('dotenv').config();
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../index'); 
const Activity = require('../learn_activity_model');
const UserModel = require('../auth_model'); 
const SubmissionModel = require('../submission_model');

describe('Activity API Tests', () => {
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

  describe('GET /get_activities', () => {
    it('should get all activities', async () => {
      const activities = [
        { title: 'Activity 1', courseName: 'Course 1', description: 'Description 1' },
        { title: 'Activity 2', courseName: 'Course 2', description: 'Description 2' }
      ];

      // Stub the necessary methods
      sandbox.stub(Activity, 'find').resolves(activities);

      const response = await request(app).get('/get_activities');

      // Verify the response and stub interactions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(activities);
    });

    it('should return 500 on internal server error', async () => {
      // Simulate an error
      sandbox.stub(Activity, 'find').rejects(new Error('Database error'));

      const response = await request(app).get('/get_activities');

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error.' });
    });
  });

  describe('POST /add_activity', () => {
    it('should add a new activity', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);
      const activityData = {
        courseName: 'Course 1',
        title: 'New Activity',
        materials: 'Some materials',
        instructions: 'Some instructions',
        idealAnswer: 'Some ideal answer'
      };
      const userInfo = { _id: userId, email: 'instructor@example.com' };

      // Stub the necessary methods
      sandbox.stub(jwt, 'verify').returns({ userId });
      sandbox.stub(UserModel, 'findById').resolves(userInfo);
      sandbox.stub(Activity.prototype, 'save').resolves();

      const response = await request(app)
        .post('/add_activity')
        .set('Authorization', `Bearer ${token}`)
        .send(activityData);

      // Verify the response and stub interactions
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Learning activity created successfully' });
    });

    it('should return 400 for missing required fields', async () => {
      const token = jwt.sign({ userId: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);
      const activityData = {
        title: 'New Activity',
        materials: 'Some materials',
        instructions: 'Some instructions',
        idealAnswer: 'Some ideal answer'
      };

      // Stub the necessary methods
      sandbox.stub(jwt, 'verify').returns({ userId: new mongoose.Types.ObjectId() });

      const response = await request(app)
        .post('/add_activity')
        .set('Authorization', `Bearer ${token}`)
        .send(activityData);

      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing required fields' });
    });

    it('should return 500 on internal server error', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);
      const activityData = {
        courseName: 'Course 1',
        title: 'New Activity',
        materials: 'Some materials',
        instructions: 'Some instructions',
        idealAnswer: 'Some ideal answer'
      };
      const userInfo = { _id: userId, email: 'instructor@example.com' };

      // Simulate an error
      sandbox.stub(jwt, 'verify').returns({ userId });
      sandbox.stub(UserModel, 'findById').resolves(userInfo);
      sandbox.stub(Activity.prototype, 'save').rejects(new Error('Database error'));

      const response = await request(app)
        .post('/add_activity')
        .set('Authorization', `Bearer ${token}`)
        .send(activityData);

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /get_student_activities', () => {
    it('should get activities for a course', async () => {
      const courseName = 'Course 1';
      const activities = [
        { title: 'Activity 1', courseName },
        { title: 'Activity 2', courseName }
      ];

      // Stub the necessary methods
      sandbox.stub(Activity, 'find').resolves(activities);

      const response = await request(app)
        .post('/get_student_activities')
        .send({ courseName });

      // Verify the response and stub interactions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(activities);
    });

    it('should return 400 if course name is missing', async () => {
      const response = await request(app).post('/get_student_activities').send({});

      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Course name is required' });
    });

    it('should return 500 on internal server error', async () => {
      const courseName = 'Course 1';

      // Simulate an error
      sandbox.stub(Activity, 'find').rejects(new Error('Database error'));

      const response = await request(app)
        .post('/get_student_activities')
        .send({ courseName });

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('POST /get_individual_activity', () => {
    it('should get an individual activity', async () => {
      const courseName = 'Course 1';
      const title = 'Activity 1';
      const activity = { title, courseName, description: 'Description' };

      // Stub the necessary methods
      sandbox.stub(Activity, 'findOne').resolves(activity);

      const response = await request(app)
        .post('/get_individual_activity')
        .send({ courseName, title });

      // Verify the response and stub interactions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(activity);
    });

    it('should return 404 if activity not found', async () => {
      const courseName = 'Course 1';
      const title = 'Nonexistent Activity';

      // Stub the necessary methods
      sandbox.stub(Activity, 'findOne').resolves(null);

      const response = await request(app)
        .post('/get_individual_activity')
        .send({ courseName, title });

      // Verify the response
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Activity not found' });
    });

    it('should return 500 on internal server error', async () => {
      const courseName = 'Course 1';
      const title = 'Activity 1';

      // Simulate an error
      sandbox.stub(Activity, 'findOne').rejects(new Error('Database error'));

      const response = await request(app)
        .post('/get_individual_activity')
        .send({ courseName, title });

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  describe('POST /submit', () => {
    it('should submit a student answer', async () => {
      const submissionData = {
        studentName: 'Student 1',
        title: 'Activity 1',
        courseName: 'Course 1',
        idealAnswer: 'Ideal Answer',
        instructions: 'Instructions',
        answer: 'Student Answer'
      };

      // Stub the necessary methods
      sandbox.stub(SubmissionModel.prototype, 'save').resolves();

      const response = await request(app)
        .post('/submit')
        .send(submissionData);

      // Verify the response and stub interactions
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Submission created successfully' });
    });

    it('should return 500 on internal server error', async () => {
      const submissionData = {
        studentName: 'Student 1',
        title: 'Activity 1',
        courseName: 'Course 1',
        idealAnswer: 'Ideal Answer',
        instructions: 'Instructions',
        answer: 'Student Answer'
      };

      // Simulate an error
      sandbox.stub(SubmissionModel.prototype, 'save').rejects(new Error('Database error'));

      const response = await request(app)
        .post('/submit')
        .send(submissionData);

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /view_submissions', () => {
    it('should get submissions for an activity', async () => {
      const courseName = 'Course 1';
      const title = 'Activity 1';
      const submissions = [
        { studentName: 'Student 1', title, courseName, answer: 'Answer 1' },
        { studentName: 'Student 2', title, courseName, answer: 'Answer 2' }
      ];

      // Stub the necessary methods
      sandbox.stub(SubmissionModel, 'find').resolves(submissions);

      const response = await request(app)
        .post('/view_submissions')
        .send({ courseName, title });

      // Verify the response and stub interactions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(submissions);
    });

    it('should return 404 if no submissions found', async () => {
      const courseName = 'Course 1';
      const title = 'Activity 1';

      // Stub the necessary methods
      sandbox.stub(SubmissionModel, 'find').resolves([]);

      const response = await request(app)
        .post('/view_submissions')
        .send({ courseName, title });

      // Verify the response
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'No submissions found' });
    });

    it('should return 500 on internal server error', async () => {
      const courseName = 'Course 1';
      const title = 'Activity 1';

      // Simulate an error
      sandbox.stub(SubmissionModel, 'find').rejects(new Error('Database error'));

      const response = await request(app)
        .post('/view_submissions')
        .send({ courseName, title });

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
