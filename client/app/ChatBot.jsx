import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigationTab from "../src/components/NavigationTab";
import HeaderTab from "../src/components/HeaderTab";
import { LLM } from "../src/services/LLM";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { URL } from "../App";
import axios from "axios";
import { errorMsg } from "../src/utils/Notification";
import {speak} from "../src/utils/TTS"

const Chatbot = () => {
  const flatListRef = React.useRef();
  const [loading , setLoading] = React.useState(false)

  const [messages, setMessages] = useState([
    { id: 1, text: "👋 Hi I am Krishi-Mittra aapka kheti saathi.", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const convertHistoryToMessages = (history) => {
    return history.map((item, index) => {
      const text = item.content || item.parts?.[0]?.text || item.text || "";
      const isUser = item.role === "user";
      return {
        id: index + 1,
        text,
        sender: isUser ? "user" : "bot",
      };
    });
  };

  useEffect(() => {
    const loadChats = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem("chatHistory");

        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          console.log(parsedHistory);
          if (parsedHistory.length > 0) {
            const converted = convertHistoryToMessages(parsedHistory);
            setMessages(converted);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadChats();
  }, []);

  const handleSend = async () => {
    
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages([...messages, newMsg]);

    setLoading(true)
    const query = input;
    setInput("")

    const data = await LLM(query);

    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, text: data, sender: "bot" },
    ]);
    setLoading(false)

    try {
      const payload = {
        userId: await AsyncStorage.getItem("userId"),
        query: input,
        response: data,
      };
      const result = await axios.post(`${URL}/api/main/chat/add`, payload);
      if (result.data) console.log("History Saved.");
    } catch (error) {
      console.log(error);
      errorMsg("Internal server error");
    }
  };

  return (
    <>
      <HeaderTab />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <SafeAreaView style={styles.container}>
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.9} onPress={()=>speak(item.text)}>
              <View
                style={[
                  styles.messageBubble,
                  item.sender === "user" ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === "user" ? styles.userText : styles.botText,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 15 }}
          />

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything about your crops..."
              placeholderTextColor="#777"
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              {loading ? <ActivityIndicator color="white"/>: <Ionicons name="send" size={22} color="white" />}
              
              
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      <NavigationTab />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0ebe0ff",
    width: "100%",
    height: "100%",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 15,
    marginVertical: 2,
  },
  botBubble: {
    backgroundColor: "#C8E6C9",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: "#4CAF50",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  botText: {
    color: "#1B5E20",
    fontSize: 15,
  },
  userText: {
    color: "#fff",
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#C8E6C9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#93df93ff",
    marginBottom: -44,
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F8E9",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    color: "#333",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    padding: 10,
  },
  micButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    padding: 10,
  },
});

export default Chatbot;
