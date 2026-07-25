import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Share,
  Clipboard,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import HeaderTab from "../src/components/HeaderTab";
import NavigationTab from "../src/components/NavigationTab";
import axios from "axios";
import { URL } from "../App";
import { speak, stopTTS } from "../src/utils/TTS";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { errorMsg, successMsg } from "../src/utils/Notification";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Pest = () => {
  // Session State
  const [currentSession, setCurrentSession] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [userId, setUserId] = useState(null);

  // UI States
  const [imageUri, setImageUri] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [errorState, setErrorState] = useState(null); // { type, message, action }
  const [activeSpeechIndex, setActiveSpeechIndex] = useState(null);
  const [activeMode, setActiveMode] = useState("report"); // report or chat

  const scrollViewRef = useRef();

  // Loading Steps for Progressive Loading
  const loadingMessages = [
    "Uploading image to server...",
    "Detecting crop type...",
    "Analyzing symptoms & identifying disease...",
    "Consulting Krishi Mitra Vision AI...",
    "Preparing organic & chemical treatments..."
  ];

  // Fetch userId and session on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const activeUid = storedUserId || "65b2d8d80f00000000000001";
        setUserId(activeUid);
        loadHistory(activeUid);

        // Load cached session scoped to this user only
        const cachedSession = await AsyncStorage.getItem(`activePestSession_${activeUid}`);
        if (cachedSession) {
          const parsed = JSON.parse(cachedSession);
          setCurrentSession(parsed);
          setImageUri(`${URL}${parsed.imageUrl}`);
        }
      } catch (err) {
        console.error("Initialization Error:", err);
      }
    };
    initialize();
  }, []);

  // Progressive Loading timer
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load history from server
  const loadHistory = async (uid) => {
    try {
      const res = await axios.get(`${URL}/api/main/pest/history/${uid || userId}`);
      if (res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.log("Error loading history:", err.message);
    }
  };

  // Start new scan session
  const startScanSession = async (uri) => {
    if (!uri) return;
    setErrorState(null);
    setLoading(true);
    setCurrentSession(null);

    try {
      const data = new FormData();
      data.append("userId", userId);
      data.append("image", {
        uri: uri,
        name: "crop_disease.jpg",
        type: "image/jpeg"
      });

      // API call with 45s timeout for heavy AI vision model
      const res = await axios.post(`${URL}/api/main/pest/scan`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 45000
      });

      if (res.data && res.data._id) {
        const session = res.data;
        // Verify if it returned invalid agriculture image
        if (session.cropName === "Invalid") {
          setErrorState({
            type: "INVALID_IMAGE",
            message: session.chatHistory[0]?.content || "Please scan plants or crops only.",
            action: () => pickImage()
          });
          setLoading(false);
          return;
        }

        setCurrentSession(session);
        setImageUri(`${URL}${session.imageUrl}`);
        await AsyncStorage.setItem(`activePestSession_${userId}`, JSON.stringify(session));
        loadHistory(userId);
        setActiveMode("report");
        successMsg("Crop diagnosis completed!");
      }
    } catch (err) {
      console.error("Scan Error:", err);
      let errMsg = "AI scan failed. Please check your internet or try a clearer image.";
      let errType = "SCAN_FAIL";

      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errMsg = "AI analysis took too long. Please retry with a smaller/clearer image.";
        errType = "TIMEOUT";
      } else if (!navigator.onLine && err.message?.includes("Network")) {
        errMsg = "No internet connection detected. Please connect and try again.";
        errType = "OFFLINE";
      }

      setErrorState({
        type: errType,
        message: errMsg,
        action: () => startScanSession(uri)
      });
    } finally {
      setLoading(false);
    }
  };

  // Continue chat session
  const sendMessage = async () => {
    if (!inputText.trim() || !currentSession) return;
    const query = inputText.trim();
    setInputText("");
    setErrorState(null);
    setChatLoading(true);

    // Optimistically add user message to list
    const optimisticMessage = { role: "user", content: query, createdAt: new Date() };
    const updatedHistory = [...currentSession.chatHistory, optimisticMessage];
    setCurrentSession((prev) => ({ ...prev, chatHistory: updatedHistory }));

    // Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await axios.post(`${URL}/api/main/pest/chat`, {
        sessionId: currentSession._id,
        query
      });

      if (res.data && res.data.chatHistory) {
        const updatedSession = { ...currentSession, chatHistory: res.data.chatHistory };
        setCurrentSession(updatedSession);
        await AsyncStorage.setItem(`activePestSession_${userId}`, JSON.stringify(updatedSession));
      }
    } catch (err) {
      console.error("Chat Error:", err);
      // Revert optimistic add or show error inside chat list
      const errorMessage = {
        role: "assistant",
        content: "⚠️ Failed to send message. Please check your network and try again.",
        isError: true
      };
      setCurrentSession((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, errorMessage]
      }));
    } finally {
      setChatLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // Image Selection Handlers
  const pickImage = async () => {
    Alert.alert("Select Image Source", "Help our AI Crop Doctor scan your crop leaf:", [
      { text: "📷 Open Camera", onPress: () => openCamera() },
      { text: "🖼️ Choose from Gallery", onPress: () => openGallery() },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErrorState({
        type: "PERMISSION_DENIED",
        message: "Camera permissions are required to scan crops directly.",
        action: () => openCamera()
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8
    });
    if (!result.canceled) {
      startScanSession(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorState({
        type: "PERMISSION_DENIED",
        message: "Gallery storage access is required to upload crop leaves.",
        action: () => openGallery()
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8
    });
    if (!result.canceled) {
      startScanSession(result.assets[0].uri);
    }
  };

  // Load a session from History list
  const selectSession = async (session) => {
    setCurrentSession(session);
    setImageUri(`${URL}${session.imageUrl}`);
    setActiveMode("report");
    setShowHistory(false);
    setErrorState(null);
    await AsyncStorage.setItem(`activePestSession_${userId}`, JSON.stringify(session));
  };

  // Delete a session
  const deleteSessionItem = async (sessionId) => {
    try {
      await axios.delete(`${URL}/api/main/pest/session/${sessionId}`);
      setHistory((prev) => prev.filter((s) => s._id !== sessionId));
      if (currentSession && currentSession._id === sessionId) {
        resetState();
      }
      successMsg("Session deleted successfully.");
    } catch (err) {
      errorMsg("Failed to delete session.");
    }
  };

  // Reset entire flow for a clean new scan
  const resetState = async () => {
    setCurrentSession(null);
    setImageUri(null);
    setErrorState(null);
    setInputText("");
    stopTTS();
    setActiveSpeechIndex(null);
    await AsyncStorage.removeItem(`activePestSession_${userId}`);
  };

  // Audio advisory reader
  const handleSpeech = (text, index) => {
    if (activeSpeechIndex === index) {
      stopTTS();
      setActiveSpeechIndex(null);
    } else {
      setActiveSpeechIndex(index);
      speak(text, () => setActiveSpeechIndex(null));
    }
  };

  // Copy reply helper
  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    successMsg("Response copied to clipboard.");
  };

  // Share diagnosis details
  const shareDiagnosis = async () => {
    if (!currentSession) return;
    const { cropName, diseaseName, severity, confidence } = currentSession;
    const shareMessage = `🌾 Krishi Mitra AI Crop Doctor Report 🌾\n\nCrop: ${cropName}\nDisease/Pest: ${diseaseName}\nSeverity: ${severity}\nConfidence: ${confidence}%\n\nDiagnosis summary: ${currentSession.chatHistory[0]?.content}\n\nDownload Krishi Mitra to protect your farm today!`;
    try {
      await Share.share({ message: shareMessage });
    } catch (err) {
      errorMsg("Failed to share diagnosis.");
    }
  };

  // Severity style helper
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "High":
        return { bg: "#FFEBEE", text: "#C62828", icon: "alert-circle" };
      case "Moderate":
        return { bg: "#FFF3E0", text: "#E65100", icon: "warning" };
      case "Low":
        return { bg: "#E8F5E9", text: "#2E7D32", icon: "information-circle" };
      case "Healthy":
        return { bg: "#E0F2F1", text: "#00695C", icon: "checkmark-circle" };
      default:
        return { bg: "#ECEFF1", text: "#37474F", icon: "help-circle" };
    }
  };

  // Render detail sections for diagnosis
  const renderDiagnosisDetails = () => {
    if (!currentSession?.diagnosis) return null;
    const diag = currentSession.diagnosis;
    const items = [
      { key: "Symptoms", value: diag.symptoms, icon: "eye-outline", color: "#1976D2" },
      { key: "Causes", value: diag.causes, icon: "bug-outline", color: "#7B1FA2" },
      { key: "Organic Treatment", value: diag.organicTreatment, icon: "leaf-outline", color: "#2E7D32" },
      { key: "Chemical Treatment", value: diag.chemicalTreatment, icon: "flask-outline", color: "#D32F2F" },
      { key: "Preventative Measures", value: diag.preventativeMeasures, icon: "shield-checkmark-outline", color: "#F57C00" },
      { key: "Precautions", value: diag.precautions, icon: "hand-left-outline", color: "#37474F" }
    ].filter((item) => item.value);

    if (items.length === 0) return null;

    return (
      <View style={styles.detailsGrid}>
        {items.map((item, index) => (
          <View key={index} style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name={item.icon} size={18} color={item.color} />
              <Text style={[styles.detailTitle, { color: item.color }]}>{item.key}</Text>
            </View>
            <Text style={styles.detailContent}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <HeaderTab />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* Header Action Bar */}
          <View style={styles.actionBar}>
            <Text style={styles.actionBarTitle}>Crop Doctor</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowHistory(true)}>
                <Ionicons name="time-outline" size={22} color="#2E7D32" />
                <Text style={styles.iconBtnText}>History</Text>
              </TouchableOpacity>
              {(currentSession || errorState) && (
                <TouchableOpacity style={[styles.iconBtn, styles.newScanBtn]} onPress={resetState}>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={[styles.iconBtnText, { color: "#fff" }]}>New Scan</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Core Content Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingTitle}>Analyzing Crop Leaf</Text>
              <View style={styles.progressBox}>
                <Text style={styles.progressText}>{loadingMessages[loadingStep]}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Error Banner / Panel */}
          {errorState && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons
                name={errorState.type === "OFFLINE" ? "wifi-outline" : "alert-circle-outline"}
                size={64}
                color="#D32F2F"
              />
              <Text style={styles.errorTitle}>Diagnosis Interrupted</Text>
              <Text style={styles.errorText}>{errorState.message}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={errorState.action}>
                <Text style={styles.retryBtnText}>Retry Operation</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Initial Scan Welcome Screen (No Session active yet) */}
          {!currentSession && !loading && !errorState && (
            <ScrollView contentContainerStyle={styles.welcomeContainer}>
              <View style={styles.welcomeHero}>
                <Image
                  source={require("../assets/images/default.webp")}
                  style={styles.heroLogo}
                />
                <Text style={styles.welcomeTitle}>Scan Crop Disease Instantly</Text>
                <Text style={styles.welcomeDesc}>
                  Upload or snap a picture of an infected leaf. Our AI Crop Doctor identifies the disease and gives precise chemical/organic remedies.
                </Text>
              </View>

              {/* Upload source cards */}
              <View style={styles.uploadCardContainer}>
                <TouchableOpacity style={styles.uploadCard} onPress={openCamera}>
                  <View style={[styles.uploadIconCircle, { backgroundColor: "#E3F2FD" }]}>
                    <Ionicons name="camera" size={32} color="#1E88E5" />
                  </View>
                  <Text style={styles.uploadCardLabel}>Use Camera</Text>
                  <Text style={styles.uploadCardHint}>Snap leaf in direct light</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadCard} onPress={openGallery}>
                  <View style={[styles.uploadIconCircle, { backgroundColor: "#E8F5E9" }]}>
                    <Ionicons name="images" size={32} color="#4CAF50" />
                  </View>
                  <Text style={styles.uploadCardLabel}>Browse Gallery</Text>
                  <Text style={styles.uploadCardHint}>Pick leaf photo</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* Active Session Chat & Diagnosis Panel */}
          {currentSession && !loading && (
            <View style={{ flex: 1 }}>
              {/* Segmented Control Tabs */}
              <View style={styles.toggleTabBar}>
                <TouchableOpacity
                  style={[styles.toggleTab, activeMode === "report" && styles.toggleTabActive]}
                  onPress={() => setActiveMode("report")}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color={activeMode === "report" ? "#fff" : "#555"}
                  />
                  <Text
                    style={[styles.toggleTabText, activeMode === "report" && styles.toggleTabTextActive]}
                  >
                    Diagnosis Report
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleTab, activeMode === "chat" && styles.toggleTabActive]}
                  onPress={() => setActiveMode("chat")}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={16}
                    color={activeMode === "chat" ? "#fff" : "#555"}
                  />
                  <Text
                    style={[styles.toggleTabText, activeMode === "chat" && styles.toggleTabTextActive]}
                  >
                    Chat Doctor
                  </Text>
                </TouchableOpacity>
              </View>

              {/* View 1: Diagnosis Report Tab */}
              {activeMode === "report" && (
                <ScrollView
                  style={styles.reportScroll}
                  contentContainerStyle={styles.reportScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.heroDiagnosisRow}>
                    <Image source={{ uri: imageUri }} style={styles.largePreview} />
                    <View style={styles.heroDiagnosisMeta}>
                      <Text style={styles.metaLabel}>Confidence Match</Text>
                      <Text style={styles.metaValue}>{currentSession.confidence}%</Text>
                      <View style={styles.metaProgressBar}>
                        <View
                          style={[styles.metaProgressFill, { width: `${currentSession.confidence}%` }]}
                        />
                      </View>
                      <View style={styles.metaActions}>
                        <TouchableOpacity style={styles.metaActionBtn} onPress={shareDiagnosis}>
                          <Ionicons name="share-social-outline" size={16} color="#2E7D32" />
                          <Text style={styles.metaActionText}>Share Report</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Overview Stats */}
                  <View style={styles.reportOverview}>
                    <View style={styles.overviewItem}>
                      <Text style={styles.overviewLabel}>Crop Name</Text>
                      <Text style={styles.overviewValue}>{currentSession.cropName}</Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <Text style={styles.overviewLabel}>Disease/Pest</Text>
                      <Text style={styles.overviewValue}>{currentSession.diseaseName}</Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <Text style={styles.overviewLabel}>Severity</Text>
                      <View
                        style={[
                          styles.sevBadge,
                          {
                            backgroundColor: getSeverityStyle(currentSession.severity).bg,
                            alignSelf: "flex-start",
                            marginTop: 4,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.sevBadgeText,
                            { color: getSeverityStyle(currentSession.severity).text },
                          ]}
                        >
                          {currentSession.severity}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Detail grids */}
                  {renderDiagnosisDetails()}

                  {/* Promo Banner to switch to chatbot */}
                  <TouchableOpacity
                    style={styles.switchToChatPromo}
                    onPress={() => setActiveMode("chat")}
                  >
                    <Ionicons name="chatbubbles" size={24} color="#2E7D32" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.promoTitle}>Have queries about treatments?</Text>
                      <Text style={styles.promoDesc}>
                        Tap to ask follow-up questions to our AI Crop Doctor.
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#2E7D32" />
                  </TouchableOpacity>
                  <View style={{ height: 20 }} />
                </ScrollView>
              )}

              {/* View 2: Chat Doctor Tab */}
              {activeMode === "chat" && (
                <View style={{ flex: 1 }}>


                  {/* Message scroll container */}
                  <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatScrollView}
                    contentContainerStyle={styles.chatContentContainer}
                    onContentSizeChange={() =>
                      scrollViewRef.current?.scrollToEnd({ animated: true })
                    }
                  >
                    {currentSession.chatHistory.map((msg, index) => {
                      const isUser = msg.role === "user";
                      return (
                        <View
                          key={index}
                          style={[
                            styles.messageRow,
                            isUser ? styles.userMessageRow : styles.assistantMessageRow,
                          ]}
                        >
                          {!isUser && (
                            <View style={styles.botAvatar}>
                              <FontAwesome5 name="robot" size={12} color="#fff" />
                            </View>
                          )}
                          <View
                            style={[
                              styles.msgBubble,
                              isUser ? styles.userBubble : styles.assistantBubble,
                              msg.isError && styles.errorBubble,
                            ]}
                          >
                            <Text
                              style={[
                                styles.msgText,
                                isUser ? styles.userMsgText : styles.assistantMsgText,
                              ]}
                            >
                              {msg.content}
                            </Text>
                            <Text style={styles.msgTime}>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>

                            {!isUser && !msg.isError && (
                              <View style={styles.msgActions}>
                                <TouchableOpacity
                                  style={styles.bubbleAction}
                                  onPress={() => handleSpeech(msg.content, index)}
                                >
                                  <Ionicons
                                    name={activeSpeechIndex === index ? "volume-mute" : "volume-high"}
                                    size={16}
                                    color="#2E7D32"
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.bubbleAction}
                                  onPress={() => copyToClipboard(msg.content)}
                                >
                                  <Ionicons name="copy-outline" size={16} color="#555" />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                    {chatLoading && (
                      <View style={styles.assistantMessageRow}>
                        <View style={styles.botAvatar}>
                          <FontAwesome5 name="robot" size={12} color="#fff" />
                        </View>
                        <View
                          style={[styles.msgBubble, styles.assistantBubble, styles.typingBubble]}
                        >
                          <ActivityIndicator size="small" color="#2E7D32" />
                          <Text style={styles.typingText}>AI Crop Doctor is typing...</Text>
                        </View>
                      </View>
                    )}
                  </ScrollView>

                  {/* Input Box */}
                  <View style={styles.inputBar}>
                    <TouchableOpacity style={styles.inputActionBtn} onPress={pickImage}>
                      <Ionicons name="image-outline" size={24} color="#2E7D32" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inputActionBtn} onPress={openCamera}>
                      <Ionicons name="camera-outline" size={24} color="#2E7D32" />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.input}
                      placeholder="Ask follow-up questions..."
                      placeholderTextColor="#888"
                      value={inputText}
                      onChangeText={setInputText}
                      onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                      style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                      onPress={sendMessage}
                      disabled={!inputText.trim() || chatLoading}
                    >
                      <Ionicons name="send" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </KeyboardAvoidingView>

        {/* Scan History Bottom Sheet Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHistory(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.historySheet}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Scan History</Text>
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {history.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Ionicons name="folder-open-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No past crop scans found.</Text>
                </View>
              ) : (
                <FlatList
                  data={history}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <View style={styles.historyItemRow}>
                      <TouchableOpacity
                        style={styles.historyItem}
                        onPress={() => selectSession(item)}
                      >
                        <Image source={{ uri: `${URL}${item.imageUrl}` }} style={styles.historyThumb} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.historyCrop}>{item.cropName}</Text>
                          <Text style={styles.historyDisease} numberOfLines={1}>
                            {item.diseaseName}
                          </Text>
                          <Text style={styles.historyDate}>
                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short"
                            })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteHistoryBtn}
                        onPress={() => deleteSessionItem(item._id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#D32F2F" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      <NavigationTab />
    </>
  );
};

export default Pest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8F4"
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5E9"
  },
  actionBarTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E7D32"
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4
  },
  iconBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32"
  },
  newScanBtn: {
    backgroundColor: "#2E7D32"
  },

  // Welcome Screen
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: "center",
    paddingBottom: 40
  },
  welcomeHero: {
    alignItems: "center",
    marginBottom: 30
  },
  heroLogo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
    resizeMode: "cover"
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 10
  },
  welcomeDesc: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10
  },
  uploadCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 16
  },
  uploadCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8F5E9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  uploadIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  uploadCardLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4
  },
  uploadCardHint: {
    fontSize: 11,
    color: "#888",
    textAlign: "center"
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F4F8F4"
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B5E20",
    marginTop: 16,
    marginBottom: 12
  },
  progressBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8F5E9",
    alignItems: "center"
  },
  progressText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center"
  },
  progressBar: {
    height: 6,
    width: "100%",
    backgroundColor: "#E8F5E9",
    borderRadius: 3,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#C62828",
    marginTop: 16,
    marginBottom: 10
  },
  errorText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20
  },
  retryBtn: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700"
  },

  // Accordion diagnosis header
  diagnosisAccordion: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5E9"
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12
  },
  miniThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10
  },
  accordionCrop: {
    fontSize: 12,
    color: "#777",
    fontWeight: "600"
  },
  accordionDisease: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1B5E20"
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  sevBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  sevBadgeText: {
    fontSize: 10,
    fontWeight: "800"
  },
  accordionContent: {
    maxHeight: 280,
    borderTopWidth: 1,
    borderTopColor: "#F4F8F4",
    paddingHorizontal: 16,
    paddingTop: 12
  },
  heroDiagnosisRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12
  },
  largePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    resizeMode: "cover"
  },
  heroDiagnosisMeta: {
    flex: 1,
    justifyContent: "center"
  },
  metaLabel: {
    fontSize: 12,
    color: "#777",
    fontWeight: "600"
  },
  metaValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
    marginVertical: 2
  },
  metaProgressBar: {
    height: 6,
    backgroundColor: "#E8F5E9",
    borderRadius: 3,
    marginVertical: 4,
    width: "80%"
  },
  metaProgressFill: {
    height: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 3
  },
  metaActions: {
    flexDirection: "row",
    marginTop: 6
  },
  metaActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4
  },
  metaActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32"
  },

  // Diagnosis details cards
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10
  },
  detailCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: "#F9FBF9",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8F5E9"
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: "700"
  },
  detailContent: {
    fontSize: 11,
    color: "#555",
    lineHeight: 16
  },

  // Chat Message Panel
  chatScrollView: {
    flex: 1,
    backgroundColor: "#F4F8F4"
  },
  chatContentContainer: {
    padding: 16,
    paddingBottom: 24
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    width: "100%"
  },
  userMessageRow: {
    justifyContent: "flex-end"
  },
  assistantMessageRow: {
    justifyContent: "flex-start"
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 4
  },
  msgBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  userBubble: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 2
  },
  assistantBubble: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 2
  },
  errorBubble: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2"
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  typingText: {
    fontSize: 12,
    color: "#777",
    fontStyle: "italic"
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19
  },
  userMsgText: {
    color: "#1A2E1A"
  },
  assistantMsgText: {
    color: "#333"
  },
  msgTime: {
    fontSize: 9,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 4
  },
  msgActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F4F8F4",
    marginTop: 8,
    paddingTop: 6,
    justifyContent: "flex-end",
    gap: 12
  },
  bubbleAction: {
    padding: 2
  },

  // Input Box styling
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E8F5E9"
  },
  inputActionBtn: {
    padding: 8
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F4F8F4",
    borderRadius: 20,
    paddingHorizontal: 16,
    color: "#333",
    fontSize: 14,
    marginHorizontal: 8
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center"
  },
  sendBtnDisabled: {
    backgroundColor: "#A5D6A7"
  },

  // Modal History sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  historySheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    paddingTop: 16,
    paddingHorizontal: 16
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B5E20"
  },
  emptyHistory: {
    alignItems: "center",
    paddingVertical: 40
  },
  emptyText: {
    marginTop: 10,
    color: "#888",
    fontSize: 14
  },
  historyItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#F9FBF9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8F5E9"
  },
  historyItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  },
  historyThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12
  },
  historyCrop: {
    fontSize: 11,
    color: "#777",
    fontWeight: "600"
  },
  historyDisease: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B5E20"
  },
  historyDate: {
    fontSize: 10,
    color: "#999",
    marginTop: 2
  },
  deleteHistoryBtn: {
    padding: 16
  },

  // Toggle Tab Bar
  toggleTabBar: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    padding: 3
  },
  toggleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6
  },
  toggleTabActive: {
    backgroundColor: "#2E7D32"
  },
  toggleTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555"
  },
  toggleTabTextActive: {
    color: "#fff",
    fontWeight: "700"
  },

  // Report Scroll
  reportScroll: {
    flex: 1,
    paddingHorizontal: 16
  },
  reportScrollContent: {
    paddingBottom: 24
  },
  reportOverview: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8F5E9",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  overviewItem: {
    flex: 1,
    paddingRight: 8
  },
  overviewLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  overviewValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "700",
    marginTop: 4
  },
  switchToChatPromo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#C8E6C9"
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B5E20"
  },
  promoDesc: {
    fontSize: 11,
    color: "#2E7D32",
    marginTop: 2
  },

  // Chat Context Header
  chatHeaderContext: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE082"
  },
  chatContextText: {
    fontSize: 12,
    color: "#F57C00",
    fontWeight: "600"
  }
});
