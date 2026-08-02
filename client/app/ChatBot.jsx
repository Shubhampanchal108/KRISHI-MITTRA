import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  TouchableWithoutFeedback,
  Image,
  Clipboard,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigationTab from "../src/components/NavigationTab";
import { LLM } from "../src/services/LLM";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { URL } from "../App";
import axios from "axios";
import { errorMsg, successMsg } from "../src/utils/Notification";
import { speak, stopTTS } from "../src/utils/TTS";

const SIDEBAR_WIDTH = 300;

const cleanThinkingText = (text) => {
  if (!text || typeof text !== "string") return "";
  let cleaned = text;
  cleaned = cleaned.replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, "");
  cleaned = cleaned.replace(/<(think|thought|reasoning)>[\s\S]*/gi, "");
  cleaned = cleaned.replace(/<\/?(think|thought|reasoning)>/gi, "");
  if (/(?:internal monologue|drafting the response|key points to include|final check against constraints|my task is to)/i.test(cleaned)) {
    const hindiMatch = cleaned.match(/[\u0900-\u097F]/);
    if (hindiMatch) {
      const firstHindiIdx = hindiMatch.index;
      const textBefore = cleaned.substring(0, firstHindiIdx);
      if (/(?:internal monologue|drafting|task|context|greeting|key points|constraints|monologue)/i.test(textBefore)) {
        cleaned = cleaned.substring(firstHindiIdx);
      }
    }
  }
  return cleaned.replace(/[*#_~`]/g, "").trim();
};

const SUGGESTED_PROMPTS = [
  {
    icon: "leaf-outline",
    label: "Wheat Care",
    query: "Wheat crop mein yellow rust disease ke symptoms aur organic treatment kya hain?",
  },
  {
    icon: "bug-outline",
    label: "Pest Control",
    query: "Fasal ko keedon se bachane ke liye sabse achha neem oil spray kaise banayein?",
  },
  {
    icon: "water-outline",
    label: "Irrigation",
    query: "Garmi ke mausam mein tamatar ki kheti mein drip irrigation ka sahi timing kya hai?",
  },
  {
    icon: "flask-outline",
    label: "Soil & Fertilizers",
    query: "Mitti ki urvara shakti badhane ke liye konsa bio-fertilizer upyog karein?",
  },
];

const Chatbot = () => {
  const flatListRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Namaste! 🙏 Main hoon Krishi-Mittra, aapka AI Kheti Saathi. Kheti-badi, fasal bimari, mitti aur khaad se judi koi bhi jaankari poochhein!",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [activeSpeechId, setActiveSpeechId] = useState(null);

  // Session state variables
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarAnimation] = useState(new Animated.Value(-SIDEBAR_WIDTH));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Per-user AsyncStorage key helpers (isolates chat data per account)
  const userIdRef = useRef(null);
  const sessionsKey = () => `chat_sessions_${userIdRef.current || "guest"}`;
  const historyKey = () => `chatHistory_${userIdRef.current || "guest"}`;

  // Initialize Chat and Sessions on Mount
  useEffect(() => {
    const initChat = async () => {
      try {
        // Read userId first so all keys are user-scoped
        const uid = await AsyncStorage.getItem("userId");
        userIdRef.current = uid || "guest";

        const storedSessions = await AsyncStorage.getItem(sessionsKey());
        let parsedSessions = storedSessions ? JSON.parse(storedSessions) : [];

        if (parsedSessions.length === 0) {
          const defaultSession = {
            id: Date.now().toString(),
            title: "New Farm Inquiry",
            messages: [
              {
                id: 1,
                text: "Namaste! 🙏 Main hoon Krishi-Mittra, aapka AI Kheti Saathi. Kheti-badi, fasal bimari, mitti aur khaad se judi koi bhi jaankari poochhein!",
                sender: "bot",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
            rawHistory: [],
            updatedAt: Date.now(),
          };
          parsedSessions = [defaultSession];
          await AsyncStorage.setItem(sessionsKey(), JSON.stringify(parsedSessions));
        }

        setSessions(parsedSessions);

        const sorted = [...parsedSessions].sort((a, b) => b.updatedAt - a.updatedAt);
        const activeSession = sorted[0];

        setActiveSessionId(activeSession.id);
        setMessages(activeSession.messages);

        await AsyncStorage.setItem(
          historyKey(),
          JSON.stringify(activeSession.rawHistory || [])
        );
      } catch (error) {
        console.error("Error initializing chat sessions:", error);
      }
    };
    initChat();
  }, []);

  // Animate sidebar opening/closing
  const toggleSidebar = (open) => {
    if (open) {
      setIsSidebarOpen(true);
      Animated.timing(sidebarAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sidebarAnimation, {
        toValue: -SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsSidebarOpen(false);
      });
    }
  };

  // Switch to selected session
  const switchSession = async (sessionId) => {
    try {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setActiveSessionId(sessionId);
        setMessages(session.messages);
        await AsyncStorage.setItem(
          historyKey(),
          JSON.stringify(session.rawHistory || [])
        );
      }
      toggleSidebar(false);
    } catch (e) {
      console.error("Error switching session:", e);
    }
  };

  // Start new empty chat session
  const startNewChat = async () => {
    try {
      const newSession = {
        id: Date.now().toString(),
        title: "New Farm Inquiry",
        messages: [
          {
            id: 1,
            text: "Namaste! 🙏 Main hoon Krishi-Mittra, aapka AI Kheti Saathi. Kheti-badi, fasal bimari, mitti aur khaad se judi koi bhi jaankari poochhein!",
            sender: "bot",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
        rawHistory: [],
        updatedAt: Date.now(),
      };

      const updated = [newSession, ...sessions];
      setSessions(updated);
      await AsyncStorage.setItem(sessionsKey(), JSON.stringify(updated));

      setActiveSessionId(newSession.id);
      setMessages(newSession.messages);
      await AsyncStorage.setItem(historyKey(), JSON.stringify([]));

      setIsDropdownOpen(false);
      toggleSidebar(false);
    } catch (e) {
      console.error("Error starting new chat:", e);
    }
  };

  // Delete chat session
  const deleteSession = async (idToDelete) => {
    try {
      let updated = sessions.filter((s) => s.id !== idToDelete);

      if (updated.length === 0) {
        const defaultSession = {
          id: Date.now().toString(),
          title: "New Farm Inquiry",
          messages: [
            {
              id: 1,
              text: "Namaste! 🙏 Main hoon Krishi-Mittra, aapka AI Kheti Saathi. Kheti-badi, fasal bimari, mitti aur khaad se judi koi bhi jaankari poochhein!",
              sender: "bot",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
          rawHistory: [],
          updatedAt: Date.now(),
        };
        updated.push(defaultSession);
      }

      setSessions(updated);
      await AsyncStorage.setItem(sessionsKey(), JSON.stringify(updated));

      if (idToDelete === activeSessionId) {
        const nextActive = updated[0];
        setActiveSessionId(nextActive.id);
        setMessages(nextActive.messages);
        await AsyncStorage.setItem(
          historyKey(),
          JSON.stringify(nextActive.rawHistory || [])
        );
      }

      setIsDropdownOpen(false);
      successMsg("Chat session deleted.");
    } catch (e) {
      console.error("Error deleting session:", e);
    }
  };

  // Copy text helper
  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    successMsg("Copied to clipboard.");
  };

  // Speak helper
  const handleSpeech = (text, msgId) => {
    if (activeSpeechId === msgId) {
      if (typeof stopTTS === "function") stopTTS();
      setActiveSpeechId(null);
    } else {
      speak(text);
      setActiveSpeechId(msgId);
    }
  };

  // Send Message
  const handleSend = async (customQuery) => {
    const query = customQuery || input;
    if (!query || !query.trim()) return;

    setIsDropdownOpen(false);
    if (!customQuery) setInput("");

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg = { id: Date.now(), text: query, sender: "user", time: currentTime };
    const updatedMessagesWithUser = [...messages, newMsg];
    setMessages(updatedMessagesWithUser);

    setLoading(true);

    const data = await LLM(query);

    const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedMessagesWithBot = [
      ...updatedMessagesWithUser,
      { id: Date.now() + 1, text: data, sender: "bot", time: botTime },
    ];
    setMessages(updatedMessagesWithBot);
    setLoading(false);

    // Save chat session in AsyncStorage (user-scoped keys)
    try {
      const storedHistory = await AsyncStorage.getItem(historyKey());
      const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];

      const updatedSessions = sessions.map((session) => {
        if (session.id === activeSessionId) {
          const updatedSession = {
            ...session,
            messages: updatedMessagesWithBot,
            rawHistory: parsedHistory,
            updatedAt: Date.now(),
          };

          if (session.title === "New Chat" || session.title === "New Farm Inquiry") {
            updatedSession.title = query.length > 25 ? query.substring(0, 25) + "..." : query;
          }
          return updatedSession;
        }
        return session;
      });

      setSessions(updatedSessions);
      await AsyncStorage.setItem(sessionsKey(), JSON.stringify(updatedSessions));
    } catch (error) {
      console.error("Error updating session chat history:", error);
    }

    // Save chat entry in DB
    try {
      const payload = {
        userId: await AsyncStorage.getItem("userId"),
        query: query,
        response: data,
      };
      const result = await axios.post(`${URL}/api/main/chat/add`, payload);
      if (result.data) console.log("History Saved to DB.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* ── Modern App Header ────────────────────────────────────────── */}
      <SafeAreaView style={styles.customHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => toggleSidebar(true)}
            style={styles.menuIconBtn}
          >
            <Ionicons name="menu-outline" size={26} color="#1B5E20" />
          </TouchableOpacity>

          <View style={styles.botAvatarHeader}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.onlineBadge} />
          </View>

          <View style={styles.headerTextGroup}>
            <Text style={styles.appName}>Krishi-Mittra</Text>
            <Text style={styles.appSubTitle}>AI Farm Doctor • Online</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={startNewChat}
            style={styles.headerActionBtn}
          >
            <Ionicons name="add" size={22} color="#1B5E20" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            style={styles.headerActionBtn}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#1B5E20" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 5}
      >
        <SafeAreaView style={styles.container}>
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem} onPress={startNewChat}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#1B5E20" />
                <Text style={styles.dropdownText}>Start New Chat</Text>
              </TouchableOpacity>

              <View style={styles.dropdownSeparator} />

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => deleteSession(activeSessionId)}
              >
                <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                <Text style={[styles.dropdownText, { color: "#D32F2F" }]}>Delete Session</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Chat Messages Timeline */}
          <FlatList
            ref={flatListRef}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            data={messages}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            onTouchStart={() => setIsDropdownOpen(false)}
            contentContainerStyle={styles.messagesContainer}
            renderItem={({ item }) => {
              const isUser = item.sender === "user";
              return (
                <View
                  style={[
                    styles.messageRow,
                    isUser ? styles.userRow : styles.botRow,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.botAvatarCircle}>
                      <FontAwesome5 name="robot" size={12} color="#fff" />
                    </View>
                  )}

                  <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
                    <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
                      {cleanThinkingText(item.text)}
                    </Text>

                    <View style={styles.msgFooter}>
                      <Text style={[styles.msgTimeText, isUser ? styles.userTimeText : styles.botTimeText]}>
                        {item.time || "Just now"}
                      </Text>

                      {!isUser && (
                        <View style={styles.msgActionRow}>
                          <TouchableOpacity
                            style={styles.msgActionBtn}
                            onPress={() => handleSpeech(cleanThinkingText(item.text), item.id)}
                          >
                            <Ionicons
                              name={activeSpeechId === item.id ? "volume-mute" : "volume-high-outline"}
                              size={15}
                              color="#2E7D32"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.msgActionBtn}
                            onPress={() => copyToClipboard(cleanThinkingText(item.text))}
                          >
                            <Ionicons name="copy-outline" size={15} color="#555" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              loading ? (
                <View style={styles.botRow}>
                  <View style={styles.botAvatarCircle}>
                    <FontAwesome5 name="robot" size={12} color="#fff" />
                  </View>
                  <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                    <ActivityIndicator size="small" color="#2E7D32" />
                    <Text style={styles.typingText}>Krishi-Mittra is thinking...</Text>
                  </View>
                </View>
              ) : null
            }
          />

          {/* Quick Prompts Banner (Shown when 1 or 2 messages in session) */}
          {messages.length <= 2 && (
            <View style={styles.promptSection}>
              <Text style={styles.promptHeading}>💡 Suggested Questions</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promptScroll}
              >
                {SUGGESTED_PROMPTS.map((p, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.promptChip}
                    onPress={() => handleSend(p.query)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={p.icon} size={16} color="#2E7D32" style={{ marginRight: 6 }} />
                    <Text style={styles.promptChipText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Modern Input Bar */}
          <View style={styles.inputContainer}>
            <View style={styles.inputCapsule}>
              <TextInput
                style={styles.input}
                placeholder="Ask about crops, diseases, fertilizers..."
                placeholderTextColor="#888"
                value={input}
                onChangeText={(text) => {
                  setInput(text);
                  setIsDropdownOpen(false);
                }}
                onSubmitEditing={() => handleSend()}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                onPress={() => handleSend()}
                disabled={!input.trim() || loading}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <NavigationTab />

      {/* ── Sidebar Navigation Drawer ────────────────────────────────── */}
      {isSidebarOpen && (
        <View style={styles.sidebarOverlay}>
          <TouchableWithoutFeedback onPress={() => toggleSidebar(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.sidebar,
              { transform: [{ translateX: sidebarAnimation }] },
            ]}
          >
            {/* Header */}
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarTitleGroup}>
                <View style={styles.historyIconBadge}>
                  <Ionicons name="time" size={18} color="#2E7D32" />
                </View>
                <View>
                  <Text style={styles.sidebarTitle}>Chat History</Text>
                  <Text style={styles.sidebarSubTitle}>{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => toggleSidebar(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#555" />
              </TouchableOpacity>
            </View>

            {/* New Chat Button */}
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={startNewChat}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.newChatButtonText}>New Chat Session</Text>
            </TouchableOpacity>

            {/* Search Filter Box */}
            <View style={styles.searchBoxContainer}>
              <Ionicons name="search-outline" size={16} color="#888" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search history..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={16} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Session List */}
            <FlatList
              data={sessions.filter((s) =>
                s.title.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isActive = item.id === activeSessionId;
                const lastMsg = item.messages && item.messages.length > 0
                  ? item.messages[item.messages.length - 1].text
                  : "No messages yet";

                return (
                  <View style={[styles.sessionCard, isActive && styles.activeSessionCard]}>
                    {isActive && <View style={styles.activeIndicatorStrip} />}

                    <TouchableOpacity
                      style={styles.sessionCardClickable}
                      onPress={() => switchSession(item.id)}
                    >
                      <View style={[styles.sessionCardIcon, isActive && styles.activeSessionCardIcon]}>
                        <Ionicons
                          name={isActive ? "chatbubble-ellipses" : "chatbubble-outline"}
                          size={16}
                          color={isActive ? "#2E7D32" : "#777"}
                        />
                      </View>

                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text
                            numberOfLines={1}
                            style={[styles.sessionTitle, isActive && styles.activeSessionTitle]}
                          >
                            {item.title}
                          </Text>
                          <Text style={styles.sessionTime}>
                            {item.updatedAt
                              ? new Date(item.updatedAt).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}
                          </Text>
                        </View>
                        <Text numberOfLines={1} style={styles.sessionSnippet}>
                          {lastMsg}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => deleteSession(item.id)}
                      style={styles.sessionDeleteBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={15} color="#C62828" />
                    </TouchableOpacity>
                  </View>
                );
              }}
              contentContainerStyle={{ paddingVertical: 8 }}
              ListEmptyComponent={
                <View style={styles.emptyHistoryBox}>
                  <Ionicons name="search" size={28} color="#CCC" />
                  <Text style={styles.emptyHistoryText}>No matching chats found</Text>
                </View>
              }
            />

            {/* Footer */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={() => {
                  deleteSession(activeSessionId);
                }}
              >
                <Ionicons name="trash-bin-outline" size={16} color="#888" />
                <Text style={styles.clearAllText}>Clear Current Chat</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Header
  customHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 0 : "2%",
    paddingHorizontal: 16,
    paddingBottom: "-30%",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5E9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconBtn: {
    padding: 6,
    marginRight: 6,
    borderRadius: 8,
    backgroundColor: "#F4F8F4",
  },
  botAvatarHeader: {
    position: "relative",
    marginRight: 10,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerTextGroup: {
    justifyContent: "center",
  },
  appName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: 0.2,
  },
  appSubTitle: {
    fontSize: 11,
    color: "#2E7D32",
    fontWeight: "600",
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerActionBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F4F8F4",
  },

  // Main Container
  container: {
    flex: 1,
    backgroundColor: "#F4F8F4",
    paddingTop: "-34%"
  },

  // Messages List
  messagesContainer: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  botAvatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  userBubble: {
    backgroundColor: "#2E7D32",
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  botText: {
    color: "#222",
  },
  userText: {
    color: "#fff",
  },
  msgFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 4,
  },
  msgTimeText: {
    fontSize: 10,
  },
  botTimeText: {
    color: "#999",
  },
  userTimeText: {
    color: "rgba(255,255,255,0.75)",
  },
  msgActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  msgActionBtn: {
    padding: 2,
  },

  // Typing Bubble
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },

  // Suggested Prompts
  promptSection: {
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  promptHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  promptScroll: {
    gap: 8,
  },
  promptChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    elevation: 1,
  },
  promptChipText: {
    fontSize: 12.5,
    color: "#1B5E20",
    fontWeight: "600",
  },

  // Input Box styling
  inputContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8F5E9",
    marginBottom: "-13%"
  },
  inputCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F8F4",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  input: {
    flex: 1,
    height: 42,
    color: "#333",
    fontSize: 14,
    paddingHorizontal: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#A5D6A7",
  },

  // Dropdown Menu Styles
  dropdownMenu: {
    position: "absolute",
    top: 6,
    right: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 170,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    fontWeight: "600",
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: "#F4F8F4",
    marginHorizontal: 12,
  },

  // Sidebar Styles
  sidebarOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 2000,
  },
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : 36,
    paddingHorizontal: 16,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 16,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sidebarTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1B5E20",
  },
  sidebarSubTitle: {
    fontSize: 11,
    color: "#777",
    fontWeight: "500",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#F4F8F4",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    borderRadius: 14,
    paddingVertical: 13,
    marginBottom: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  newChatButtonText: {
    color: "#fff",
    fontSize: 14.5,
    fontWeight: "700",
  },
  searchBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F8F4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    padding: 0,
  },
  sessionCard: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    marginVertical: 4,
    backgroundColor: "#F9FBF9",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#F0F4F0",
    overflow: "hidden",
  },
  activeSessionCard: {
    backgroundColor: "#E8F5E9",
    borderColor: "#C8E6C9",
  },
  activeIndicatorStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#2E7D32",
  },
  sessionCardClickable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sessionCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F0F4F0",
    alignItems: "center",
    justifyContent: "center",
  },
  activeSessionCardIcon: {
    backgroundColor: "#fff",
  },
  sessionTitle: {
    fontSize: 13.5,
    color: "#333",
    fontWeight: "600",
  },
  activeSessionTitle: {
    color: "#1B5E20",
    fontWeight: "800",
  },
  sessionSnippet: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
  },
  sessionTime: {
    fontSize: 10,
    color: "#999",
    fontWeight: "500",
  },
  sessionDeleteBtn: {
    padding: 6,
    marginLeft: 6,
  },
  emptyHistoryBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: "#aaa",
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F4F8F4",
    paddingTop: 12,
    paddingBottom: 16,
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  clearAllText: {
    fontSize: 12.5,
    color: "#C62828",
    fontWeight: "600",
  },
});

export default Chatbot;
