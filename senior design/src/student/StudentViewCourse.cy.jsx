import React from 'react';
import ViewCourse from './StudentViewCourse';
import { BrowserRouter as Router } from 'react-router-dom';
import { mount } from 'cypress/react';

describe('<ViewCourse />', () => {
  const courseName = 'Test Course';
  const courseInfo = { name: courseName, description: 'Course description' };
  const learningActivities = [
    { _id: '1', title: 'Activity 1', status: true },
    { _id: '2', title: 'Activity 2', status: false },
    { _id: '3', title: 'Activity 3', status: true },
  ];

  beforeEach(() => {
    cy.intercept('GET', `http://localhost:3000/get_course_file/${courseName}`, {
      statusCode: 200,
      body: { url: 'http://localhost:3000/syllabus.pdf' },
    }).as('fetchSyllabus');

    cy.intercept('POST', 'http://localhost:3000/get_course_info', {
      statusCode: 200,
      body: courseInfo,
    }).as('fetchCourseInfo');

    cy.intercept('POST', 'http://localhost:3000/get_student_activities', {
      statusCode: 200,
      body: learningActivities,
    }).as('fetchLearningActivities');

    cy.intercept('POST', 'http://localhost:3000/logout', {
      statusCode: 200,
    }).as('logout');

    localStorage.setItem('token', 'valid_token');
    localStorage.setItem('student', 'true');

    mount(
      <Router>
        <ViewCourse location={{ state: { Name: courseName } }} />
      </Router>
    );
  });

  it('renders and displays the course information', () => {
    cy.wait('@fetchCourseInfo');
    cy.get('h5').contains(courseName).should('be.visible');
    cy.get('p').contains(courseInfo.description).should('be.visible');
  });

  it('renders and displays learning activities', () => {
    cy.wait('@fetchLearningActivities');
    learningActivities.forEach(activity => {
      cy.get('h6').contains(activity.title).should('be.visible');
      cy.get('p').contains(activity.status ? 'Open' : 'Locked').should('be.visible');
    });
  });

  it('redirects to login if no token is found', () => {
    localStorage.removeItem('token');
    mount(
      <Router>
        <ViewCourse location={{ state: { Name: courseName } }} />
      </Router>
    );
    cy.location('pathname').should('eq', '/login');
  });

  it('redirects to login if the user is not a student', () => {
    localStorage.setItem('student', 'false');
    mount(
      <Router>
        <ViewCourse location={{ state: { Name: courseName } }} />
      </Router>
    );
    cy.location('pathname').should('eq', '/login');
  });

  it('navigates to the student activity page when an activity is clicked', () => {
    cy.wait('@fetchLearningActivities');
    cy.get('div[role="button"]').contains('Activity 1').click();
    cy.location('pathname').should('eq', '/student_activity');
    cy.location('state').should('have.property', 'Title', 'Activity 1');
  });

  it('logs out and redirects to login', () => {
    cy.get('button').contains('Logout').click();
    cy.wait('@logout');
    cy.location('pathname').should('eq', '/login');
    cy.get('localStorage').should('be.empty');
  });

  it('displays the syllabus when syllabus is clicked', () => {
    cy.get('div[role="button"]').contains('Syllabus').click();
    cy.wait('@fetchSyllabus');
    cy.get('a').contains('Syllabus File').should('have.attr', 'href', 'http://localhost:3000/syllabus.pdf');
  });

  it('displays the correct section when the sidebar options are clicked', () => {
    cy.get('div[role="button"]').contains('Course Info').click();
    cy.get('p').contains('Head over to the course info page to get started.').should('be.visible');

    cy.get('div[role="button"]').contains('Contact Information').click();
    cy.get('p').contains('Contact information...').should('be.visible');

    cy.get('div[role="button"]').contains('Announcements').click();
    cy.get('p').contains('Announcements...').should('be.visible');
  });
});
