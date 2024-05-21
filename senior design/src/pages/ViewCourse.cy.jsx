import React from 'react';
import ViewCourse from './ViewCourse';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

describe('<ViewCourse />', () => {
  beforeEach(() => {
    // Set up necessary local storage items before each test
    localStorage.setItem('token', 'fakeToken');
    localStorage.setItem('student', 'false');

    // Mount the ViewCourse component within a Router with initial state
    cy.mount(
      <Router>
        <Routes>
          <Route path="/course" element={<ViewCourse />} />
        </Routes>
      </Router>,
      {
        props: {
          location: {
            state: { Name: 'Test Course' }
          }
        }
      }
    );
  });

  afterEach(() => {
    // Clear local storage after each test
    localStorage.clear();
  });

  // Test to ensure the component renders
  it('renders', () => {
    cy.get('h5').contains('Test Course').should('be.visible');
  });

  // Test to ensure redirection if not authenticated or if student
  it('redirects to login if not authenticated or if student', () => {
    localStorage.removeItem('token');
    cy.reload();
    cy.location('pathname').should('eq', '/login');

    localStorage.setItem('token', 'fakeToken');
    localStorage.setItem('student', 'true');
    cy.reload();
    cy.location('pathname').should('eq', '/login');
  });

  // Test to fetch and display course information
  it('fetches and displays course information', () => {
    cy.intercept('POST', 'http://localhost:3000/get_course_info', {
      statusCode: 200,
      body: { _id: '1', courseName: 'Test Course', description: 'Test Course Description' }
    }).as('getCourseInfo');

    cy.wait('@getCourseInfo');
    cy.contains('Head over to the course info page to get started.').should('be.visible');
  });

  // Test to fetch and display learning activities
  it('fetches and displays learning activities', () => {
    cy.intercept('POST', 'http://localhost:3000/get_student_activities', {
      statusCode: 200,
      body: [
        { _id: '1', title: 'Activity 1', status: true },
        { _id: '2', title: 'Activity 2', status: false }
      ]
    }).as('getLearningActivities');

    cy.wait('@getLearningActivities');
    cy.contains('Activity 1').should('be.visible');
    cy.contains('Activity 2').should('be.visible');
  });

  // Test to open and close the create activity modal
  it('opens and closes the create activity modal', () => {
    cy.contains('Create Activity').click();
    cy.get('form').should('be.visible');
    cy.contains('Cancel').click();
    cy.get('form').should('not.exist');
  });

  // Test to create a new learning activity
  it('creates a new learning activity', () => {
    cy.contains('Create Activity').click();
    cy.get('input[name="title"]').type('New Activity');
    cy.get('textarea[name="instructions"]').type('New Activity Instructions');
    cy.get('textarea[name="idealAnswer"]').type('Ideal Answer');
    cy.intercept('POST', 'http://localhost:3000/add_activity', {
      statusCode: 201,
      body: { message: 'Activity created successfully' }
    }).as('createActivity');
    cy.contains('Create').click();
    cy.wait('@createActivity');
    cy.get('form').should('not.exist');
  });

  // Test to open and close the enroll student modal
  it('opens and closes the enroll student modal', () => {
    cy.contains('Enroll a student').click();
    cy.get('form').should('be.visible');
    cy.contains('Enroll').click();
    cy.get('form').should('not.exist');
  });

  // Test to enroll a student
  it('enrolls a student', () => {
    cy.contains('Enroll a student').click();
    cy.get('input[name="fullName"]').type('Student Name');
    cy.get('input[type="email"]').type('student@example.com');
    cy.intercept('POST', 'http://localhost:3000/enroll_student', {
      statusCode: 200,
      body: { message: 'Student enrolled successfully' }
    }).as('enrollStudent');
    cy.contains('Enroll').click();
    cy.wait('@enrollStudent');
    cy.get('form').should('not.exist');
  });

  // Test to navigate to the activity submissions page
  it('navigates to the activity submissions page', () => {
    cy.intercept('POST', 'http://localhost:3000/get_student_activities', {
      statusCode: 200,
      body: [{ _id: '1', title: 'Activity 1', status: true }]
    }).as('getLearningActivities');

    cy.wait('@getLearningActivities');
    cy.contains('Activity 1').click();
    cy.location('pathname').should('eq', '/course/Test Course/activity/Activity 1/submissions');
  });

  // Test to logout
  it('logs out', () => {
    cy.intercept('POST', 'http://localhost:3000/logout', {
      statusCode: 200
    }).as('logout');

    cy.contains('Logout').click();
    cy.wait('@logout');
    cy.location('pathname').should('eq', '/login');
  });
});
