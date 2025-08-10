const { GoogleGenAI } = require("@google/genai");

const generateBehavioralQuestions = async (req, res) => {
    try {
        const { technology, difficulty, interviewType, duration } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        async function main() {
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [{
                    parts: [{
                        text: `Generate ${interviewType} interview questions for ${technology}`
                    }]
                }],
                config: {
                    systemInstruction: `
You are an expert interview question generator. Create behavioral questions based on:

TECHNOLOGY: ${technology || 'JavaScript'}
DIFFICULTY: ${difficulty || 'medium'}
INTERVIEW TYPE: ${interviewType || 'behavioral'}
DURATION: ${duration || '30'} minutes

GENERATION RULES:
1. Create exactly 10 questions
2. Focus on ${technology} specific behavioral scenarios
3. Maintain ${difficulty} difficulty level
4. Questions should fit within ${duration} minute interview
5. Include questions about:
   - Problem-solving approaches
   - Team collaboration
   - Technical challenges
   - Code quality practices
   - Learning experiences

RESPONSE FORMAT:
Return ONLY a JSON array like:
[
  "Question 1...",
  "Question 2...",
  ...
]

EXAMPLE QUESTIONS:
- "Describe a time you solved a tricky ${technology} problem..."
- "How do you handle disagreements about ${technology} best practices..."
- "Tell me about a ${technology} code review experience..."

IMPORTANT:
- Only return the array
- No additional text or numbering
- Questions should be 1-2 sentences each
                    `},
            });

            // Parse and clean response
            let questions;
            try {
                questions = JSON.parse(response.text().trim());
            } catch (e) {
                const match = response.text.match(/\[.*\]/s);
                questions = match ? JSON.parse(match[0]) : getFallbackQuestions(technology);
            }

            // Ensure we have exactly 10 questions
            questions = questions.slice(0, 10);
            if (questions.length < 10) {
                questions = questions.concat(getFallbackQuestions(technology).slice(0, 10));
            }

            res.status(200).json({ questions });
        }

        main();
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message,
            questions: getFallbackQuestions(req.body.technology)
        });
    }
};

// Fallback questions if API fails
function getFallbackQuestions(tech) {
    return [
        `Describe a challenging ${tech} problem you solved recently. What was your approach?`,
        `How do you stay updated with best practices in ${tech} development?`,
        `Tell me about a time you had to debug a complex ${tech} application.`,
        `Describe your process for reviewing ${tech} code written by others.`,
        `How do you handle disagreements about ${tech} implementation approaches?`,
        `Give an example of how you've mentored others in ${tech}.`,
        `Describe a ${tech} project where you had to balance quality and deadlines.`,
        `What's your strategy for testing ${tech} applications?`,
        `Tell me about a time you improved an existing ${tech} codebase.`,
        `How do you approach learning new ${tech} frameworks or libraries?`
    ];
}

module.exports = generateBehavioralQuestions;