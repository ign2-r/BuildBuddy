import { Chat, Message, Recommendation, User } from "@/utils/db";
import React, { createContext, useState, useContext } from "react";
interface ChatContextType {
    chat: Chat | undefined;
    setChat: React.Dispatch<React.SetStateAction<Chat | undefined>>;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    recommendations: Recommendation[];
    setRecommendations: React.Dispatch<React.SetStateAction<Recommendation[]>>;
    isLoadingMain: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setDefault: (is_logout: boolean) => void;
    openDialog: boolean;
    setopenDialog: (isOpen: boolean) => void;
    dialogState: { type: string; message: string };
    setdialogState: (dialog: { type: string; message: string }) => void;
}

type ContextProviderProps = {
    children: React.ReactNode;
};

const ChatContext = createContext<null | ChatContextType>(null);

export const ChatContextProvider = ({ children }: ContextProviderProps) => {
    const [chat, setChat] = useState<Chat>();
    const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hello! How can I assist you today?" } as Message]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoadingMain, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | null>({} as User);
    const [openDialog, setopenDialog] = useState<boolean>(false);
    const [dialogState, setdialogState] = useState<{ type: string; message: string }>({ type: "", message: "" });

    const setDefault = (is_logout: boolean = false) => {
        setChat({ _id: "", messages: [], recommendation: [], display: "", creator: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        setMessages([]);
        setRecommendations([]);
        if (is_logout) {
            setUser(null);
        }
    };

    const allItems = {
        chat,
        setChat,
        messages,
        setMessages,
        recommendations,
        setRecommendations,
        isLoadingMain,
        setIsLoading,
        user,
        setUser,
        setDefault,
        openDialog,
        setopenDialog,
        dialogState,
        setdialogState,
    };

    return <ChatContext.Provider value={allItems}>{children}</ChatContext.Provider>;
};

export const useChatContext = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatContextProvider");
    }
    return context;
};
