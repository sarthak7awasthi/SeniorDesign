import React from 'react';
import StudentActivity from './StudentActivity';
import { BrowserRouter as Router } from 'react-router-dom';
import { mount } from 'cypress/react';

describe('<StudentActivity />', () => {
  const activityData = {
    title: 'Sample Activity',
    instructions: 'These are the instructions for the activity.',
    idealAnswer: 'This is the ideal answer.',
    materials: ['sample-material']
  };
  const feedbackResponse = { feedback: 'This is feedback from Clara.' };

  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:3000/get_individual_activity', {
      statusCode: 200,
      body: { activity: activityData, url: 'http://localhost:3000/resource-url' }
    }).as('fetchActivity');

    cy.intercept('POST', 'http://localhost:3000/logout', {
      statusCode: 200
    }).as('logout');

    cy.intercept('POST', 'https://Raj0102.pythonanywhere.com/get_feedback', {
      statusCode: 200,
      body: feedbackResponse
    }).as('getFeedback');

    cy.intercept('POST', 'http://localhost:3000/submit', {
      statusCode: 200
    }).as('submitActivity');

    localStorage.setItem('token', 'valid_token');
    localStorage.setItem('student', 'true');
    localStorage.setItem('fullName', 'John Doe');

    mount(
      <Router>
        <StudentActivity />
      </Router>
    );
  });

  it('renders and displays the activity details', () => {
    cy.wait('@fetchActivity');
    cy.get('h5').contains('Sample Activity').should('be.visible');
    cy.get('h6').contains('These are the instructions for the activity.').should('be.visible');
    cy.get('a').contains('Resource File Provided by Instructor for the activity.').should('have.attr', 'href', 'http://localhost:3000/resource-url');
  });

  it('redirects to login if no token is found', () => {
    localStorage.removeItem('token');
    mount(
      <Router>
        <StudentActivity />
      </Router>
    );
    cy.location('pathname').should('eq', '/login');
  });

  it('redirects to login if the user is not a student', () => {
    localStorage.setItem('student', 'false');
    mount(
      <Router>
        <StudentActivity />
      </Router>
    );
    cy.location('pathname').should('eq', '/login');
  });

  it('submits an answer and gets feedback from Clara', () => {
    cy.wait('@fetchActivity');
    cy.get('textarea').type('This is a student answer.');
    cy.get('button#ask-clara').click();
    cy.wait('@getFeedback');
    cy.get('p').contains('This is a student answer.').should('be.visible');
    cy.get('p').contains('This is feedback from Clara.').should('be.visible');
  });

  it('submits the activity', () => {
    cy.wait('@fetchActivity');
    cy.get('textarea').type('This is a student answer.');
    cy.get('button#ask-clara').click();
    cy.wait('@getFeedback');
    cy.get('button#submit-button').click();
    cy.wait('@submitActivity');
    cy.get('.swal2-confirm').click();
    cy.location('pathname').should('eq', '/student_course');
  });

  it('navigates to the student course page when Back button is clicked', () => {
    cy.get('button').contains('Back').click();
    cy.location('pathname').should('eq', '/student_course');
  });

  it('navigates to the student dashboard when Home button is clicked', () => {
    cy.get('button').contains('Home').click();
    cy.location('pathname').should('eq', '/student_dashboard');
  });

  it('logs out and redirects to login', () => {
    cy.get('button').contains('Logout').click();
    cy.wait('@logout');
    cy.location('pathname').should('eq', '/login');
    cy.get('localStorage').should('be.empty');
  });
});
