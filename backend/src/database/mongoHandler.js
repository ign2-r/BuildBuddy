const mongoose = require("mongoose");
const Chat = require("./model/Chat");
const Message = require("./model/Message");
const Product = require("./model/Product");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("MongoDB Connected...");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

const addMessageToChat = async (role, content, userId, currChat = null, chatId = null, setChat = true) => {
    try {
        if (!currChat && chatId) {
            currChat = await Chat.findById(chatId);
        }

        if (!currChat) {
            return { status: "fail", status_message: "Chat not found" };
        }

        const newMessage = await Message.create({
            role: role,
            content: content,
            userAuthor: userId,
        });

        const currMessage = await newMessage.save();

        if (!Array.isArray(currChat.messages)) {
            currChat.messages = [];
        }
        currChat.messages.push(currMessage._id);

        if (typeof currChat.save !== "function") {
            console.error(`currChat is not a Mongoose document: ${JSON.stringify(currChat)}`);
            return { status: "fail", status_message: "Internal error" };
        }

        if (setChat) await currChat.save();

        return { status: "success", status_message: `` };
    } catch (e) {
        console.error(e);
        return { status: "fail", status_message: `Something went wrong` };
    }
};

const getRecommendation = async (category, minBudget, maxBudget) => {
    try {
        const data = Product.getCategory(category, 15).msrpPriceRange(minBudget, maxBudget);
        return { status: "success", status_message: `Obtained ${data.length}`, data: data };
    } catch (e) {
        console.error(e);
        return { status: "fail", status_message: `Something went wrong`, data: null };
    }
};

module.exports = { connectDB, addMessageToChat, getRecommendation };
