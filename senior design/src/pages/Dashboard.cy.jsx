import React from 'react';
import Dashboard from './Dashboard';
import { BrowserRouter as Router } from 'react-router-dom';

describe('<Dashboard />', () => {
  beforeEach(() => {
    // Set up necessary local storage items before each test
    localStorage.setItem('token', 'fakeToken');
    localStorage.setItem('student', 'false');

    // Mount the Dashboard component within a Router
    cy.mount(
      <Router>
        <Dashboard />
      </Router>
    );
  });

  afterEach(() => {
    // Clear local storage after each test
    localStorage.clear();
  });

  // Test to ensure the component renders
  it('renders', () => {
    cy.get('h5').contains('Teacher Dashboard').should('be.visible');
  });


  // Test to fetch and display courses
  it('fetches and displays courses', () => {
    cy.intercept('GET', 'http://localhost:3000/get_courses', {
      statusCode: 200,
      body: [
        { _id: '1', courseName: 'Course 1', description: 'Description 1' },
        { _id: '2', courseName: 'Course 2', description: 'Description 2' }
      ]
    }).as('getCourses');

    cy.wait('@getCourses');

    cy.get('div[role="button"]').should('have.length', 2);
    cy.contains('Course 1').should('be.visible');
    cy.contains('Course 2').should('be.visible');
  });

  // Test to open a course
  it('opens a course', () => {
    cy.intercept('GET', 'http://localhost:3000/get_courses', {
      statusCode: 200,
      body: [{ _id: '1', courseName: 'Course 1', description: 'Description 1' }]
    }).as('getCourses');

    cy.wait('@getCourses');
    cy.contains('Course 1').click();
    cy.location('pathname').should('eq', '/course');
  });

  // Test to open and close the course creation modal
  it('opens and closes the course creation modal', () => {
    cy.contains('Create Course').click();
    cy.get('form').should('be.visible');
    cy.contains('Cancel').click();
    cy.get('form').should('not.exist');
  });

  // Test to create a new course
  it('creates a new course', () => {
    cy.intercept('POST', 'http://localhost:3000/add_course', {
      statusCode: 201,
      body: { message: 'Course created successfully' }
    }).as('createCourse');

    cy.contains('Create Course').click();
    cy.get('input[name="courseName"]').type('New Course');
    cy.get('textarea[name="description"]').type('New Course Description');
    cy.get('input[type="file"]').selectFile('path/to/resource.pdf'); 
    cy.contains('Create').click();
    cy.wait('@createCourse');
    cy.get('form').should('not.exist');
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
