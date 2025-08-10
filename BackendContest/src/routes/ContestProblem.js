const express = require('express');
const problemRouter = express.Router();
const {createProblemContest,designContest,getData,runProblem,submitProblem,result}=require('../controllers/contestProblem');

problemRouter.post("/createContest",createProblemContest);
problemRouter.post("/DesignContest",designContest);
problemRouter.get("/getContestData",getData);
problemRouter.post("/runProblem/:id",runProblem);
problemRouter.post("/submitProblem/:id",submitProblem);
problemRouter.post("/res",result);


module.exports = problemRouter;