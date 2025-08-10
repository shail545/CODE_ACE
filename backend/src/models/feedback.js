// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  overallScore: {
    type: Number,
    required: true
  },
  feedback: [{
    question: String,
    answer: String,
    technicalAccuracy: Number,
    clarity: Number,
    completeness: Number,
    detailedFeedback: String,
    suggestedImprovement: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Feedback =  mongoose.model('Feedback', feedbackSchema);
module.exports =Feedback;