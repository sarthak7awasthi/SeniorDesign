import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';

function CreateActivityModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    materials: [],
    instructions: '',
    idealAnswer: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prevState => ({
      ...prevState,
      materials: files
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({
      title: '',
      materials: '',
      instructions: '',
      idealAnswer: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Learning Activity</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            fullWidth
            margin="normal"
          />
          <Box sx={{ mb: 2 }}>
            <label>Materials:  </label>
            <input type="file" name="materials" onChange={handleFileInputChange} multiple />
          </Box>
          <TextField
            label="Instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleInputChange}
            required
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            label="Ideal Answer"
            name="idealAnswer"
            value={formData.idealAnswer}
            onChange={handleInputChange}
            required
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
        <Button variant='contained' onClick={onClose} color="secondary">Cancel</Button>
          <Button type="submit" color="primary" variant="contained">Create</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

CreateActivityModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired
};

export default CreateActivityModal;
