const express = require("express");
const dotenv = require("dotenv");
const { processRecommendation, processGuide } = require("../controllers/chatbotController");
const { createChat, getChat, getChatById, renameChat, getUserChatPreview } = require("../controllers/chatController");
const { getMessages } = require("../controllers/chatController");
const { deleteChat } = require('../controllers/chatController');
const {authenticateBearer} = require("../services/verifyAuth");

dotenv.config();
const router = express.Router();

router.post("/create-chat", authenticateBearer, createChat);
router.post("/get-chat", authenticateBearer, getChat);
router.post('/delete-chat', authenticateBearer, deleteChat);
router.post('/rename-chat', authenticateBearer, renameChat);

router.post("/recommend", authenticateBearer, processRecommendation);
router.post("/guide", authenticateBearer, processGuide)

router.get("/get-messages", authenticateBearer, getMessages);
router.get("/get-chat-id", authenticateBearer, getChatById);
router.get("/chat-preview", authenticateBearer, getUserChatPreview);


module.exports = router;

// Have the llm look at the response and look for patterns in the response to determine what are the user looking for, if info is missing ask for it - once all info is there make a rec
