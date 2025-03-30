const express = require("express");
const dotenv = require("dotenv");
const { processRecommendation } = require("../controllers/chatbotController");
const { createChat, getChat } = require("../controllers/chatController");

dotenv.config();
const router = express.Router();

router.post("/chat", async (req, res) => {
    const fetch = (await import("node-fetch")).default;
    const userMessage = req.body.message;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        console.error("🚨 Missing API Key");
        return res.status(500).json({ reply: "API key is missing." });
    }

    try {
        console.log("🛠 Sending request to GROQ API...");

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: userMessage }],
            }),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error("🚨 GROQ API Error:", errorDetails);
            return res.status(response.status).json({ reply: `GROQ API Error: ${errorDetails}` });
        }

        const data = await response.json();
        console.log("✅ Response from GROQ:", data);
        res.json({ reply: data.choices[0].message.content });
    } catch (error) {
        console.error("🚨 Error connecting to GROQ API:", error);
        res.status(500).json({ reply: "Failed to connect to GROQ." });
    }
});

router.post("/create-chat", createChat);
router.post("/get-chat", getChat);

router.post("/recommend", processRecommendation);
router.get("/recommend", async (req, res) => {
    res.status(200).json({ response: "hi" });
});

module.exports = router;

// Have the llm look at the response and look for patterns in the response to determine what are the user looking for, if info is missing ask for it - once all info is there make a rec
