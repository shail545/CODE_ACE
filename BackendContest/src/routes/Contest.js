const express = require('express');
const contestRouter = express.Router();
const {contestRegister,getContestProblem,getProblem,isregister} = require('../controllers/contestRegister');

contestRouter.post('/contestRegister',contestRegister);
contestRouter.post('/getContesProblem',getContestProblem);
contestRouter.post('/getProblem',getProblem);
contestRouter.post('/isregister',isregister);

module.exports = contestRouter;
