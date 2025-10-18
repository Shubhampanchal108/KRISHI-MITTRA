import { useContext, useState, createContext } from "react";

const ChatContext = createContext();

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState(["Hello"]);

  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const History = {messages, addMessage};

  return (
    <ChatContext.Provider value={History}>
      {children}
    </ChatContext.Provider>
  );
};
