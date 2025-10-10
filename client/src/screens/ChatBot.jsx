import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "👋 Namaste! Main AgriMate hoon — aapki kheti saathi.", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages([...messages, newMsg]);

    // TODO: Add AI logic here
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "Yeh acha sawal hai! Main check karta hoon... 🌱", sender: "bot" },
      ]);
    }, 700);
    setInput("");
  };

  return (
    <SafeAreaView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Krishi Mittra</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
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
          <Ionicons name="send" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A5D6A7",
    marginBottom: 10,
    width: '100%',
    height: '80%'
  },
  header: {
    paddingVertical: 15,
    marginTop: 10,
    backgroundColor: "#4CAF50",
    borderBottomWidth: 1,
    borderBottomColor: "#A5D6A7",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  botBubble: {
    backgroundColor: "#C8E6C9",
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#4CAF50",
    alignSelf: "flex-end",
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
    backgroundColor: "#A5D6A7",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F8E9",
    borderRadius: 20,
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
