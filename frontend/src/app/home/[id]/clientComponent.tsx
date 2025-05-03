"use client";

import { Box, useMediaQuery, useTheme, Drawer, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import Chatbot from "../../../components/Chatbot";
import RecommendationPanel from "../../../components/RecommendationPanel";
import { Chat, Message } from "@/utils/db";
import { useChatContext } from "@/context/ChatContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { generateAccessToken } from "@/app/actions/jwt";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export function HomePage({ chatId }: { chatId: string | null }) {
    const { update } = useSession();
    const { setChat, setMessages, setRecommendations, user, setDefault } = useChatContext();
    const router = useRouter();
    const currChatId = chatId;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [recOpen, setRecOpen] = useState(false);

    useEffect(() => {
        update();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const validChatIDRegex: RegExp = /^[a-z0-9]{21,25}$/;

        if (!currChatId || currChatId == "" || !validChatIDRegex.test(currChatId)) {
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
                    headers: { 'Content-Type': 'application/json', 'Authorization': `bearer ${await generateAccessToken(user)}` },
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

                setRecommendations(getChat.recommendation ? getChat.recommendation : []);
            } catch (error) {
                console.error("Error during fetch: ", error);
            }
        };

        fetchChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, currChatId, chatId]);

    return (
        <Box height="100%" display="flex" flexDirection="column" overflow="hidden">
            <Box display="flex" flexGrow={1} minHeight={0} sx={{ p: { xs: 1, sm: 3 }, bgcolor: "#121212", position: "relative" }}>
                {/* Chat Panel */}
                <Box
                    sx={{
                        width: { xs: "100%", sm: "50%" },
                        height: "100%",
                        bgcolor: "white",
                        color: "black",
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        boxShadow: 3,
                        mr: { xs: 0, sm: 2 },
                        minHeight: 0,
                        position: "relative",
                    }}
                >
                    <Chatbot />
                    {/* Popout button for mobile */}
                    {isMobile && (
                        <IconButton
                            onClick={() => setRecOpen(true)}
                            sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                zIndex: 10,
                                bgcolor: "background.paper",
                                borderRadius: "50%",
                                boxShadow: 2,
                            }}
                            aria-label="Show recommended parts"
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                    )}
                </Box>

                {/* Desktop Recommendation Panel */}
                {!isMobile && (
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
                )}

                {/* Mobile Drawer for Recommendations */}
                {isMobile && (
                    <Drawer
                        anchor="right"
                        open={recOpen}
                        onClose={() => setRecOpen(false)}
                        PaperProps={{
                            sx: { width: "85vw", maxWidth: 400, bgcolor: "#181A1B", p: 2 }
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <IconButton onClick={() => setRecOpen(false)}>
                                <ChevronRightIcon />
                            </IconButton>
                        </Box>
                        <RecommendationPanel />
                    </Drawer>
                )}
            </Box>
        </Box>
    );
}
