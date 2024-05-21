const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  resources: {
    type: String,
    required: true
  },
  learningActivities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningActivity'
  }]
});

const CourseModel = mongoose.model('Course', CourseSchema);

module.exports = CourseModel;
