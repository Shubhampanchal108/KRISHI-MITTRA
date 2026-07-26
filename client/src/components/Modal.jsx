import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import axios from "axios";
import { errorMsg, successMsg } from "../utils/Notification";
import { URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

const FeedbackModal = ({ visible, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;

  const MAX_CHARS = 500;

  useEffect(() => {
    if (visible) {
      setSubmitted(false);
      setFeedback("");
      setCharCount(0);
      successAnim.setValue(0);
      checkScaleAnim.setValue(0);
      // Entry animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height * 0.3,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleFeedbackChange = (text) => {
    if (text.length <= MAX_CHARS) {
      setFeedback(text);
      setCharCount(text.length);
    }
  };

  const showSuccessAnimation = () => {
    setSubmitted(true);
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(checkScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        onClose();
      }, 1500);
    });
  };

  const handleSubmit = async () => {
    if (feedback.trim() === "") return;

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const data = { userId, feedback };
      const response = await axios.post(`${URL}/api/main/feedback/add`, data);

      if (response.data) {
        successMsg("Your Feedback is sent to admins.");
        setLoading(false);
        showSuccessAnimation();
      }
    } catch (e) {
      console.log(e);
      setFeedback("");
      setLoading(false);
      errorMsg("Something went wrong.");
    }
  };

  const charProgress = charCount / MAX_CHARS;
  const charColor =
    charProgress > 0.9
      ? "#EF4444"
      : charProgress > 0.7
      ? "#F59E0B"
      : "#22C55E";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Modal Card */}
        <Animated.View
          style={[
            styles.modalWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Decorative drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Text style={styles.headerIcon}>🌾</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Share Your Feedback</Text>
              <Text style={styles.subtitle}>
                Help us grow better for farmers
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeIconBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {submitted ? (
            /* ── Success State ── */
            <Animated.View
              style={[styles.successContainer, { opacity: successAnim }]}
            >
              <Animated.View
                style={[
                  styles.successCircle,
                  { transform: [{ scale: checkScaleAnim }] },
                ]}
              >
                <Text style={styles.successCheck}>✓</Text>
              </Animated.View>
              <Text style={styles.successTitle}>Thank You!</Text>
              <Text style={styles.successSubtitle}>
                Your feedback has been sent to our team.
              </Text>
            </Animated.View>
          ) : (
            /* ── Form State ── */
            <View style={styles.formContainer}>
              {/* Label */}
              <Text style={styles.inputLabel}>Your Message</Text>

              {/* Textarea */}
              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Share your thoughts, suggestions or issues..."
                  placeholderTextColor="#A8B5A0"
                  multiline
                  numberOfLines={5}
                  value={feedback}
                  onChangeText={handleFeedbackChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  textAlignVertical="top"
                />
                {/* Character counter bar */}
                <View style={styles.charRow}>
                  <View style={styles.charBarTrack}>
                    <View
                      style={[
                        styles.charBarFill,
                        {
                          width: `${charProgress * 100}%`,
                          backgroundColor: charColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.charCount, { color: charColor }]}>
                    {charCount}/{MAX_CHARS}
                  </Text>
                </View>
              </View>

              {/* Quick suggestion chips */}
              <Text style={styles.chipLabel}>Quick Tags</Text>
              <View style={styles.chipRow}>
                {["🐛 Bug Report", "💡 Suggestion", "👍 Praise", "🎨 UI Issue"].map(
                  (chip) => (
                    <TouchableOpacity
                      key={chip}
                      style={styles.chip}
                      onPress={() =>
                        handleFeedbackChange(
                          feedback
                            ? `${feedback} ${chip}`
                            : `${chip} `
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chipText}>{chip}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    feedback.trim() === "" && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading || feedback.trim() === ""}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View style={styles.submitInner}>
                      <Text style={styles.submitText}>Send Feedback</Text>
                      <Text style={styles.submitArrow}>→</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
      <Toast />
    </Modal>
  );
};

export default FeedbackModal;

const styles = StyleSheet.create({
  /* ── Backdrop ── */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 30, 15, 0.65)",
  },

  /* ── Modal Card ── */
  modalWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 20,
    overflow: "hidden",
  },

  /* ── Drag Handle ── */
  dragHandle: {
    height: 4,
    width: 44,
    backgroundColor: "#D1D5DB",
    borderRadius: 4,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
  },
  headerIcon: { fontSize: 22 },
  headerTextContainer: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#14532D",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIconText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 20,
  },

  /* ── Form ── */
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: "#22C55E",
    backgroundColor: "#FFFFFF",
    shadowColor: "#22C55E",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    fontSize: 15,
    color: "#1F2937",
    minHeight: 100,
    lineHeight: 22,
  },
  charRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  charBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  charBarFill: {
    height: 3,
    borderRadius: 2,
  },
  charCount: {
    fontSize: 11,
    fontWeight: "600",
  },

  /* ── Chips ── */
  chipLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
  },

  /* ── Buttons ── */
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#5fa983ff",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  submitArrow: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* ── Success State ── */
  successContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  successCheck: {
    fontSize: 38,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#14532D",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
