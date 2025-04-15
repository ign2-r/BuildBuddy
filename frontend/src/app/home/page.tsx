    "use client";

    import { Box } from "@mui/material";
    import { useEffect } from "react";
    import Chatbot from "../../components/Chatbot";
    import RecommendationPanel from "../../components/RecommendationPanel";
    import Navbar from "../../components/Navbar";
    import { Chat, Message, User } from "@/utils/db";
    import { useChatContext } from "@/context/ChatContext";
    import { useSession } from "next-auth/react";

    export default function HomePage() {
        const { chat, setChat, setMessages, setRecommendations, user, setUser, setDefault } = useChatContext();
        const { data: session, update } = useSession();

    useEffect(() => {
        update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

        useEffect(() => {
            if (session?.user) {
                setUser(session.user as User);
            }
        }, [session, setUser]);

        useEffect(() => {
            // if a chat is already selected from /chats, don't override
            if (chat?._id) {
                setMessages(chat.messages ?? []);
                setRecommendations(chat.recommendation ?? []);
                return;
            }

            if (!user._id) {
                setDefault();
                return;
            }

            const fetchChat = async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-chat`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: user._id, create: true }),
                    });

                    if (!res.ok) {
                        console.error("Failed to fetch chat:", await res.text());
                        return;
                    }

                    const data = await res.json();
                    const getChat: Chat = data.chat[0];

                    if (!getChat) {
                        setDefault();
                        return;
                    }

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
        }, [user]);

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
                        <RecommendationPanel />
                    </Box>
                </Box>
            </Box>
        );
    }
