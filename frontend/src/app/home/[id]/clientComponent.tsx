"use client";

import { Box } from "@mui/material";
import { useEffect } from "react";
import Chatbot from "../../../components/Chatbot";
import RecommendationPanel from "../../../components/RecommendationPanel";
import { Chat, Message } from "@/utils/db";
import { useChatContext } from "@/context/ChatContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function HomePage({chatId}: {chatId:string |null }) {
    const { update } = useSession();
    const { setChat, setMessages, setRecommendations, user, setDefault } = useChatContext();
    const router = useRouter();   
    // const {currChatId, setChatId} = useState(chatId)
    const currChatId = chatId;

    useEffect(() => {
        update();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const validChatIDRegex:RegExp = /^[a-z0-9]{21,25}$/;

        if(!currChatId || currChatId == "" || !validChatIDRegex.test(currChatId)){
            router.push("/chats");
        }
    }, [currChatId, router]);

    useEffect(() => {
        if (!user?._id) {
            setDefault(false);
            return;
        }

        const fetchChat = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-chat-id?chatId=${currChatId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) {
                    console.error("Failed to fetch chat:", await res.text());
                    return;
                }

                const data = await res.json();
                const getChat: Chat = data.chat;

                if (!getChat) {
                    setDefault(false);
                    return;
                }
                console.debug(getChat);
                setChat(getChat);
                setMessages(
                    (getChat?.messages ?? [])
                        .filter((msg: Message) => msg.role === "assistant" || msg.role === "user")
                        .map((msg: Message) => ({
                            role: msg.role || "assistant",
                            content: msg.content || "",
                            createdAt: msg.createdAt,
                        }))
                );

                if (getChat?.recommendation && getChat.recommendation.length > 0) {
                    setRecommendations(getChat.recommendation);
                }
            } catch (error) {
                console.error("Error during fetch: ", error);
            }
        };

        fetchChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, currChatId, chatId]);

    return (
        <Box height="100%" display="flex" flexDirection="column" overflow="hidden">
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
                    <RecommendationPanel />
                </Box>
            </Box>
        </Box>
    );
}
