const chatbotService = require("../services/chatbotService");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const Chat = require("../database/model/Chat");

const { addMessageToChat, getRecommendation } = require("../database/mongoHandler");
const { CHAT_CONTEXT_REC } = require("../prompts/chatContext");

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

//TODO: set up functions for chatbot

// ============================================
// Chat Agent Support Functions
// ============================================
function obtainAIAgent() {
    if (!GROQ_API_KEY) {
        throw new Error("Missing Groq API Key");
    }
    return new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: process.env.AI_BASE_URL });
}

async function obtainChatResponse(messages) {
    const client = obtainAIAgent();

    try {
        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            max_completion_tokens: 4096,
            top_p: 0.95,
            response_format: {
                type: "json_object",
            },
        });

        if (!response || !response.choices || response.choices.length === 0) {
            console.error("🚨 GROQ SDK Error: No response or choices found");
            return res.status(500).json({ reply: "GROQ SDK Error: No response or choices found" });
        }
        const botMessage = JSON.parse(response.choices[0].message.content);

        return botMessage;
    } catch (error) {
        console.error("🚨 GROQ SDK Rec Error:", error);
    }
}

// ============================================
// Chatbot Logic Functions
// ============================================

async function parseUserMessage(chatId, userId, message) {
    console.log(`🛠 Sending request to GROQ API using SDK for ${userId} in ${chatId}`);
    let chat = await Chat.findById(chatId).withMessages();
    const messages = chat.messages.map((message) => {
        return { role: message.role, content: message.content };
    });

    const temp = await addMessageToChat("user", message, userId, chat, null, false);
    if (temp.status != "success") throw new Error("Failed to process message");
    messages.push({ role: "user", content: message });

    try {
        let recommendationItems = { content: null, recommendation: null };
        const botMessage = await obtainChatResponse(messages);
        let content = `${botMessage.response.content}${botMessage.response.content && botMessage.summary ? "\n\n" : ""}${botMessage.summary ? `Current summary: ${botMessage.summary}` : ""}`;
        if (botMessage.status == "recommending") {
            recommendationItems = await makeRecommendation(chat, messages, botMessage);
            content = recommendationItems.content;
        } else {
            //TODO: optimize to do one push to the server and also not create so many references
            await addMessageToChat("assistant", content, userId, chat, null, false);
            await addMessageToChat("system", JSON.stringify(botMessage), userId, chat, null, false);
            await chat.save();
            messages.push({ role: "user", content: message }, { role: "assistant", content: content }, { role: "system", content: botMessage });
        }

        const responsePayload = {
            status: "success",
            response: { role: botMessage.response.role, content: content },
        };
        if (recommendationItems.recommendation) {
            responsePayload.response.recommendation = recommendationItems.recommendation;
        }

        return responsePayload;
    } catch (error) {
        console.error("🚨 Error parsing message:", error);
        return { status: "fail", status_message: error.message, response: "Something went wrong, try again" };
    }
}

async function makeRecommendation(chat, messages, botMessage) {
    const recProducts = await getRecommendation(botMessage.criteria);
    messages[0] = { role: "system", content: `${CHAT_CONTEXT_REC}\n\nPRODUCTS LIST ${JSON.stringify(recProducts)}` };
    try {
        const botMessage = await obtainChatResponse(messages);
        const content = `${botMessage.response.content}${botMessage.response.content && botMessage.summary ? "\n\n" : ""}${botMessage.summary ? `Current summary: ${botMessage.summary}` : ""}`;
        //TODO: optimize to do one push to the server and also not create so many references
        await addMessageToChat("assistant", content, chat.creator, chat, null, false);
        await addMessageToChat("system", JSON.stringify(botMessage), chat.creator, chat, null, false);

        // console.log("recommendation results", botMessage);
        // TODO optimize the calls to the server for the product
        const recommendation = {
            display: `${new Date().toLocaleDateString().replace(/\//g, "_")}-rec`,
            // items: {
                ...Object.keys(botMessage.results).reduce((acc, key) => {
                    if (botMessage.results[key]._id) {
                        acc[key] = botMessage.results[key]._id;
                    }
                    return acc;
                }, {}),
            // },
        };
        const re2 = chat.recommendation.push(recommendation);
        await chat.save();


        return { content: content, recommendation: (await Chat.findById(chat._id).withRecommendations()).recommendation.at(-1) };
    } catch (error) {
        console.error("🚨 Rec Error:", error);
        return { status: "fail", status_message: error.message, response: "Something went wrong, try again" };
    }
}

// ============================================
// Chat Agent API
// ============================================
exports.processRecommendation = async (req, res) => {
    const { chatId, message, userId } = req.body;
    try {
        const response = await parseUserMessage(chatId, userId, message);
        if (response.status != "success") return res.status(500).json({ status: response.status, status_message: response.status_message, message: response.response });
        return res.status(200).json({ status: "success", status_message: ``, message: response.response });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "fail", status_message: err._message });
    }
};

exports.testRec = async (req, res) => {
    const { chatId, criteria } = req.body;
    try {
        let chat = await Chat.findById(chatId).withMessages();

        return res.status(201).json({
            status: "success",
            status_message: ``,
            response: await makeRecommendation(
                chat,
                chat.messages.map((msg) => ({ role: msg.role, content: msg.content })),
                { criteria: criteria }
            ),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "fail", status_message: err._message });
    }
};
