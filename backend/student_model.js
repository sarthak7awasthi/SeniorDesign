const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  student:{
    type: Boolean,
    required: true
  },
  courses: [{
    type: String
  }]
});

const StudentModel = mongoose.model('Student', StudentSchema);

module.exports = StudentModel;
