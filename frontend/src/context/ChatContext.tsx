// context/MyContext.js
// Ensure the Chat type is properly imported or defined
import { Chat, Message, Recommendation } from "@/utils/db"; // Verify that Chat is exported from this module
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
}

type ContextProviderProps = {
    children: React.ReactNode;
  };

const ChatContext = createContext<null | ChatContextType>(null);
export const ChatContextProvider = ({ children }: ContextProviderProps) => {
  const [chat, setChat] = useState<Chat>();
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Hello! How can I assist you today?' } as Message]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingMain, setIsLoading] = useState(false);
  const allItems = {
    chat, setChat, messages, setMessages, recommendations, setRecommendations, isLoadingMain, setIsLoading
  };
  return (
    <ChatContext.Provider value={allItems}>
      {children}
    </ChatContext.Provider>
  );
};
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }
  return context;
};