'use client';

import { useState } from 'react';
import { Box, Typography, Button, Paper, TextField, Stack } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
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
        setMessages((prev) => [...prev, { sender: 'bot', text: `Backend API Error: ${errorDetails}` }]);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" height="100vh" sx={{ p: 3, bgcolor: '#121212' }}>
      {/* Chatbot Panel */}
      <Paper
        elevation={3}
        sx={{
          width: '25%',
          bgcolor: 'white',
          color: 'black',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: 3,
          mr: 2
        }}
      >
        <Typography variant="h6" color="primary" fontWeight={600} sx={{ mb: 1 }}>
          💬 Chatbot
        </Typography>

        {/* Chat Messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', mt: 1, p: 1, display: 'flex', flexDirection: 'column' }}>
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
      </Paper>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#1E1E1E',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          borderRadius: 3,
          boxShadow: 3
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: '#252525',
            color: 'white',
            boxShadow: 3,
            maxWidth: '500px',
            textAlign: 'center',
            mb: 3
          }}
        >
          {/* Logo + Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Image src="/favicon.ico" alt="BuildBuddy Logo" width={50} height={50} />
            <Typography variant="h4" component="h1" fontWeight={600}>
              BuildBuddy AI
            </Typography>
          </Box>

          <Typography variant="h6" paragraph fontWeight={400}>
            Your AI-powered assistant for building the perfect PC.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/login"
              sx={{ borderRadius: 3, px: 3, py: 1 }}
            >
              Get Started
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'red',
                color: 'white',
                borderRadius: 3,
                px: 3,
                py: 1,
                '&:hover': { bgcolor: 'darkred' }
              }}
              component={Link}
              href="/home"
            >
              Explore
            </Button>
          </Stack>
        </Paper>

        {/* Features Section */}
        <Stack spacing={2} sx={{ maxWidth: '700px', width: '100%', p: 2 }}>
          {[
            { title: '🔍 Smart Recommendations', description: 'Get tailored PC part suggestions based on your needs.' },
            { title: '⚡ Performance Optimized', description: 'Compare benchmarks and find the best price-to-performance ratio.' },
            { title: '🛒 One-Click Buying', description: 'Add all recommended parts to your cart instantly.' }
          ].map((feature, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: '#252525',
                color: 'white',
                textAlign: 'center',
                boxShadow: 2,
                m: 1
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {feature.title}
              </Typography>
              <Typography variant="body2">{feature.description}</Typography>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
