"use client";

import { useEffect, useState } from "react";
import { Box, Button, Typography, Card, CardContent, IconButton } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { useRouter } from "next/navigation";
import { useChatContext } from "@/context/ChatContext";
import { useSession } from "next-auth/react";
import { Chat, Message } from "@/utils/db";
import DialogDeleteChat from "@/components/DialogDeleteChat";
import { generateAccessToken } from "@/app/actions/jwt";
import { format } from "date-fns";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

// generate a title from the first user message
function getChatTitle(messages: Message[]) {
    const firstUserMsg = messages?.find((m: Message) => m.role === "user")?.content;
    if (firstUserMsg) {
        const words = firstUserMsg.trim().split(" ");
        return words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "");
    }
    return "Untitled Chat";
}

// get a preview from the latest message
function getChatPreview(messages: Message[]) {
  const lastMsg = messages?.at(-1)?.content ?? "";
  console.log(lastMsg);
    if (lastMsg) {
        return lastMsg.length > 60 ? lastMsg.slice(0, 60) + "..." : "";
    }
    return "";
}

// format date
function getFormattedDate(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return format(date, "MMM d, yyyy, h:mm a");
}

export default function ChatsPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const { user, setChat, setMessages } = useChatContext();
    const [selectedDeleteChat, setDeleteChat] = useState<Chat | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const { update } = useSession();
    const router = useRouter();
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>("");

    useEffect(() => {
        update();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!user?._id) return;
        const getChats = async () => {
            try {
                const bearerToken = await generateAccessToken(user);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `bearer ${bearerToken}` },
                    body: JSON.stringify({ userId: user._id, create: false }),
                });
                console.log({ res });

                if (!res.ok) {
                    throw new Error("Failed to fetch chats");
                }

                const data = await res.json();
                setChats(data.chat || []);
            } catch (err) {
                console.error("Failed to fetch chats:", err);
            }
        };

        getChats();
    }, [user]);

    const createChat = async () => {
        if (!user?._id) return;

        const createChat = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `bearer ${await generateAccessToken(user)}` },
                    body: JSON.stringify({ userId: user._id }),
                });

                const data = await res.json();
                const newChat: Chat = data.chat;

                if (!newChat || !newChat._id) return;

                setChat(newChat);
                setMessages(newChat.messages || []);
                router.push(`/home/${newChat._id}`);
            } catch (err) {
                console.error("Failed to create chat:", err);
            }
        };
        createChat();
    };

    const openChat = async (chatId: string) => {
        try {
            if (!chatId) {
                throw new Error("Invalid Chat URL");
            }
            router.push(`/home/${chatId}`);
        } catch (err) {
            console.error("Failed to open chat:", err);
        }
    };

    const deleteChat = async () => {
        const handleDeleteChat = async () => {
            console.log("fixed");
            if (!selectedDeleteChat) {
                throw new Error("Unknown chat to delete");
            }
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `bearer ${await generateAccessToken(user)}` },
                    body: JSON.stringify({ chatId: selectedDeleteChat._id }),
                });

                if (res.ok) {
                    setChats((prev) => prev.filter((c) => c._id !== selectedDeleteChat._id));
                } else {
                    alert("Failed to delete chat.");
                }
            } catch (err) {
                console.error("Error deleting chat:", err);
            }
        };

        handleDeleteChat();
    };

    const handleDelete = (chatId: string) => {
        const chat = chats.find((c) => c._id === chatId);
        if (chat) {
            setDeleteChat(chat);
            setOpenDialog(true);
        }
    };

    const saveChatTitle = async (chatId: string) => {
        if (!editingTitle.trim()) {
            alert("Chat title cannot be empty.");
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rename-chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `bearer ${await generateAccessToken(user)}` },
                body: JSON.stringify({ chatId, name: editingTitle }),
            });
            if (res.ok) {
                setChats((prev) => prev.map((c) => (c._id === chatId ? { ...c, display: editingTitle } : c)));
                setEditingChatId(null);
                setEditingTitle("");
            } else {
                alert("Failed to rename chat.");
            }
        } catch (err) {
            console.error("Error renaming chat:", err);
        }
    };

  const sortedChats = [...chats].sort((a, b) => {
    const aLastMsg = a.messages?.length ? a.messages[a.messages.length - 1]?.createdAt : a.updatedAt || a.createdAt;
    const bLastMsg = b.messages?.length ? b.messages[b.messages.length - 1]?.createdAt : b.updatedAt || b.createdAt;
    return new Date(bLastMsg || 0).getTime() - new Date(aLastMsg || 0).getTime();
  });

    return (
        <Box sx={{ bgcolor: "#121212", minHeight: "100%", p: 4 }}>
            <Typography variant="h4" color="white" gutterBottom sx={{ textAlign: "center", fontWeight: "bold" }}>
                Your Chats
            </Typography>

            <Box display="flex" justifyContent="center" mb={3}>
                <Button variant="contained" onClick={createChat}>
                    + New Chat
                </Button>
            </Box>
            <DialogDeleteChat agreeText="Delete" disagreeText="Cancel" open={openDialog} setOpen={setOpenDialog} handleFunction={deleteChat} />
            <AnimatePresence>
                <Grid
                  component={motion.div}
                  layout
                  container
                  gap={3}
                  sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}
                  width={"100%"}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                    {sortedChats.map((chat: Chat) => (
                        <Grid key={chat._id} size={{xs: 10, sm: 5, md: 4, lg: 3}} height={"100%"} width={"100%"}>
                            <Card
                              sx={{
                                bgcolor: "#232323",
                                color: "white",
                                position: "relative",
                                height: "100%",
                                cursor: "pointer",
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                              }}
                              onClick={() => openChat(chat._id)}
                            >
                                <CardContent sx={{ pb: 6, position: "relative" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", pr: 6 }}>
                                        {editingChatId === chat._id ? (
                                            <>
                                                <input
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    style={{
                                                        fontSize: "1.25rem",
                                                        fontWeight: "bold",
                                                        background: "#232323",
                                                        color: "white",
                                                        border: "1px solid #444",
                                                        borderRadius: 4,
                                                        padding: "2px 8px",
                                                        marginRight: 8,
                                                        flex: 1,
                                                    }}
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") saveChatTitle(chat._id);
                                                        if (e.key === "Escape") {
                                                            setEditingChatId(null);
                                                            setEditingTitle("");
                                                        }
                                                    }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        saveChatTitle(chat._id);
                                                    }}
                                                    sx={{ color: "lightgreen" }}
                                                >
                                                    <CheckIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingChatId(null);
                                                        setEditingTitle("");
                                                    }}
                                                    sx={{ color: "red" }}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <Typography noWrap variant="h6" sx={{ fontWeight: "bold", mb: 1, flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {chat.display &&
                                                    chat.display.trim() !== "" &&
                                                    !/^Chat \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(chat.display.trim()) &&
                                                    chat.display.trim() !== getChatTitle(chat.messages)
                                                        ? chat.display
                                                        : getChatTitle(chat.messages)}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingChatId(chat._id);
                                                        setEditingTitle(chat.display || getChatTitle(chat.messages));
                                                    }}
                                                    sx={{ ml: 1, color: "grey.400" }}
                                                    aria-label="Rename chat"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                    <Typography textOverflow={"ellipsis"} noWrap variant="body2" sx={{ color: "grey.400", mb: 2 }}>
                                        {getChatPreview(chat.messages)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "grey.500", position: "absolute", bottom: 8, right: 16 }}>
                                        {getFormattedDate(chat.createdAt.toString())}
                                    </Typography>
                                </CardContent>
                                <IconButton
                                    aria-label="delete"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        handleDelete(chat._id);
                                    }}
                                    sx={{
                                        position: "absolute",
                                        top: 16,
                                        right: 16,
                                        color: "red",
                                        zIndex: 2,
                                        bgcolor: "#232323",
                                        "&:hover": { bgcolor: "#2e2e2e" },
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </AnimatePresence>
        </Box>
    );
}
