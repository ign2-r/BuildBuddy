"use client";

import { useEffect, useState, useRef } from "react";
import { Box, Typography, Paper, TextField, Button } from "@mui/material";
import { useChatContext } from "@/context/ChatContext";
import { generateAccessToken } from "@/app/actions/jwt";
import { motion } from "framer-motion";

const Chatbot: React.FC = () => {
    const { isLoadingMain, messages, chat, setMessages, setRecommendations, setIsLoading, user } = useChatContext();
    const [userInput, setUserInput] = useState("");
    const userId = user?._id;

    const scrollRef = useRef<HTMLDivElement>(null);

    console.log(chat, userId);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle sending
    const handleSend = async () => {
        if (userInput.trim() === "") return;

        const MAX_MESSAGES = 100;
        const totalMessages = messages.filter((m) => m.role === "user" || m.role === "assistant").length;

        if (totalMessages >= MAX_MESSAGES) {
            setMessages((prev) => [...prev, { role: "assistant", content: "❌ You've reached the message limit for this conversation." }]);
            setUserInput("");
            return;
        }

        const userMessage = { role: "user", content: userInput };
        setMessages((prev) => [...prev, userMessage]);
        setUserInput("");
        setIsLoading(true);

        try {
            setMessages((prev) => [...prev, {role: "assistant", content: "🤔💭 Let me think about that..."}]);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommend`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Authorization': `bearer ${await generateAccessToken(user)}` },
                body: JSON.stringify({ chatId: chat?._id, userId: userId, message: userInput }),
              });
              
              if (!response.ok) {
                const errorDetails = await response.text();
                console.error("Backend API Error:", errorDetails);
                setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errorDetails}` }]);
                setIsLoading(false);
                return;
              }
              
              const data = (await response.json()).message;
              console.log("🧠 Full bot response:", data);
              
            setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: data.content }]);

            if (data.recommendation && setRecommendations) {
                console.log("📦 Setting recommendations:", data.recommendation);
                setRecommendations((prev) => [...prev, data.recommendation]);
            } else if (setRecommendations) {
                setRecommendations([]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to the server." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                minHeight: 0,
                height: "100%",
            }}
        >
            <Typography variant="h6" color="primary" fontWeight={600} sx={{ mb: 1 }}>
                💬 Chatassistant
            </Typography>

            <Box
                ref={scrollRef}
                sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "grey.100",
                    borderRadius: 2,
                    boxShadow: 1,
                    minHeight: 0,
                }}
            >
                {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30, scale: msg.role === "user" ? 0.95 : 1 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.4 }}
                        style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", width: "100%", marginBottom: 8 }}
                    >
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 3,
                                bgcolor: msg.role === "assistant" ? "grey.300" : "primary.main",
                                color: msg.role === "assistant" ? "black" : "white",
                                maxWidth: "90%",
                                textAlign: msg.role === "assistant" ? "left" : "right",
                                boxShadow: 1,
                                wordBreak: "break-word",
                                whiteSpace: "pre-wrap"
                            }}
                        >
                            <Typography variant="body2">{msg.content}</Typography>
                        </Box>
                    </motion.div>
                ))}
            </Box>

            <Box sx={{ display: "flex", mt: 1, gap: 1, flexShrink: 0 }}>
                <TextField
                    id="chat-input"
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: 3 }}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    disabled={isLoadingMain}
                    autoComplete="off"
                    inputRef={(input) => {
                        if (input && !isLoadingMain) {
                            input.focus();
                        }
                    }}
                    slotProps={{
                        input: {
                            inputProps: {
                                maxLength: 250,
                            },
                        },
                    }}
                />
                <Typography variant="caption" sx={{ color: "gray", mt: 1 }}>
                    {userInput.length}/250
                </Typography>
                <Button onClick={handleSend} variant="contained" sx={{ borderRadius: 3 }} disabled={isLoadingMain}>
                    {isLoadingMain ? "..." : "Send"}
                </Button>
            </Box>
        </Box>
    );
};

export default Chatbot;
