import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { URL } from "../App";
import { successMsg, errorMsg } from "../src/utils/Notification";

const SECURITY_QUESTIONS = [
  "What is your primary crop?",
  "What is your birthplace / hometown?",
  "What is your favorite pet's name?",
  "What is your mother's maiden name?",
  "What is the name of your farm or village?",
];

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Identify, 2: Security Answer & Reset Password
  const [identifier, setIdentifier] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Fetch security question for identifier
  const handleFetchQuestion = async () => {
    if (!identifier.trim()) {
      errorMsg("Please enter your Phone Number or Email!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${URL}/api/main/get-security-question`, {
        identifier: identifier.trim(),
      });

      if (response.data && response.data.securityQuestion) {
        setSecurityQuestion(response.data.securityQuestion);
        setStep(2);
        successMsg("Account found. Please answer your security question.");
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Account not found with this Phone/Email.";
      errorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify answer and reset password
  const handleResetPassword = async () => {
    if (!securityAnswer.trim()) {
      errorMsg("Please enter your security answer!");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      errorMsg("Password must be at least 6 characters long!");
      return;
    }
    if (newPassword !== confirmPassword) {
      errorMsg("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        identifier: identifier.trim(),
        securityAnswer: securityAnswer.trim(),
        newPassword: newPassword,
      };

      const response = await axios.post(`${URL}/api/main/reset-password`, payload);

      if (response.data) {
        successMsg("Password reset successfully! Please log in.");
        setTimeout(() => {
          router.replace("/login");
        }, 1500);
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Verification failed. Check your answer.";
      errorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f6f6" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {/* Top Header */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#2E7D32" />
            <Text style={styles.backBtnText}> Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Feather name="key" size={32} color="#2E7D32" />
            </View>
            <Text style={styles.title}>Password Recovery</Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? "Enter your Phone Number or Email to find your security question."
                : "Answer your security question to set a new password."}
            </Text>
          </View>

          {/* Form Content */}
          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={20} color="#6c757d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number or Email"
                  placeholderTextColor="#6c757d"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.actionButton} onPress={handleFetchQuestion} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Find Account</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              {/* Question Badge */}
              <View style={styles.questionCard}>
                <Text style={styles.questionLabel}>Security Question:</Text>
                <Text style={styles.questionText}>"{securityQuestion}"</Text>
              </View>

              <View style={styles.inputWrapper}>
                <Feather name="help-circle" size={20} color="#6c757d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your Security Answer"
                  placeholderTextColor="#6c757d"
                  value={securityAnswer}
                  onChangeText={setSecurityAnswer}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Feather name="lock" size={20} color="#6c757d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#6c757d"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Feather name="check-circle" size={20} color="#6c757d" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#6c757d"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <TouchableOpacity style={styles.actionButton} onPress={handleResetPassword} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.changeAccountLink} onPress={() => setStep(1)}>
                <Text style={styles.changeAccountText}>Use a different Phone/Email</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 20,
    left: 20,
    zIndex: 10,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E7D32",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 40,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2E7D32",
  },
  subtitle: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  form: {
    width: "100%",
  },
  questionCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  questionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1B5E20",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  questionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E7D32",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 54,
    fontSize: 15,
    color: "#212529",
  },
  actionButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    marginTop: 6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  changeAccountLink: {
    marginTop: 18,
    alignItems: "center",
  },
  changeAccountText: {
    fontSize: 13,
    color: "#666",
    textDecorationLine: "underline",
  },
});

export default ForgotPasswordScreen;
