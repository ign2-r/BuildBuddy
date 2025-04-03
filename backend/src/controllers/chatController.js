const {INITIAL_MESSAGE, CHAT_CONTEXT} = require("../prompts/chatContext");
const Chat = require("../database/model/Chat");
const mongoose = require("mongoose");
const Message = require("../database/model/Message");
const { createFromHexString } = mongoose.Types.ObjectId;
const { addMessageToChat } = require("../database/mongoHandler");

// ============================================ 
// Internal Functions
// ============================================ 
async function createChat(userId) {
    const chat = new Chat({
        display: "Chat 123",
        creator: createFromHexString(userId),
        messages: [],
    });
    const message = await addMessageToChat("system", CHAT_CONTEXT, userId, chat, false);
    const message2 = await addMessageToChat("assistant", INITIAL_MESSAGE, userId, chat, false);
    await chat.save();
    if (message2.status != "success") throw new Error(message2.status_message);
    const resChat = await chat.populate({
        path: "messages",
        match: { role: { $ne: "system" } },
        options: { sort: { createdAt: 1 } }
    });
    // console.debug(resChat);
    return { resChat, message, message2 };
}

// ============================================ 
// API Functions
// ============================================ 
exports.getChat = async (req, res) => {
    const { userId, create } = req.body;
    try {
        let chat = await Chat.getChatByUser(userId);
        // console.debug(create == true && chat.length == 0)
        if (create == true && chat.length == 0) chat = (await createChat(userId)).resChat;
        return res.status(201).json({ status: "success", status_message: ``, chat: chat });
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
        chat.recommendation = [];
        await chat.save();

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