const express = require('express');
const dotenv = require('dotenv');
const Chat = require("../database/model/Chat");
const User = require("../database/model/User");
const Product = require("../database/model/Product");
const {addMessageToChat} = require("../database/mongoHandler");

dotenv.config();
const router = express.Router();

router.get('/database', async (req, res) => {
    const data = {
        users: await User.find(),
        info: await Chat.find().withMessages()
    }
    res.status(200).json(data);
});

router.post('/database', async (req, res) => {
    const newUser = new User({
        email: "testuser@example.com",
        password: "password123",
        role: "free",
        username: "testuser"
    });

    const savedUser = await newUser.save();

    const newChat = new Chat({
        display: "Test Chat",
        creator: savedUser._id
    });

    const savedChat = await newChat.save();

    await addMessageToChat(savedChat._id, "Hello there", true, savedUser._id);
    await addMessageToChat(savedChat._id, "Hello there user", false, null);

    res.status(201).json({ message: "Test data created successfully" });

});

router.post('/addmsg', async (req, res) => {
    console.log("Addmsg start");
    const { chatId, message, isSystem, userId } = req.body;
    try{
        addMessageToChat(chatId, message, isSystem, userId).then((result) => {
            if (result.status == "success")
                res.status(201).json({ message: "Test message created successfully" });
            else{
                res.status(400).json(result);
            } 
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error: Test message" });
    }
});

router.get('/chat', async (req, res) => {
    const { chatId } = req.query;

    try{
        const data = await Chat.findById(chatId);
        res.status(200).json(data);
    }catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Error" });
    }
});

module.exports = router;
