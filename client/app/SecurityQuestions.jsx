import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Toast from "react-native-toast-message";
import { URL } from "@/App";
import { successMsg, errorMsg } from "../src/utils/Notification";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SECURITY_QUESTIONS = [
  "What is your primary crop?",
  "What is your birthplace / hometown?",
  "What is your favorite pet's name?",
  "What is your mother's maiden name?",
  "What is the name of your farm or village?",
];

// ─────────── Screen Modes ───────────
// "loading"   → fetching existing data
// "view"      → user has a question set; show it read-only
// "confirm"   → asking user to confirm they want to edit
// "edit"      → form to set / update the question
// "setup"     → first-time setup (no question yet) – same UI as edit

export default function SecurityQuestionsScreen() {
  const Router = useRouter();
  const { userId: paramUserId } = useLocalSearchParams();

  const [userId, setUserId] = useState(paramUserId || null);
  const [mode, setMode] = useState("loading");

  // Existing question data (from server)
  const [existingQuestion, setExistingQuestion] = useState("");

  // Form state for edit / setup
  const [selectedQuestion, setSelectedQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  // Confirmation modal visibility
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // ── Resolve userId if not passed as param ──────────────────────────────
  useEffect(() => {
    const resolveUserId = async () => {
      if (paramUserId) {
        setUserId(paramUserId);
        return;
      }
      try {
        const stored = await AsyncStorage.getItem("userId");
        if (stored) setUserId(stored);
      } catch (_) {}
    };
    resolveUserId();
  }, [paramUserId]);

  // ── Fetch existing security question when userId is known ──────────────
  const fetchSecurityQuestion = useCallback(async () => {
    if (!userId) return;
    setMode("loading");
    try {
      const { data } = await axios.get(
        `${URL}/api/main/user-security-question/${userId}`
      );
      if (data.hasAnswer) {
        setExistingQuestion(data.securityQuestion);
        setSelectedQuestion(data.securityQuestion);
        setMode("view");
      } else {
        // No answer set yet → first-time setup
        setMode("setup");
      }
    } catch (e) {
      console.error("Fetch security question error:", e);
      // Fall back to setup mode on error
      setMode("setup");
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchSecurityQuestion();
  }, [userId, fetchSecurityQuestion]);

  // ── Save / Update ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!securityAnswer.trim()) {
      errorMsg("Please enter your answer to the security question!");
      return;
    }
    if (!userId) {
      errorMsg("User session not found. Please log in again.");
      return;
    }

    setSaving(true);
    try {
      await axios.put(`${URL}/api/main/update-security-question/${userId}`, {
        securityQuestion: selectedQuestion,
        securityAnswer,
      });

      setExistingQuestion(selectedQuestion);
      setSecurityAnswer("");
      setSaving(false);

      successMsg(
        mode === "setup"
          ? "Security question saved successfully!"
          : "Security question updated successfully!"
      );

      setTimeout(() => {
        // If came from signup flow (param userId), go to Home; else go back
        if (paramUserId) {
          Router.replace("/Home");
        } else {
          setMode("view");
        }
      }, 1200);
    } catch (e) {
      const msg =
        e.response?.data?.message || "Could not save. Please try again.";
      errorMsg(msg);
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (paramUserId) {
      Router.replace("/Home");
    } else {
      Router.back();
    }
  };

  const handleEditConfirmed = () => {
    setConfirmModalVisible(false);
    setSecurityAnswer("");
    setMode("edit");
  };

  // ─────────────── Render helpers ───────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.iconWrapper}>
      <Feather name="shield" size={36} color="#2e7d32" />
    </View>
  );

  // ── VIEW mode: existing question displayed read-only ───────────────────
  const renderViewMode = () => (
    <View style={styles.container}>
      {renderHeader()}
      <Text style={styles.title}>Security Question</Text>
      <Text style={styles.subtitle}>
        Your security question is used to recover your account if you forget
        your password.
      </Text>

      {/* Existing question card */}
      <View style={styles.existingCard}>
        <View style={styles.existingCardHeader}>
          <Ionicons name="shield-checkmark" size={18} color="#2e7d32" />
          <Text style={styles.existingCardLabel}>Active Security Question</Text>
        </View>
        <Text style={styles.existingQuestionText}>{existingQuestion}</Text>
        <View style={styles.answerMaskedRow}>
          <Feather name="lock" size={14} color="#999" />
          <Text style={styles.answerMaskedText}>
            Answer hidden for security
          </Text>
        </View>
      </View>

      {/* Edit button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setConfirmModalVisible(true)}
        activeOpacity={0.85}
      >
        <Feather name="edit-2" size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.editButtonText}>Change Security Question</Text>
      </TouchableOpacity>

      {/* Back button for profile navigation */}
      {!paramUserId && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => Router.back()}
          activeOpacity={0.75}
        >
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      )}

      {/* Edit confirmation modal */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIconBox}>
              <Feather name="alert-triangle" size={28} color="#e65100" />
            </View>
            <Text style={styles.confirmTitle}>Change Security Question?</Text>
            <Text style={styles.confirmBody}>
              You already have a security question set. Changing it will
              replace your existing question and answer. Are you sure?
            </Text>
            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setConfirmModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Keep Existing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.proceedBtn}
                onPress={handleEditConfirmed}
                activeOpacity={0.85}
              >
                <Text style={styles.proceedBtnText}>Yes, Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  // ── EDIT / SETUP mode: form to pick question + enter answer ────────────
  const renderFormMode = () => (
    <View style={styles.container}>
      {renderHeader()}
      <Text style={styles.title}>
        {mode === "setup" ? "Security Setup" : "Update Security Question"}
      </Text>
      <Text style={styles.subtitle}>
        {mode === "setup"
          ? "Set a security question to help recover your account if you forget your password."
          : "Choose a new security question and provide your answer."}
      </Text>

      {/* If editing, show what was previously set */}
      {mode === "edit" && existingQuestion ? (
        <View style={styles.currentQuestionBanner}>
          <Feather name="info" size={14} color="#1565c0" style={{ marginRight: 6 }} />
          <Text style={styles.currentQuestionBannerText} numberOfLines={2}>
            Current: {existingQuestion}
          </Text>
        </View>
      ) : null}

      {/* Question Picker */}
      <Text style={styles.sectionLabel}>Choose a security question:</Text>
      <View style={styles.questionPickerBox}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SECURITY_QUESTIONS.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.questionPill,
                selectedQuestion === q && styles.questionPillActive,
              ]}
              onPress={() => setSelectedQuestion(q)}
            >
              <Text
                style={[
                  styles.questionPillText,
                  selectedQuestion === q && styles.questionPillTextActive,
                ]}
              >
                {q}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected question display */}
      <View style={styles.selectedQuestion}>
        <Feather
          name="help-circle"
          size={16}
          color="#2e7d32"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.selectedQuestionText}>{selectedQuestion}</Text>
      </View>

      {/* Answer Input */}
      <Text style={styles.sectionLabel}>Your Answer:</Text>
      <View style={styles.inputWrapper}>
        <Feather name="edit-2" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="e.g. Wheat / Jaipur / Buddy"
          placeholderTextColor="#888"
          value={securityAnswer}
          onChangeText={setSecurityAnswer}
          autoCapitalize="none"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {mode === "setup" ? "Save & Continue" : "Update Question"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Cancel / Skip */}
      {mode === "edit" ? (
        <TouchableOpacity
          onPress={() => {
            setSecurityAnswer("");
            setMode("view");
          }}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Cancel</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>
            {paramUserId ? "Skip for now" : "← Go Back"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ── LOADING mode ───────────────────────────────────────────────────────
  const renderLoading = () => (
    <View style={[styles.container, { justifyContent: "center", alignItems: "center", paddingTop: 60 }]}>
      <ActivityIndicator size="large" color="#2e7d32" />
      <Text style={{ marginTop: 14, color: "#666", fontSize: 14 }}>
        Loading security details…
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {mode === "loading" && renderLoading()}
        {mode === "view" && renderViewMode()}
        {(mode === "edit" || mode === "setup") && renderFormMode()}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#f6f6f6",
  },
  container: {
    width: "90%",
    maxWidth: 420,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  iconWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#4caf50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  // ── Existing question card (view mode) ──────────────────────────────
  existingCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#a5d6a7",
    elevation: 3,
    shadowColor: "#4caf50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  existingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  existingCardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2e7d32",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  existingQuestionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
    lineHeight: 22,
  },
  answerMaskedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  answerMaskedText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },

  // ── Edit button ─────────────────────────────────────────────────────
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#2e7d32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  backButton: {
    paddingVertical: 10,
  },
  backButtonText: {
    color: "#888",
    fontSize: 13,
    textDecorationLine: "underline",
  },

  // ── Confirmation Modal ──────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  confirmModal: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  confirmIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  confirmBody: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },
  confirmBtnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  proceedBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#e65100",
    alignItems: "center",
  },
  proceedBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  // ── Current question banner (edit mode) ────────────────────────────
  currentQuestionBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#1e88e5",
  },
  currentQuestionBannerText: {
    fontSize: 12,
    color: "#1565c0",
    flex: 1,
    lineHeight: 18,
    fontWeight: "500",
  },

  // ── Form (edit / setup) ────────────────────────────────────────────
  sectionLabel: {
    alignSelf: "flex-start",
    fontSize: 13,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 10,
  },
  questionPickerBox: {
    width: "100%",
    marginBottom: 12,
  },
  questionPill: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
    elevation: 1,
  },
  questionPillActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#2e7d32",
    elevation: 2,
  },
  questionPillText: {
    fontSize: 12,
    color: "#555",
  },
  questionPillTextActive: {
    color: "#2e7d32",
    fontWeight: "700",
  },
  selectedQuestion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
    marginBottom: 20,
  },
  selectedQuestionText: {
    fontSize: 13,
    color: "#2e7d32",
    fontWeight: "600",
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    elevation: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    width: "100%",
    backgroundColor: "#4caf50",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#4caf50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    color: "#999",
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
