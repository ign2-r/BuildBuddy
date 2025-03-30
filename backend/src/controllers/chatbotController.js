// chatbotController.js
const chatbotService = require("../services/chatbotService");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const Chat = require("../database/model/Chat");

const mongoose = require("mongoose");
const Message = require("../database/model/Message");
const { addMessageToChat, getRecommendation } = require("../database/mongoHandler");
const { VALID_CAT } = require("../database/model/Product");
const { createFromHexString } = mongoose.Types.ObjectId;

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const INITIAL_MESSAGE = "Hello! How can I assist you today? Please give me any budget restraints or what you are looking for today!";
const CHAT_CONTEXT = `Help a user pick PC parts.

RULES:
- Ask short questions to fill in missing info.
- NEVER guess. No assumptions.
- Don't recommend parts until all info is collected.

Return JSON:
{
  "response": { "role": "assistant", "content": "<string>" },
  "summary": "<summary>",
  "criteria": {
    ${VALID_CAT.map(
      (cat) => `"${cat}": {
        "min": <num>,
        "max": <num>,
        "prefs": ["<str>"]
      }`
    )}
  },
  "status": "<questioning|recommending>"
}

Only show response.content to user.
Use [ ] for lists.
When unsure, ask. If ready, switch to "recommending".`;

const CHAT_CONTEXT_REC = `Recommend PC parts using only the given PRODUCTS list.

RULES:
- Use only provided items.
- Max 3 per component.
- Use exact names.
- Be brief and clear.

JSON format:
{
  "response": { "role": "assistant", "content": "<string>" },
  "summary": "<summary>",
  "results": {
    ${VALID_CAT.map(
      (cat) => `"${cat}": {
        "_id": "<id>",
        "name": "<name>"
      }`
    )}
  },
  "status": "recommending"
}`;

function obtainAIAgent() {
    if (!GROQ_API_KEY) {
        throw new Error("Missing Groq API Key");
    }
    return new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: process.env.AI_BASE_URL });
}

async function createChat(userId) {
    const chat = new Chat({
        display: "Chat 123",
        creator: createFromHexString(userId),
        messages: [],
    });
    const message = await addMessageToChat("system", CHAT_CONTEXT, userId, chat, false);
    if (message.status != "success") throw new Error(message.status_message);
    const message2 = await addMessageToChat("assistant", INITIAL_MESSAGE, userId, chat);
    if (message2.status != "success") throw new Error(message2.status_message);
    return { chat, message, message2 };
}

async function parseUserMessage(chatId, userId, message) {
    const client = obtainAIAgent();

    console.log(`🛠 Sending request to GROQ API using SDK for ${userId} in ${chatId}`);
    let chat = await Chat.findById(chatId).withMessages();

    if (!chat || !chat.messages) {
        console.error("Invalid chat data passed to parseUserMessage:", chat);
        return null;
    }

    const messages = chat.messages.map((message) => {
        return { role: message.role, content: message.content };
    });

    const temp = await addMessageToChat("user", message, userId, chat, null, false);
    if (temp.status != "success") throw new Error("Failed to process message");
    messages.push({ role: "user", content: message });

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

        console.log("GROQ Token Usage (if provided):", response.usage);

        if (!response || !response.choices || response.choices.length === 0) {
            console.error("🚨 GROQ SDK Error: No response or choices found");
            return res.status(500).json({ reply: "GROQ SDK Error: No response or choices found" });
        }

        const botMessage = JSON.parse(response.choices[0].message.content);
        let content = `${botMessage.response.content}${botMessage.response.content && botMessage.summary ? "\n\n" : ""}${
            botMessage.summary ? `Current summary: ${botMessage.summary}` : ""
        }`;
        if (botMessage.status == "recommending") {
            content = await makeRecommendation(chat, messages, botMessage);
        } else {
            //TODO: optimize to do one push to the server and also not create so many references
            await addMessageToChat("assistant", content, userId, chat, null, false);
            await addMessageToChat("system", JSON.stringify(botMessage), userId, chat, null, false);
            await chat.save();
            messages.push({ role: "user", content: message }, { role: "assistant", content: content }, { role: "system", content: botMessage });
        }

        return {
            status: "success",
            response: { role: botMessage.response.role, content: content, all: botMessage },
        };
    } catch (error) {
        console.error("🚨 GROQ SDK Error:", error);
        return { status: "fail", status_message: error.message, response: "Something went wrong, try again" };
    }
}

async function makeRecommendation(chat, messages, botMessage) {
    const client = obtainAIAgent();

    const recProducts = await getRecommendation(botMessage.criteria);
    messages[0] = { role: "system", content: `${CHAT_CONTEXT_REC}\n\nPRODUCTS LIST ${JSON.stringify(recProducts)}` };
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
        const content = `${botMessage.response.content}${botMessage.response.content && botMessage.summary ? "\n\n" : ""}${
            botMessage.summary ? `Current summary: ${botMessage.summary}` : ""
        }`;
        //TODO: optimize to do one push to the server and also not create so many references
        await addMessageToChat("assistant", content, chat.creator, chat, null, false);
        await addMessageToChat("system", JSON.stringify(botMessage), chat.creator, chat, null, false);
        await chat.save();

        console.log(botMessage);

        return content;
    } catch (error) {
        console.error("🚨 GROQ SDK Rec Error:", error);
        return { status: "fail", status_message: error.message, response: "Something went wrong, try again" };
    }
}

exports.processMessage = async (req, res) => {
    try {
        const { message, chatId, userId } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const response = await chatbotService.getChatResponse(message);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
};

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

exports.createChat = async (req, res) => {
    const { userId } = req.body;
    try {
        const { chat, message, message2 } = await createChat(userId);
        return res.status(201).json({ status: "success", status_message: `${message.status} to create chat`, chat: chat._id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "fail", status_message: err._message });
    }
};

exports.resetChat = async (req, res) => {
    const { chatId, userId } = req.body;
    try {
        const chat = await Chat.findById(chatId);
        if (chat.messages) {
            await Message.deleteMany({ _id: chat.messages });
            chat.messages = [];
        }

        //TODO: Optimize to make both in one call
        const message = await addMessageToChat("system", CHAT_CONTEXT, userId, chat);
        if (message.status != "success") throw new Error(message.status_message);
        const message2 = await addMessageToChat("assistant", INITIAL_MESSAGE, userId, chat);
        if (message2.status != "success") throw new Error(message2.status_message);

        return res.status(201).json({ status: "success", status_message: `${message.status} to reset chat` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "fail", status_message: err._message });
    }
};

exports.getChat = async (req, res) => {
    const { userId, create } = req.body;
    try {
        let chat = await Chat.getChatByUser(userId);
        if (chat.length == 0 && create === true) chat = (await createChat(userId)).chat;
        return res.status(201).json({ status: "success", status_message: ``, chat: chat });
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
