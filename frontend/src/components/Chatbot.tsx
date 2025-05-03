"use client";

import { useEffect, useState, useRef } from "react";
import { Box, Typography, Paper, TextField, Button } from "@mui/material";
import { useChatContext } from "@/context/ChatContext";
import { generateAccessToken } from "@/app/actions/jwt";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

// NEEDS BACKEND IMPLEMENTATION FOR TRUE SECURITY
const MESSAGE_COOLDOWN_MS = 3000; // 3 seconds between messages
const DAILY_LIMIT = 50;
const SESSION_LIMIT = 100;

const Chatbot: React.FC = () => {
    const { isLoadingMain, messages, chat, setMessages, setRecommendations, setIsLoading, user } = useChatContext();
    const [userInput, setUserInput] = useState("");
    const [lastSent, setLastSent] = useState<number>(0);
    const [dailyCount, setDailyCount] = useState<number>(0);
    const [sessionCount, setSessionCount] = useState<number>(0);
    const userId = user?._id;

    const scrollRef = useRef<HTMLDivElement>(null);

    // Load daily count from localStorage
    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        const stored = localStorage.getItem(`chat_daily_count_${userId}_${today}`);
        setDailyCount(stored ? parseInt(stored, 10) : 0);
    }, [userId]);

    // Save daily count to localStorage
    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`chat_daily_count_${userId}_${today}`, dailyCount.toString());
    }, [dailyCount, userId]);

    // Track session count
    useEffect(() => {
        setSessionCount(messages.filter(m => m.role === "user").length);
    }, [messages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Helper: Check for repeated/spam messages
    const isSpam = (input: string) => {
        if (!input.trim()) return true;
        const lastMsg = messages.filter(m => m.role === "user").at(-1)?.content;
        return lastMsg && lastMsg.trim() === input.trim();
    };

    // Handle sending
    const handleSend = async () => {
        const now = Date.now();

        if (isLoadingMain) return;
        if (!userInput.trim()) {
            toast.error("Message cannot be empty.");
            return;
        }
        if (isSpam(userInput)) {
            toast.error("Please do not send repeated or spam messages.");
            return;
        }
        if (now - lastSent < MESSAGE_COOLDOWN_MS) {
            toast.error("You're sending messages too quickly. Please wait a moment.");
            return;
        }
        if (dailyCount >= DAILY_LIMIT) {
            toast.error("You have reached your daily message limit. Please try again tomorrow.");
            return;
        }
        if (sessionCount >= SESSION_LIMIT) {
            toast.error("You have reached the maximum messages for this session.");
            return;
        }

        setLastSent(now);
        setDailyCount(dailyCount + 1);

        const userMessage = { role: "user", content: userInput };
        setMessages((prev) => [...prev, userMessage]);
        setUserInput("");
        setIsLoading(true);

        try {
            setMessages((prev) => [...prev, { role: "assistant", content: "🤔💭 Let me think about that..." }]);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommend`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${await generateAccessToken(user)}`
                },
                body: JSON.stringify({ chatId: chat?._id, userId, message: userInput }),
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errorDetails}` }]);
                setIsLoading(false);
                return;
            }

            const data = (await response.json()).message;
            setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: data.content }]);
            if (data.recommendation && setRecommendations) {
                setRecommendations((prev) => [...prev, data.recommendation]);
            } else if (setRecommendations) {
                setRecommendations([]);
            }
        } catch (error) {
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
                💬 Conversation
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
                <Button
                    onClick={handleSend}
                    variant="contained"
                    sx={{
                        borderRadius: 3,
                        minWidth: 48,
                        minHeight: 48,
                        fontSize: 24,
                        px: 0,
                        py: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.2s",
                    }}
                    disabled={isLoadingMain || !userInput.trim()}
                    component={motion.button}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    aria-label="Send message"
                >
                    {isLoadingMain ? "..." : "📩"}
                </Button>
            </Box>
        </Box>
    );
};

export default Chatbot;
