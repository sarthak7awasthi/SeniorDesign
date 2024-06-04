import React from 'react';
import ViewSubmissions from './ViewSubmissions';
import { BrowserRouter as Router } from 'react-router-dom';
import { mount } from 'cypress/react';

describe('<ViewSubmissions />', () => {
  const submissionsData = [
    {
      _id: '1',
      studentName: 'John Doe',
      answer: 'This is the student\'s answer.',
      submittedAt: new Date().toISOString(),
      instructions: 'These are the instructions.',
      idealAnswer: 'This is the ideal answer.'
    }
  ];

  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:3000/view_submissions', {
      statusCode: 200,
      body: submissionsData
    }).as('fetchSubmissions');

    cy.intercept('POST', 'http://localhost:3000/logout', {
      statusCode: 200
    }).as('logout');

    localStorage.setItem('token', 'valid_token');
    localStorage.setItem('student', 'false');

    mount(
      <Router>
        <ViewSubmissions />
      </Router>
    );
  });

  it('renders and displays the submissions', () => {
    cy.wait('@fetchSubmissions');
    cy.get('h4').should('contain', 'Submissions for');
    cy.get('strong').contains('Instructions:').should('contain', 'These are the instructions.');
    cy.get('strong').contains('Ideal Answer:').should('contain', 'This is the ideal answer.');
    cy.get('h6').contains('John Doe').should('be.visible');
    cy.get('strong').contains('Student Answer:').should('contain', 'This is the student\'s answer.');
  });

  it('redirects to login if no token is found', () => {
    localStorage.removeItem('token');
    mount(
      <Router>
        <ViewSubmissions />
      </Router>
    );
    cy.location('pathname').should('eq', '/login');
  });

  it('redirects to login if the user is a student', () => {
    localStorage.setItem('student', 'true');
    mount(
      <Router>
        <ViewSubmissions />
      </Router>
    );
    cy.location('pathname').should('eq', '/login');
  });

  it('navigates to the course page when Back button is clicked', () => {
    cy.get('button').contains('Back').click();
    cy.location('pathname').should('eq', '/course');
  });

  it('navigates to the home page when Home button is clicked', () => {
    cy.get('button').contains('Home').click();
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('logs out and redirects to login', () => {
    cy.get('button').contains('Logout').click();
    cy.wait('@logout');
    cy.location('pathname').should('eq', '/login');
    cy.get('localStorage').should('be.empty');
  });
});
