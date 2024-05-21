// test/auth.test.js
require('dotenv').config();
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../index'); // Ensure this points to your app setup file
const UserModel = require('../auth_model');
const StudentModel = require('../student_model');

describe('Auth API Tests', () => {
  let sandbox;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /signup', () => {
    it('should sign up a new user', async () => {
      const userStub = sandbox.stub(UserModel.prototype, 'save').resolves();
      const hashedPassword = await bcrypt.hash('password123', 10);
      sandbox.stub(bcrypt, 'hash').resolves(hashedPassword);

      const response = await request(app)
        .post('/signup')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.text).toBe('User created successfully');
      expect(userStub.calledOnce).toBe(true);
    });

    it('should return 500 on signup error', async () => {
      sandbox.stub(UserModel.prototype, 'save').rejects(new Error('Signup error'));

      const response = await request(app)
        .post('/signup')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error in signup');
    });
  });

  describe('POST /login', () => {
    it('should log in an existing user', async () => {
      const user = { _id: new mongoose.Types.ObjectId(), email: 'test@example.com', password: await bcrypt.hash('password123', 10) };
      sandbox.stub(UserModel, 'findOne').resolves(user);
      sandbox.stub(bcrypt, 'compare').resolves(true);
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      sandbox.stub(jwt, 'sign').returns(token);

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', token);
      expect(response.body).toHaveProperty('student', false);
    });

    it('should return 404 if user not found', async () => {
      sandbox.stub(UserModel, 'findOne').resolves(null);
      sandbox.stub(StudentModel, 'findOne').resolves(null);

      const response = await request(app)
        .post('/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.status).toBe(404);
      expect(response.text).toBe('User not found');
    });

    it('should return 401 for invalid password', async () => {
      const user = { _id: new mongoose.Types.ObjectId(), email: 'test@example.com', password: await bcrypt.hash('password123', 10) };
      sandbox.stub(UserModel, 'findOne').resolves(user);
      sandbox.stub(bcrypt, 'compare').resolves(false);

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.text).toBe('Invalid password');
    });

    it('should return 500 on login error', async () => {
      sandbox.stub(UserModel, 'findOne').rejects(new Error('Login error'));

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error in login');
    });
  });

  describe('POST /logout', () => {
    it('should log out a user', async () => {
      const token = jwt.sign({ userId: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);
      sandbox.stub(jwt, 'verify').callsFake((token, secret, callback) => callback(null, { userId: new mongoose.Types.ObjectId() }));

      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe('Logged out successfully');
    });

    it('should return 401 for invalid token', async () => {
      sandbox.stub(jwt, 'verify').callsFake((token, secret, callback) => callback(new Error('Invalid token')));

      const response = await request(app)
        .post('/logout')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.text).toBe('Invalid token');
    });

    it('should return 500 on logout error', async () => {
      const token = jwt.sign({ userId: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);
      sandbox.stub(jwt, 'verify').throws(new Error('Logout error'));

      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error in logout');
    });
  });
});
