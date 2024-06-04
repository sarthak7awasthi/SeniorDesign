import React from 'react';
import StudentDashboard from './StudentDashboard';
import { BrowserRouter as Router } from 'react-router-dom';
import { mount } from 'cypress/react';

describe('<StudentDashboard />', () => {
  const coursesData = [
    { _id: '1', courseName: 'Course 1', description: 'Description for Course 1' },
    { _id: '2', courseName: 'Course 2', description: 'Description for Course 2' },
    { _id: '3', courseName: 'Course 3', description: 'Description for Course 3' },
  ];

  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:3000/get_student_courses', {
      statusCode: 200,
      body: coursesData,
    }).as('fetchCourses');

    cy.intercept('POST', 'http://localhost:3000/logout', {
      statusCode: 200,
    }).as('logout');

    localStorage.setItem('token', 'valid_token');
    localStorage.setItem('student', 'true');

    mount(
      <Router>
        <StudentDashboard />
      </Router>
    );
  });

  it('renders and displays the course details', () => {
    cy.wait('@fetchCourses');
    coursesData.forEach(course => {
      cy.get('h6').contains(course.courseName).should('be.visible');
      cy.get('p').contains(course.description).should('be.visible');
    });
  });

  it('redirects to login if no token is found', () => {
    localStorage.removeItem('token');
    mount(
      <Router>
        <StudentDashboard />
      </Router>
    );
    cy.location('pathname').should('eq', '/login');
  });

  it('redirects to login if the user is not a student', () => {
    localStorage.setItem('student', 'false');
    mount(
      <Router>
        <StudentDashboard />
      </Router>
    );
    cy.location('pathname').should('eq', '/login');
  });

  it('navigates to the course details page when a course card is clicked', () => {
    cy.wait('@fetchCourses');
    cy.get('div[role="button"]').contains('Course 1').click();
    cy.location('pathname').should('eq', '/student_course');
    cy.location('state').should('have.property', 'Name', 'Course 1');
  });

  it('logs out and redirects to login', () => {
    cy.get('button').contains('Logout').click();
    cy.wait('@logout');
    cy.location('pathname').should('eq', '/login');
    cy.get('localStorage').should('be.empty');
  });
});
