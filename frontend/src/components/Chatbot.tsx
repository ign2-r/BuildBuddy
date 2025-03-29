"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Paper, TextField, Button } from "@mui/material";
import { useSession } from "next-auth/react";
import { Chat } from "@/utils/db";

const Chatbot = () => {
    const [chat, setChat] = useState<Chat>();
    const [messages, setMessages] = useState([{ role: "assistant", content: "Hello! How can I assist you today?" }]);
    const [userInput, setUserInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();
    const userId = session?.user?._id;

    // TODO: Update to let the user swap chats
    // TODO: Migrate this to a server side action for security
    useEffect(() => {
        const fetchChat = async () => {
            if (!userId) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: userId, create: true }),
                });

                if (!response.ok) {
                    console.error("Failed to fetch chat:", await response.text());
                    return;
                }

                const getChat: Chat = (await response.json()).chat[0];
                setChat(getChat);
                setMessages(
                    (getChat.messages || [])
                        .filter((msg) => msg.role == "assistant" || msg.role == "user")
                        .map((msg) => ({
                            role: msg.role || "assistant",
                            content: msg.content || "",
                            createdAt: msg.createdAt,
                        }))
                );
            } catch (error) {
                console.error("Error fetching chat:", error);
            }
        };
        fetchChat();
    }, [userId]);

    const handleSend = async () => {
        if (userInput.trim() === "") return;

        const userMessage = { role: "user", content: userInput };
        setMessages((prev) => [...prev, userMessage]);
        setUserInput("");
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
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
                height: "100%",
            }}
        >
            <Typography variant="h6" color="primary" fontWeight={600} sx={{ mb: 1 }}>
                💬 Chatassistant
            </Typography>

            {/* Chat Messages */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    mt: 1,
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "grey.100",
                    borderRadius: 2,
                    boxShadow: 1,
                }}
                ref={(el: HTMLDivElement | null) => {
                    if (el) {
                        el.scrollTop = el.scrollHeight;
                    }
                }}
            >
                {messages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            width: "100%",
                            mb: 1,
                        }}
                    >
                        <Paper
                            sx={{
                                p: 1.5,
                                borderRadius: 3,
                                bgcolor: msg.role === "assistant" ? "grey.300" : "primary.main",
                                color: msg.role === "assistant" ? "black" : "white",
                                maxWidth: "90%",
                                textAlign: msg.role === "assistant" ? "left" : "right",
                                boxShadow: 1,
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            <Typography variant="body2">{msg.content}</Typography>
                        </Paper>
                    </Box>
                ))}
            </Box>

            {/* Chat Input Box */}
            <Box sx={{ display: "flex", mt: 1, gap: 1 }}>
                <TextField
                    id="chat-input"
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: 3 }}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    autoComplete="off"
                    inputRef={(input) => {
                        if (input && !isLoading) {
                            input.focus();
                        }
                    }}
                />
                <Button onClick={handleSend} variant="contained" sx={{ borderRadius: 3 }} disabled={isLoading}>
                    {isLoading ? "..." : "Send"}
                </Button>
            </Box>
        </Box>
    );
};

export default Chatbot;
