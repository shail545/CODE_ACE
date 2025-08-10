const mongoose = require('mongoose');
const { Schema } = mongoose;

const designContestSchema = new Schema({
    start: {
        type: String,
        required: true, 
    },
    end: {
        type: String,
        required: true,
    },
    contestDate: {
        type: String,
        required: true,
    },
    contestProblem: [{
        type: String,
        required: true,
    }]
}, {
    timestamps: true 
});

const DesignContest = mongoose.model('DesignContest', designContestSchema);  

module.exports = DesignContest;