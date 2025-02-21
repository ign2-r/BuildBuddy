const axios = require('axios');

const GROQ_API_URL = "https://api.groq.com/v1/chat/completions";
const API_KEY = process.env.GROQ_API_KEY;

exports.getChatResponse = async (message) => {
    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: "mixtral-8x7b-32768", // using for now as a test
                messages: [{ role: "user", content: message }]
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling Groq API:", error);
        throw new Error("Failed to fetch chatbot response");
    }
};
