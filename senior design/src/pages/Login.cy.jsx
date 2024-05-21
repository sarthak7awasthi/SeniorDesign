import React from 'react'
import Login from './Login'
import { BrowserRouter as Router } from 'react-router-dom';

describe('<Login />', () => {
  beforeEach(() => {
    cy.mount(
      <Router>
        <Login />
      </Router>
    );
  });

  it('renders', () => {
    cy.get('form').should('be.visible');
  });

  it('displays error message if login fails', () => {
    cy.intercept('POST', 'http://localhost:3000/login', {
      statusCode: 400,
      body: { message: 'Invalid credentials' }
    }).as('login');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('redirects to home page after successful login', () => {
    cy.intercept('POST', 'http://localhost:3000/login', {
      statusCode: 200
    }).as('login');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('correctpassword');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.location('pathname').should('eq', '/');
  });
});

