import React from 'react';
import CreateActivityModal from './CreateActivityModal';
import { mount } from 'cypress/react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';

describe('<CreateActivityModal />', () => {
  const onCreate = cy.stub().as('onCreate');
  const onClose = cy.stub().as('onClose');

  beforeEach(() => {
    mount(
      <CreateActivityModal 
        isOpen={true} 
        onClose={onClose} 
        onCreate={onCreate} 
      />
    );
  });

  it('renders', () => {
    cy.get('div[role="dialog"]').should('be.visible');
  });

  it('fills out the form and submits', () => {
    cy.get('input[name="title"]').type('New Activity');
    cy.get('input[name="materials"]').attachFile('sample-material.pdf');
    cy.get('textarea[name="instructions"]').type('These are the instructions for the activity.');
    cy.get('textarea[name="idealAnswer"]').type('This is the ideal answer.');

    cy.get('button[type="submit"]').click();

    cy.get('@onCreate').should('have.been.calledWith', {
      title: 'New Activity',
      materials: [new File(['sample-material.pdf'], 'sample-material.pdf')],
      instructions: 'These are the instructions for the activity.',
      idealAnswer: 'This is the ideal answer.'
    });

    cy.get('@onClose').should('have.been.called');
  });

  it('calls onClose when cancel button is clicked', () => {
    cy.get('button').contains('Cancel').click();
    cy.get('@onClose').should('have.been.called');
  });
});
