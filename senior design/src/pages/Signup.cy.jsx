import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom';
import Signup from './Signup';

describe('Signup Component', () => {
    beforeEach(() => {
      cy.mount(
        <Router>
          <Signup />
        </Router>
      );
    });
  
    it('displays error message if passwords do not match', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').eq(0).type('password1');
      cy.get('input[type="password"]').eq(1).type('password2');
      cy.get('button[type="submit"]').click();
      cy.contains('Passwords do not match').should('be.visible');
    });
  
    it('displays error message if signup fails', () => {
      cy.intercept('POST', 'http://localhost:3000/signup', {
        statusCode: 400,
        body: { message: 'User already exists' }
      }).as('signup');
  
      cy.get('input[type="email"]').type('cypresstesting@gmail.com');
      cy.get('input[type="password"]').eq(0).type('testing7&');
      cy.get('input[type="password"]').eq(1).type('testing7&');
      cy.get('button[type="submit"]').click();
      cy.wait('@signup');
      cy.contains('User already exists').should('be.visible');
    });
  
    it('redirects to login page after successful signup', () => {
      cy.intercept('POST', 'http://localhost:3000/signup', {
        statusCode: 200
      }).as('signup');
  
      cy.get('input[type="email"]').type('newuser@example.com');
      cy.get('input[type="password"]').eq(0).type('password7&');
      cy.get('input[type="password"]').eq(1).type('password7&');
      cy.get('button[type="submit"]').click();
      cy.wait('@signup');
      cy.location('pathname').should('eq', '/login');
    });
  });