const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  idealAnswer: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const SubmissionModel = mongoose.model('Submission', SubmissionSchema);

module.exports = SubmissionModel;
