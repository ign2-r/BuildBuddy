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
        display: `Chat ${new Date().toISOString()}`,
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
    console.log("createChat received userId:", userId);
  
    try {
      const { resChat, message, message2 } = await createChat(userId);
  
      return res.status(201).json({
        status: "success",
        status_message: `${message.status} to create chat`,
        chat: resChat,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "fail", status_message: err.message });
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

exports.getMessages = async (req, res) => {
    const { chatId } = req.query;
    // TODO: add authorization header to check if the user is the right person
    try {
      const chat = await Chat.findById(chatId).populate("messages");
      if (!chat) return res.status(404).json({ error: "Chat not found" });


  
      const filtered = chat.messages.filter((m) => {
        return (
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          !m.content.trim().startsWith("{") &&
          m.content.length < 1000
        );
      });
  
      return res.status(200).json({ messages: filtered });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
  };

  exports.deleteChat = async (req, res) => {
    const { chatId } = req.body;
  
    try {
      const chat = await Chat.findById(chatId);
  
      if (!chat) {
        return res.status(404).json({ status: "fail", message: "Chat not found" });
      }
  
      if (Array.isArray(chat.messages) && chat.messages.length > 0) {
        await Message.deleteMany({ _id: { $in: chat.messages } });
      }
  
      await Chat.findByIdAndDelete(chatId);
  
      return res.status(200).json({ status: "success" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "fail", message: err.message });
    }
  };
  
