const express = require("express");
const dotenv = require("dotenv");
const Chat = require("../database/model/Chat");
const User = require("../database/model/User");
const Product = require("../database/model/Product");
const { addMessageToChat, getAdvancedRecommendation } = require("../database/mongoHandler");
const fs = require("fs");
const { testRec } = require("../controllers/chatbotController");
const { resetChat } = require("../controllers/chatController");
const Message = require("../database/model/Message");
const { authenticateViaSecret } = require("../services/verifyAuth");

dotenv.config();
const router = express.Router();

router.get("/database", authenticateViaSecret, async (req, res) => {
    const data = {
        users: await User.find(),
        info: await Chat.find().withMessages(),
        products: await Product.find().populate(),
    };
    res.status(200).json({ data, status: "success", status_message: "" });
});

router.get("/allChat", authenticateViaSecret, async (req, res) => {
    try {
        const data = await Chat.getAll().exec();
        res.status(200).json({
            chats: data,
            status: "success",
            status_message: "",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.get("/userChats", authenticateViaSecret, async (req, res) => {
    const { uid } = req.query;

    try {
        const data = await Chat.getChatByUser(uid).exec();
        res.status(200).json({
            chats: data,
            status: "success",
            status_message: "",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.post("/database", authenticateViaSecret, async (req, res) => {
    const newUser = new User({
        email: "testuser@example.com",
        password: "password123",
        role: "free",
        username: "testuser",
    });

    const savedUser = await newUser.save();

    const newChat = new Chat({
        display: "Test Chat",
        creator: savedUser._id,
    });

    const savedChat = await newChat.save();

    await addMessageToChat(savedChat._id, "Hello there", true, savedUser._id);
    await addMessageToChat(savedChat._id, "Hello there user", false, null);

    res.status(201).json({
        status: "error",
        message: "Test data created successfully",
    });
});

router.post("/addmsg", authenticateViaSecret, async (req, res) => {
    console.log("Addmsg start");
    const { chatId, message, isSystem, userId } = req.body;
    try {
        addMessageToChat(chatId, message, isSystem, userId).then((result) => {
            if (result.status == "success")
                res.status(201).json({
                    chats: data,
                    status: "success",
                    status_message: "Message created",
                });
            else {
                res.status(400).json(result);
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error: Test message",
        });
    }
});

router.get("/chat", authenticateViaSecret, async (req, res) => {
    const { chatId } = req.query;

    try {
        const data = await Chat.findById(chatId).withMessages().withCreatorInfo();
        res.status(200).json({
            chats: data,
            status: "success",
            status_message: "",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: "error", message: "Internal Error" });
    }
});

router.get("/recommendations", authenticateViaSecret, async (req, res) => {
    const { userId } = req.query;

    try {
        const data = await Chat.getUserRecommendation(userId).exec();
        res.status(200).json({
            chats: data,
            status: "success",
            status_message: "",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.post("/addRandomProducts", authenticateViaSecret, async (req, res) => {
    try {
        const dataFile = require("./final-temp.json");

        const bulkOperations = dataFile.map((obj) => ({
            updateOne: {
                filter: { name: obj.name, category: obj.category },
                update: { $set: { ...obj } }, // Ensure obj is spread into an object
                upsert: true,
            },
        }));

        const response = await Product.bulkWrite(bulkOperations);
        res.status(200).json({ status: "success", status_message: response });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.post("/addRec", authenticateViaSecret, async (req, res) => {
    const { chatId, cpuId, gpuId, ramId, psuId, motherboardId, storageId, accessoriesIds } = req.query;
    try {
        // chatId, cpuId, gpuId, ramId, psuId, motherboardId, storageId, ...accessoriesIds
        const result = await Chat.addRecommendation("67b9421bdc98ff8f9541512e", "67bfd00a2ebfddd86b1ca550", "67bfd00a2ebfddd86b1ca54f", "67bfd00a2ebfddd86b1ca553"); //hardcoded
        res.status(200).json({
            status: "success",
            status_message: `${result}`,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.post("/purgeAllButProducts", authenticateViaSecret, async (req, res) => {
    try {
        await Chat.deleteMany({});
        await User.deleteMany({});
        await Message.deleteMany({});
        res.status(200).json({ status: "success", status_message: `success` });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.post("/dbrec", authenticateViaSecret, async (req, res) => {
    const { category, minBudget, maxBudget, keywords } = req.body;

    console.debug({
        category,
        minBudget,
        maxBudget,
        keywords,
    });
    if (!category || isNaN(minBudget) || isNaN(maxBudget) || !Array.isArray(keywords)) {
        res.status(500).json({ message: "Invalid inputs" });
        return;
    }

    try {
        const results = await Product.recSearch(category, minBudget, maxBudget, keywords);
        res.status(200).json({ status: "success", status_message: `success`, results: results });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.post("/rectest", authenticateViaSecret, async (req, res) => {
    const { criteria } = req.body;
    console.log(criteria);

    if (!criteria) {
        res.status(500).json({ message: "Invalid input" });
        return;
    }

    try {
        const allResults = await getAdvancedRecommendation(criteria);
        res.status(200).json({ status: "success", status_message: `success`, results: allResults });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

router.post("/resetChat", resetChat);
router.post("/testRec", testRec);

module.exports = router;
