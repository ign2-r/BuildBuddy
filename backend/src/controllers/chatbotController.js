const chatbotService = require('../services/chatbotService');

exports.processMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await chatbotService.getChatResponse(message);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};
