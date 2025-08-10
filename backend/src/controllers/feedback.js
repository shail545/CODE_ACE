const { GoogleGenerativeAI } = require("@google/generative-ai");
const Feedback = require('../models/feedback');

const feedback = async (req, res) => {
    try {
        // Validate input
        if (!req.body.questions || !req.body.answers) {
            return res.status(400).json({
                error: "Invalid request format. Expected { questions: [], answers: [] }"
            });
        }

        if (req.body.questions.length !== req.body.answers.length) {
            return res.status(400).json({
                error: "Questions and answers arrays must be of equal length"
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create structured prompt
        const qnaPairs = req.body.questions.map((q, i) => ({
            question: q,
            answer: req.body.answers[i] || "No answer provided"
        }));

        const prompt = `You are an interview evaluation expert. Analyze these interview Q&A pairs and provide detailed feedback.
        For each pair, evaluate:
        1. Technical accuracy (score 0-5, if technical question)
        2. Clarity of response (score 0-5)
        3. Completeness of answer (score 0-5)
        4. Provide detailed feedback
        5. Suggested improvements
        
        IMPORTANT: Return ONLY valid JSON in this exact format:
        {
            "overallScore": 0-5,
            "feedback": [
                {
                    "question": "original question",
                    "answer": "original answer",
                    "technicalAccuracy": 0-5,
                    "clarity": 0-5,
                    "completeness": 0-5,
                    "detailedFeedback": "paragraph with detailed analysis",
                    "suggestedImprovement": "specific suggestions"
                }
            ]
        }

        Q&A Pairs to analyze:
        ${JSON.stringify(qnaPairs, null, 2)}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let feedbackData;
        try {
            const cleanText = text.replace(/```json|```/g, '').trim();
            feedbackData = JSON.parse(cleanText);
            
            // Validate structure
            if (typeof feedbackData.overallScore !== 'number' || 
                !Array.isArray(feedbackData.feedback) ||
                feedbackData.feedback.some(item => 
                    !item.question || !item.answer ||
                    typeof item.technicalAccuracy !== 'number' ||
                    typeof item.clarity !== 'number' ||
                    typeof item.completeness !== 'number'
                )) {
                throw new Error("Invalid feedback structure from AI");
            }
        } catch (e) {
            console.error("Parsing error:", e);
            console.error("Raw AI output:", text);
            throw new Error("Failed to parse AI response. The response format was invalid.");
        }

        // Create feedback document to store in database
        const feedbackDoc = {
            user: req.result._id, // Assuming you have user authentication middleware
            overallScore: feedbackData.overallScore,
            feedback: feedbackData.feedback.map(item => ({
                question: item.question,
                answer: item.answer,
                technicalAccuracy: item.technicalAccuracy,
                clarity: item.clarity,
                completeness: item.completeness,
                detailedFeedback: item.detailedFeedback,
                suggestedImprovement: item.suggestedImprovement
            })),
            createdAt: new Date()
        };

        // Save to database
        const savedFeedback = await Feedback.create(feedbackDoc);

        // Send successful response with the saved data
        res.status(201).json({
            message: "Feedback generated and saved successfully",
            feedback: savedFeedback
        });

    } catch (err) {
        console.error("Error in feedback generation:", err);
        res.status(500).json({
            error: "Failed to generate feedback",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const feedbackData = async(req,res)=>{
   try{
    const id = req.result._id;
    const data = await Feedback.find({user:id});
    res.send(data);
   }catch(err){
    res.send(err);
   }
}

const getTime = async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Generate 10 computer science interview questions. 
        Return only a JavaScript array of question strings, like this:
        [
            "What does the 'C' stand for in CSS?",
            "Which HTML tag is used to create an unordered list?",
            "What does API stand for?"
        ]
        Do not include any explanations or additional text, just the array.
        and evertime give new questions.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response to ensure it's a proper array
        let questions;
        try {
            questions = JSON.parse(text.trim());
        } catch (e) {
            // If direct parse fails, try to extract array from markdown
            const match = text.match(/\[.*\]/s);
            if (match) {
                questions = JSON.parse(match[0]);
            } else {
                throw new Error("Could not parse questions from response");
            }
        }

        res.status(200).json({
            questions: questions
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};
module.exports = {feedback,feedbackData,getTime};