const axiosClient = require('../utils/axiosClient');
const ContestDetail = require('../models/ContestDetail');
const DesignContest = require('../models/designContestSchema')
const Contest = require('../models/contest');


const contestRegister = async (req, res) => {
  try {
    const { id ,contestId} = req.body;
    

    // // First check if user is already registered in any contest
    // const existingRegistration = await ContestDetail.findOne({
    //   'participants.user': id
    // });
    const contests = await ContestDetail.findOne({ contestId: contestId });
      
    const existingRegistration = contests?.participants?.some(
      participant => participant.user == id
      
    );
    
    if (existingRegistration) {
      return res.status(200).json({ 
        success: true,
        message: 'User already registered in a contest' 
      });
    }

    // Get user details
    
    const response = await axiosClient.post('/user/finduser', { id });
    const user = response.data;
    
    // Create new contest registration
    const contest = await ContestDetail.find({contestId:contestId});
    const newContest = await ContestDetail.findOneAndUpdate(
    { contestId: contestId },
    {
        $push: {
            participants: {
                user: id,
                username: `${user.firstName} ${user.lastName}`,
                solvedQuestions: [],
                totalSolved: 0
            }
        }
    },
    { new: true, upsert: true } // Return updated doc, create if not exists
);
    res.status(201).json({ 
      success: true,
      contest: newContest 
    });
  } catch (err) {
    console.error('Error in contestRegister:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

const getContestProblem = async (req, res) => {
  try {
   
    const {contest_id}=req.body;

    const data = await DesignContest.findById(contest_id);
   
    const arr = [];

    for(arri of data.contestProblem){
      let problem = await Contest.findById(arri);
      arr.push(problem);
    }
    res.status(201).json(arr);
  } catch (err) {
    console.error('Error in contestRegister:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

const getProblem = async (req,res)=>{
  try{
    const {problem_id}=req.body;
   const problem = await Contest.findById(problem_id)
   res.send(problem);
  }catch(err){
    res.send(err);
  }
}

const isregister = async (req, res) => {
  try {
    const { contestId, userId } = req.body;
  
  
    const contest = await ContestDetail.findOne({ contestId: contestId });
      
    const isRegistered = contest?.participants?.some(
      participant => participant.user == userId
      
    );
    res.json({
      isRegistered: isRegistered,
    });
    
  } catch (err) {
    console.error("Error in isregister:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
module.exports = {contestRegister,getContestProblem,getProblem,isregister};