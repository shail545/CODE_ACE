const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const mongoose = require('mongoose')
const Contest = require("../models/contest")
const DesignContest = require("../models/designContestSchema")
const ContestDetail = require("../models/ContestDetail");



const createProblemContest = async (req,res)=>{
   
  // API request to authenticate user:
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution, problemCreator
    } = req.body;


    try{
    
      for(const {language,completeCode} of referenceSolution){
         

        // source_code:
        // language_id:
        // stdin: 
        // expectedOutput:

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        const submissions = visibleTestCases?.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));


        const submitResult = await submitBatch(submissions);
        // console.log(submitResult);

        const resultToken = submitResult?.map((value)=> value.token);

        // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
        
       const testResult = await submitToken(resultToken);
    
       for(const test of testResult){
        if(test.status_id!=3){

         return res.status(400).send("Error Occured" + test.status_id);
        }
       }

      }

    const userProblem =  await Contest.create({
        ...req.body,
      });

      res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
       
        res.status(500).send("Error:"+err);
    }
}
const designContest = async (req, res) => {
  console.log(req.body);
  try {
    let contestData = {
      start: req.body.start,
      end: req.body.end,
      contestDate: req.body.contestDate,
      contestProblem: req.body.contestProblem || []
    };

    // If no problems provided in request, get random problems
    if (!req.body.contestProblem || req.body.contestProblem.length === 0) {
      const randomProblems = await Contest.aggregate([
        { $sample: { size: 3 } },
        { $project: { _id: 1 } }
      ]);
      
      contestData.contestProblem = randomProblems.map(p => p._id);
    }
    const newContest = await DesignContest.create(contestData);

    await ContestDetail.findOneAndUpdate(
    { contestId: newContest._id},
    {

    },
    { new: true, upsert: true } // Return updated doc, create if not exists
);
    
    
    res.status(201).json({
      success: true,
      data: newContest
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
const getData = async(req,res)=>{
  try{
   const data = await DesignContest.find({});
   res.status(201).send(data);
  }catch(err){
    res.status(404).send(err);
  }
}

const runProblem = async(req,res)=>{
     try{
      const problemId = req.params.id;
      console.log(problemId)

      let {code,language} = req.body;

     if(!code||!problemId||!language)
       return res.status(400).send("Some field missing");

   //    Fetch the problem from database
      const problem =  await Contest.findById(problemId);
   //    testcases(Hidden)
      if(language==='cpp')
        language='c++'

   //    Judge0 code ko submit karna hai

   const languageId = getLanguageById(language);

   const submissions = problem.visibleTestCases.map((testcase)=>({
       source_code:code,
       language_id: languageId,
       stdin: testcase.input,
       expected_output: testcase.output
   }));


   const submitResult = await submitBatch(submissions);
   
   const resultToken = submitResult.map((value)=> value.token);

   const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;
  
    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = false
            errorMessage = test.stderr
          }
          else{
            status = false
            errorMessage = test.stderr
          }
        }
    }

   
  
   res.status(201).json({
    success:status,
    testCases: testResult,
    runtime,
    memory
   });
      
   }
   catch(err){
     res.status(500).send("Internal Server Error "+ err);
   }
}

// const submitProblem = async (req, res) => {
//     try {
//         // Validate required fields
       
//         const problemId = req.params.id;
//         let { code, language } = req.body;

//         if (!code || !problemId || !language) {
//             return res.status(400).json({ error: "Missing required fields" });
//         }

//         // Normalize language
//         if (language === 'cpp') language = 'c++';

//         // Fetch the problem
//         const problem = await Contest.findById(problemId);
//         if (!problem) {
//             return res.status(404).json({ error: "Problem not found" });
//         }

//         const languageId = getLanguageById(language);
//         if (!languageId) {
//             return res.status(400).json({ error: "Unsupported language" });
//         }

//         const submissions = problem?.hiddenTestCases?.map((testcase) => ({
//             source_code: code,
//             language_id: languageId,
//             stdin: testcase.input,
//             expected_output: testcase.output
//         }));

//         // Submit to Judge0
//         const submitResult = await submitBatch(submissions);
//         const resultTokens = submitResult.map((value) => value.token);

//         // Get test results
//         const testResults = await submitToken(resultTokens);

//         // Process results
//         let testCasesPassed = 0;
//         let runtime = 0;
//         let memory = 0;
//         let status = 'accepted';
//         let errorMessage = null;

//         for (const test of testResults) {
//             if (test.status_id === 3) { // Accepted
//                 testCasesPassed++;
//                 runtime += parseFloat(test.time) || 0;
//                 memory = Math.max(memory, test.memory || 0);
//             } else {
//                 if (test.status_id === 4) { // Runtime Error
//                     status = 'error';
//                 } else { // Wrong Answer or other errors
//                     status = 'wrong';
//                 }
//                 // Sanitize error message
//                 errorMessage = test.stderr ? test.stderr.slice(0, 500) : 'Unknown error';
//                 break; // Stop on first failure
//             }
//         }

    

         
//         res.status(201).json({
//             accepted: status === 'accepted',
//             passedTestCases: testCasesPassed,
//             runtime: parseFloat(runtime.toFixed(4)),
//             memory
//         });

//     } catch (err) {
//         console.error('Error in submitPotd:', err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };
const submitProblem = async (req, res) => {
    try {
        // Validate required fields
        const problemId = req.params.id;
        const contestId= req.body.contest_id; 
        let { code, language } = req.body;

        if (!code || !problemId || !language || !contestId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        console.log(problemId,contestId);
       
        // Normalize language
        if (language === 'cpp') language = 'c++';

        // Fetch the problem
        const problem = await Contest.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        const languageId = getLanguageById(language);
        if (!languageId) {
            return res.status(400).json({ error: "Unsupported language" });
        }

        const submissions = problem?.hiddenTestCases?.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        // Submit to Judge0
        const submitResult = await submitBatch(submissions);
        const resultTokens = submitResult.map((value) => value.token);

        // Get test results
        const testResults = await submitToken(resultTokens);

        // Process results
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = null;

        for (const test of testResults) {
            if (test.status_id === 3) { // Accepted
                testCasesPassed++;
                runtime += parseFloat(test.time) || 0;
                memory = Math.max(memory, test.memory || 0);
            } else {
                if (test.status_id === 4) { // Runtime Error
                    status = 'error';
                } else { // Wrong Answer or other errors
                    status = 'wrong';
                }
                errorMessage = test.stderr ? test.stderr.slice(0, 500) : 'Unknown error';
                break;
            }
        }

        // Only update contest if problem was solved successfully
        if (status === 'accepted') {
            // Find the contest
            const contest = await ContestDetail.findOne({
                 'participants.user': contestId
            });
           
            if (!contest) {
                console.warn(`Contest ${contestId} not found - skipping update`);
            } else {
                // Find or create participant

                // Check if problem already solved
                const questionNumber = problemId; 
                const participant = contest.participants.find(p => p.user.equals(contestId));
               
              
               const alreadySolved = participant.solvedQuestions.some(q => 
                    q.questionNumber === questionNumber
                );
                if (!alreadySolved) {
                    participant.solvedQuestions.push({
                        questionNumber: questionNumber,
                        solvedAt: new Date()
                    });
                    participant.totalSolved += 1;
                    await contest.save();
                }
            }
        }

        res.status(201).json({
            accepted: status === 'accepted',
            passedTestCases: testCasesPassed,
            runtime: parseFloat(runtime.toFixed(4)),
            memory,
            message: status === 'accepted' ? 'Problem solved successfully!' : errorMessage
        });

    } catch (err) {
        console.error('Error in submitProblem:', err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const result = async (req, res) => {
  const { contest_id } = req.body;

  if (!contest_id) {
    return res.status(400).json({ 
      success: false,
      message: 'contest_id is required' 
    });
  }

  try {
    // Corrected the findById query - it should take just the ID string
    const contest = await ContestDetail.findOne({contestId:contest_id});
    
    if (!contest) {
      return res.status(404).json({ 
        success: false,
        message: 'Contest not found' 
      });
    }

    console.log('Found contest:', contest.participants);
    res.status(200).json({ 
      success: true,
      data: contest.participants, 
    });

  } catch (err) {
    console.error('Error fetching contest results:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching contest results',
      error: err.message 
    });
  }
};
module.exports = {createProblemContest,designContest,getData,runProblem,submitProblem,result};