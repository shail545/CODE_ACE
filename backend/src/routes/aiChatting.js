const express = require('express');
const aiRouter =  express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const solveDoubt = require('../controllers/solveDoubt');
const giveQuestion = require('../controllers/giveQuestion');
const {feedback,feedbackData,getTime} = require('../controllers/feedback');


aiRouter.post('/chat', userMiddleware, solveDoubt);
aiRouter.post('/question',userMiddleware,giveQuestion);
aiRouter.post('/feedback',userMiddleware,feedback);
aiRouter.get('/feedbackdata',userMiddleware,feedbackData);
// aiRouter.post('/time',userMiddleware,getTime);

module.exports = aiRouter;