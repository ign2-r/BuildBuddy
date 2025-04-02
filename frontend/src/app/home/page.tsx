"use client";

import { Box } from "@mui/material";
import { useEffect } from "react";
import Chatbot from "../../components/Chatbot";
import RecommendationPanel from "../../components/RecommendationPanel";
import Navbar from "../../components/Navbar";
import { useSession } from "next-auth/react";
import { Chat, Message } from "@/utils/db";
import { useChatContext } from "@/context/ChatContext";

export default function HomePage() {
    const {setChat, setMessages, setRecommendations} = useChatContext();
    const { data: session } = useSession();
    const userId = session?.user?._id;

    useEffect(() => {
        console.debug(userId);
        if (!userId) {
            setChat({ _id: "", messages: [], recommendation: [], display: "", creator: "" });
            setMessages([]);
            return;
        }

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
                        .filter((msg: Message) => msg.role === "assistant" || msg.role === "user")
                        .map((msg: Message) => ({
                            role: msg.role || "assistant",
                            content: msg.content || "",
                            createdAt: msg.createdAt,
                        }))
                );
                if (getChat.recommendation.length > 0 && setRecommendations) {
                    setRecommendations((getChat.recommendation ?? []).at(-1) ? [(getChat.recommendation ?? []).at(-1)!] : []);
                }
            } catch (error) {
                console.error("Error fetching chat:", error);
            }
        };
        fetchChat();
    }, [userId]);

    return (
        <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
                <Navbar />

                <Box display="flex" flexGrow={1} minHeight={0} sx={{ p: 3, bgcolor: "#121212" }}>
                    <Box
                        sx={{
                            width: "50%",
                            height: "100%",
                            bgcolor: "white",
                            color: "black",
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: 3,
                            boxShadow: 3,
                            mr: 2,
                            minHeight: 0,
                        }}
                    >
                        <Chatbot />
                    </Box>

                    <Box
                        sx={{
                            width: "50%",
                            height: "100%",
                            bgcolor: "#1E1E1E",
                            color: "white",
                            borderRadius: 3,
                            boxShadow: 3,
                            p: 4,
                            overflowY: "auto",
                            minHeight: 0,
                        }}
                    >
                        <RecommendationPanel/>
                    </Box>
                </Box>
        </Box>
    );
}
