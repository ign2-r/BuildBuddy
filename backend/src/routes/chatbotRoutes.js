const express = require("express");
const dotenv = require("dotenv");
const { processRecommendation } = require("../controllers/chatbotController");
const { createChat, getChat, getChatById } = require("../controllers/chatController");
const { getMessages } = require("../controllers/chatController");
const { deleteChat } = require('../controllers/chatController');
const {authenticateBearer} = require("../services/verifyAuth");

dotenv.config();
const router = express.Router();

router.post("/create-chat", authenticateBearer, createChat);
router.post("/get-chat", authenticateBearer, getChat);
router.post('/delete-chat', authenticateBearer, deleteChat);

router.post("/recommend", authenticateBearer, processRecommendation);

router.get("/get-messages", authenticateBearer, getMessages);
router.get("/get-chat-id", authenticateBearer, getChatById);

module.exports = router;

// Have the llm look at the response and look for patterns in the response to determine what are the user looking for, if info is missing ask for it - once all info is there make a rec
