const mongoose = require("mongoose");
const Chat = require("./model/Chat");
const Message = require("./model/Message");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

const addMessageToChat = async(chatId, message, isBot, userId) => {
  try {
    const currChat = await Chat.findById(chatId);

    if (!currChat){
      return {status: "fail", message: "Chat ID not found"};
    };

    const newMessage = await Message.create({
      chatId: chatId,
      isBot: isBot && false,
      message: message,
      creator: userId
    }); 

    const currMessage = await newMessage.save();

    if (!Array.isArray(currChat.messages)) {
      currChat.messages = [];
    }
    currChat.messages.push(currMessage._id);
    currChat.updatedAt = Date.now();

    if (typeof currChat.save !== 'function') {
      console.error(`currChat is not a Mongoose document: ${JSON.stringify(currChat)}`);
      return { status: "fail", message: "Internal error" };
    }

    await currChat.save();

    return {status: "success", message: ``}
  } catch (e){
    console.error(e);
    return {status: "fail", message: `Something went wrong`}
  };
};



module.exports = {connectDB, addMessageToChat}; 
