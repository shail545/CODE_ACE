
const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const {submitCode,runCode,runPotd,submitPotd} = require("../controllers/userSubmission");
const rateLimmiter = require('../middleware/rateLimmiter');

// submitRouter.use();
submitRouter.post("/submit/:id", userMiddleware, submitCode);
submitRouter.post("/run/:id",userMiddleware,rateLimmiter,runCode);
submitRouter.post("/runpotd/:id",userMiddleware,rateLimmiter,runPotd);
submitRouter.post("/submitpotd/:id", userMiddleware, submitPotd);


module.exports = submitRouter;
