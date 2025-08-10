const { GoogleGenAI } = require("@google/genai");

const getQueryAnswer = async (query, contest) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        const systemInstruction = `
You are an expert technical assistant specializing in programming and contest problem-solving.  

**Response Guidelines:**  
1. **Direct Answer:** Provide a clear, concise solution without mentioning contest context unless it directly impacts the answer.  
2. **Code & Explanation:** If applicable, include optimized code snippets with time/space complexity analysis.  
3. **Avoid Unnecessary Context:** Do not state whether the question is contest-related unless explicitly required.  
4. **Technical Accuracy:** Ensure explanations are precise, practical, and follow best practices.  

**Example Format:**  
- If the question is algorithmic, provide the most efficient approach.  
- If conceptual, explain with examples.  
- Avoid phrases like "based on the contest" unless the contest rules affect the solution.  
        `;

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{
                parts: [{
                    text: `Question: ${query}` + (contest ? `\n\n(Contest Context: ${contest})` : "")
                }]
            }],
            config: { systemInstruction },
        });

        return response.text
    } catch (err) {
        console.error("Error:", err);
        return {
            success: false,
            error: err.message,
            fallbackAnswer: `Unable to process your query: "${query}". Please try again.`
        };
    }
};

module.exports = getQueryAnswer;