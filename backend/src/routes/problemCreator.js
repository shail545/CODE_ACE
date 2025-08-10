const express = require('express');

const problemRouter =  express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,
    solvedAllProblembyUser,submittedProblem,getPremiumProblem,
    AddBuyProblem,getAllProblems,createProblemPotd,createProblemContest} = require("../controllers/userProblem");
const userMiddleware = require("../middleware/userMiddleware");


// Create
problemRouter.post("/create",adminMiddleware ,createProblem);
problemRouter.post("/createpotd",adminMiddleware ,createProblemPotd);
problemRouter.put("/update/:id",adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware, deleteProblem);
problemRouter.post("/addBuyProblem",userMiddleware,AddBuyProblem );


problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware, getAllProblem);
problemRouter.get("/getAllProblems",userMiddleware, getAllProblems);
problemRouter.get("/getpreminumProblem",userMiddleware, getPremiumProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);




module.exports = problemRouter;

// fetch
// update
// delete 
