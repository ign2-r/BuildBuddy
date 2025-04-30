const mongoose = require("mongoose");
const Chat = require("./model/Chat");
const Message = require("./model/Message");
const Product = require("./model/Product");

const addMessageToChat = async (
    role,
    content,
    userId,
    currChat = null,
    chatId = null,
    setChat = true
) => {
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
            console.error(
                `currChat is not a Mongoose document: ${JSON.stringify(
                    currChat
                )}`
            );
            return { status: "fail", status_message: "Internal error" };
        }

        if (setChat) await currChat.save();

        return { status: "success", status_message: `` };
    } catch (e) {
        console.error(e);
        return { status: "fail", status_message: `Something went wrong` };
    }
};

const getRecommendation = async (criteria) => {
    try {
        const categories = Object.keys(criteria);

        const res = await Promise.all(
            categories.map(async (cat) => {
                if (Product.VALID_CAT.includes(cat)) {
                    const data = await Product.getCategory(cat, 3)
                        .msrpPriceRange(
                            criteria[cat].minBudget,
                            criteria[cat].maxBudget
                        )
                        .select({
                            _id: 1,
                            category: 1,
                            brand: 1,
                            msrpPrice: 1,
                            releaseDate: 1,
                            description: 1,
                        })
                        .searchByKeywords(criteria[cat].preferences); //TODO: Figure out why keywords do not work - should figure out a better search technique / fuzzy search
                    console.log(cat, data.length);
                    return data;
                }
                return null; // Return null for categories not in VALID_CAT

                // Should check RAM and CPU first -> determine the motherboard -> determine PSU -> using size determine case, etc
            })
        );
        return res.filter((item) => item !== null); // Filter out null values
    } catch (e) {
        console.error(e);
        return {
            status: "fail",
            status_message: `Something went wrong`,
            data: null,
        };
    }
};

module.exports = { addMessageToChat, getRecommendation };
