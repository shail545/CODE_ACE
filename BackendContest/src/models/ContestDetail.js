const mongoose = require('mongoose');
const {Schema} = mongoose;


const ContestSchema = new Schema({
  contestId:{
    type:String,
    required:true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    solvedQuestions: [{
      questionNumber: {
        type: String,
        required: true
      },
      solvedAt: {
        type: Date,
        required: true
      },
    }],
    totalSolved: {
      type: Number,
      default: 0
    },
  }]
});

const ContestDetail = mongoose.model('ContestDetails', ContestSchema);

module.exports = ContestDetail;