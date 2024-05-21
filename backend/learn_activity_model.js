const mongoose = require('mongoose');

const LearningActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
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
  instructorId: {
    type: String,
    required: true
  },
  materials: [String],
  instructions: {
    type: String,
    required: true
  },
  idealAnswer: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    required: true,
    default: false
  }
});

const LearningActivityModel = mongoose.model('LearningActivity', LearningActivitySchema);

module.exports = LearningActivityModel;
