const chatbotService = require("../services/chatbotService");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const Chat = require("../database/model/Chat");

const {
    addMessageToChat,
    getRecommendation,
} = require("../database/mongoHandler");
const { CHAT_CONTEXT_REC } = require("../prompts/chatContext");
const { VALID_CAT } = require("../database/model/Product");

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

//TODO: set up functions for chatbot

// ============================================
// Chat Agent Support Functions
// ============================================
const fullCriteria = {};
VALID_CAT.forEach((cat) => {
    fullCriteria[cat] = {
        type: "object",
        properties: {
            minBudget: { type: "number", description: `${cat} minimum budget` },
            maxBudget: { type: "number", description: `${cat} maximum budget` },
            preferences: {
                type: "array",
                items: { type: "string" },
                description: `List of preferences for ${cat}`,
            },
        },
    };
});

const functions = [
    {
        type: "function",
        function: {
            name: "makeRecommendation",
            description: "Recommendation function to start the recommendation",
            parameters: {
                type: "object",
                properties: {
                    criteria: { type: "object", properties: fullCriteria },
                },
                required: ["criteria"],
            },
        },
    },
];

function obtainAIAgent() {
    if (!GROQ_API_KEY) {
        throw new Error("Missing AI API Key");
    }
    return new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: process.env.AI_BASE_URL,
    });
}

async function obtainChatResponse(messages) {
    const client = obtainAIAgent();
    const AI_model = process.env.AI_MODEL;

    if (!AI_model) {
        throw new Error("Missing AI Model");
    }

    try {
        const response = await client.chat.completions.create({
            model: AI_model,
            messages: messages,
            max_completion_tokens: 4096,
            top_p: 0.95,
            tools: functions,
            tool_choice: "auto",
        });
        if (!response || !response.choices || response.choices.length === 0) {
            console.error("🚨 OpenAI SDK Error: No response or choices found");
            return res.status(500).json({
                reply: "OpenAI SDK Error: No response or choices found",
            });
        }
        const botMessage = response.choices[0].message;

        return botMessage;
    } catch (error) {
        console.error("🚨 OpenAI SDK Rec Error:", error);
    }
}

// ============================================
// Chatbot Logic Functions
// ============================================

async function parseUserMessage(chatId, userId, message) {
    console.log(
        `🛠 Sending request to AI API using SDK for ${userId} in ${chatId}`
    );

    // Manage the chat message and get the chat
    try {
        // Obtain chat
        let chat = await Chat.findById(chatId).withMessages();
        // parse the previous messages
        const messages = chat.messages.map((message) => ({
            role: message.role,
            content: message.content,
        }));

        // Add the current message to chat and current message store
        const temp = await addMessageToChat(
            "user",
            message,
            userId,
            chat,
            null,
            false
        );
        if (temp.status !== "success")
            throw new Error("Failed to process message");
        messages.push({ role: "user", content: message });

        // Respond
        try {
            let content = "Processing";
            let recommendationItems = { content: null, recommendation: null };
            const botMessage = await obtainChatResponse(messages);
            // const botMessage = {
            //     response: { content: "test", summary: "yolo" },
            // };
            if (!botMessage) {
                throw Error("Bot message not being sent");
            }

            // Handle if using a tool call
            if ("tool_calls" in botMessage) {
                const { name, arguments: argsJson } =
                    botMessage.tool_calls[0].function;
                console.debug(argsJson);
                const args = JSON.parse(argsJson);
                console.debug(args);
                const processedCriteria = args.criteria;
                const parts = await gatherParts(processedCriteria);

                console.debug(JSON.stringify(parts));

                let result;
                if (name == "makeRecommendation") {
                    // check the rec value
                }

                messages.push({
                    role: "function",
                    name,
                    content: JSON.stringify(result),
                });

                return {
                    status: "success",
                    response: {
                        role: "assistant",
                        content: JSON.stringify(parts),
                    },
                };
            }
            // Handle if it is content response
            else if (botMessage.content) {
                const botContent = JSON.parse(botMessage.content);
                content = `${botContent.response.content}${
                    botContent.response.content && botContent.summary
                        ? "\n\n"
                        : ""
                }${
                    botContent.summary
                        ? `Current summary: ${botContent.summary}`
                        : ""
                }`;

                await addMessageToChat(
                    "assistant",
                    content,
                    userId,
                    chat,
                    null,
                    false
                );
                await chat.save();

                // if (botMessage.status === "recommending") {
                //     recommendationItems = await makeRecommendation(
                //         chat,
                //         messages,
                //         botMessage
                //     );
                //     content = recommendationItems.content;
                // } else {

                // }

                const responsePayload = {
                    status: "success",
                    response: {
                        role: botContent.response.role,
                        content: content,
                    },
                };

                if (recommendationItems.recommendation) {
                    responsePayload.response.recommendation =
                        recommendationItems.recommendation;
                }

                return responsePayload;
            }
        } catch (error) {
            console.error("🚨 Error parsing message:", error);
            return {
                status: "fail",
                status_message: error.message,
                response: "Something went wrong, try again",
            };
        }
    } catch (error) {
        console.error("🚨 Error adding message:", error);
        return {
            status: "fail",
            status_message: error.message,
            response: "Something went wrong, try again",
        };
    }
}

async function gatherParts(criteria) {
    const recProducts = await getRecommendation(criteria);
    return recProducts;
}

// async function addRecommendation(chatId, rec) {
//     const recommendation = {
//         display: `${new Date().toLocaleDateString().replace(/\//g, "_")}-rec`,
//         ...Object.keys(rec).reduce((acc, key) => {
//             if (rec[key]._id) {
//                 acc[key] = rec[key]._id;
//             }
//             return acc;
//         }, {}),
//     };
//     const re2 = chat.recommendation.push(recommendation);
//     await chat.save();
// }

async function makeRecommendation(chat, messages, criteria) {
    const recProducts = await getRecommendation(criteria);
    messages[0] = {
        role: "system",
        content: `${CHAT_CONTEXT_REC}\n\nPRODUCTS LIST ${JSON.stringify(
            recProducts
        )}`,
    };
    try {
        const botMessage = await obtainChatResponse(messages);
        const content = `${botMessage.response.content}${
            botMessage.response.content && botMessage.summary ? "\n\n" : ""
        }${botMessage.summary ? `Current summary: ${botMessage.summary}` : ""}`;
        //TODO: optimize to do one push to the server and also not create so many references
        await addMessageToChat(
            "assistant",
            content,
            chat.creator,
            chat,
            null,
            false
        );
        await addMessageToChat(
            "system",
            JSON.stringify(botMessage),
            chat.creator,
            chat,
            null,
            false
        );

        // console.log("recommendation results", botMessage);
        // TODO optimize the calls to the server for the product
        const recommendation = {
            display: `${new Date()
                .toLocaleDateString()
                .replace(/\//g, "_")}-rec`,
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

        return {
            content: content,
            recommendation: (
                await Chat.findById(chat._id).withRecommendations()
            ).recommendation.at(-1),
        };
    } catch (error) {
        console.error("🚨 Rec Error:", error);
        return {
            status: "fail",
            status_message: error.message,
            response: "Something went wrong, try again",
        };
    }
}

// ============================================
// Chat Agent API
// ============================================
exports.processRecommendation = async (req, res) => {
    const { chatId, message, userId } = req.body;
    try {
        const response = await parseUserMessage(chatId, userId, message);
        if (response.status != "success")
            return res.status(500).json({
                status: response.status,
                status_message: response.status_message,
                message: response.response,
            });
        return res.status(200).json({
            status: "success",
            status_message: ``,
            message: response.response,
        });
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ status: "fail", status_message: err._message });
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
                chat.messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                { criteria: criteria }
            ),
        });
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ status: "fail", status_message: err._message });
    }
};
