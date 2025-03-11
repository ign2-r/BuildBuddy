'use client';

import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! How can I assist you today?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (userInput.trim() === '') return;

        const userMessage = { sender: 'user', text: userInput };
        setMessages((prev) => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput })
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                console.error('Backend API Error:', errorDetails);
                setMessages((prev) => [...prev, { sender: 'bot', text: `Error: ${errorDetails}` }]);
                setIsLoading(false);
                return;
            }

            const data = await response.json();
            setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [...prev, { sender: 'bot', text: 'Error connecting to the server.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <Typography variant="h6" color="primary" fontWeight={600} sx={{ mb: 1 }}>
                💬 Chatbot
            </Typography>

            {/* Chat Messages */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    mt: 1,
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    boxShadow: 1
                }}
            >
                {messages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            width: '100%',
                            mb: 1
                        }}
                    >
                        <Paper
                            sx={{
                                p: 1.5,
                                borderRadius: 3,
                                bgcolor: msg.sender === 'bot' ? 'grey.300' : 'primary.main',
                                color: msg.sender === 'bot' ? 'black' : 'white',
                                maxWidth: '90%',
                                textAlign: msg.sender === 'bot' ? 'left' : 'right',
                                boxShadow: 1,
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            <Typography variant="body2">{msg.text}</Typography>
                        </Paper>
                    </Box>
                ))}
            </Box>

            {/* Chat Input Box */}
            <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                <TextField
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: 3 }}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    disabled={isLoading}
                />
                <Button onClick={handleSend} variant="contained" sx={{ borderRadius: 3 }} disabled={isLoading}>
                    {isLoading ? '...' : 'Send'}
                </Button>
            </Box>
        </Box>
    );
};

export default Chatbot;
