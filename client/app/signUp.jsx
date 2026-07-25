import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import Toast from "react-native-toast-message";
import { URL } from "@/App";
import { successMsg, errorMsg, infoMsg } from "../src/utils/Notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useGoogleAuthPrompt, processGoogleAuthResponse } from "../src/services/firebase";

// --- Main App Component ---
export default function App() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const Router = useRouter();

  // ── Real Google OAuth hook ─────────────────────────────────────────────
  const [googlePrompt, isGoogleConfigured, googleResponse] = useGoogleAuthPrompt();

  // Process Google response when it changes
  useEffect(() => {
    if (!googleResponse) return;

    // User dismissed / cancelled the Google sign-in sheet
    if (googleResponse.type === 'cancel' || googleResponse.type === 'dismiss') {
      infoMsg('Cancelled', 'Google Sign-Up was cancelled.');
      setGoogleLoading(false);
      return;
    }

    // Any other non-success response (error, locked, etc.)
    if (googleResponse.type !== 'success') {
      errorMsg('Error', `Google Sign-Up failed (${googleResponse.type}). Please try again.`);
      setGoogleLoading(false);
      return;
    }

    const handleGoogleResponse = async () => {
      setGoogleLoading(true);
      try {
        const userProfile = await processGoogleAuthResponse(googleResponse);

        const payload = {
          name: userProfile.name,
          email: userProfile.email,
          googleId: userProfile.googleId,
          picture: userProfile.photoUrl,
        };

        const response = await axios.post(`${URL}/api/main/google-login`, payload);

        if (response.data && response.data.token) {
          successMsg('Success', 'Google Sign-Up successful!');
          await AsyncStorage.setItem("token", response.data.token);
          await AsyncStorage.setItem("name", response.data.user.name);
          await AsyncStorage.setItem("userId", response.data.user._id);
          await AsyncStorage.setItem("state", response.data.user.state || "India");
          await AsyncStorage.setItem("district", response.data.user.district || "General");

          setTimeout(() => {
            Router.push("/Home");
          }, 1200);
        }
      } catch (e) {
        const msg = e.response?.data?.message || e.message || "Google Sign-Up failed. Please try again.";
        errorMsg('Error', msg);
        console.error("Google Sign-Up Error:", e);
      } finally {
        setGoogleLoading(false);
      }
    };

    handleGoogleResponse();
  }, [googleResponse]);

// handle signup logic
  const handleSignup = async () => {
    if (!name || !phone || !state || !district || !password) {
      errorMsg("Please fill all fields!");
      return;
    }
    if (phone.trim().length < 10) {
      errorMsg("Mobile number should not be less than 10 digits!");
      return;
    }
    setLoading(true);
    try {
      // Validate state and district via LLM endpoint first
      const validationResponse = await axios.post(`${URL}/api/main/validate-location`, {
        state: state.trim(),
        district: district.trim(),
      });

      if (validationResponse.data?.status !== "valid") {
        errorMsg("Please enter a valid State and District of India.");
        setLoading(false);
        return;
      }

      const data = {
        name,
        phone,
        state,
        district,
        password,
      };

      const response = await axios.post(`${URL}/api/main/signup`, data);

      if (response.data) {
        successMsg("SignUp successfully.");

        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("name", response.data.user.name);
        await AsyncStorage.setItem("userId", response.data.user._id);
        await AsyncStorage.setItem("phone", response.data.user.phone);
        await AsyncStorage.setItem("state", response.data.user.state);
        await AsyncStorage.setItem("district", response.data.user.district);
        
        // Clear fields on success
        setDistrict("");
        setName("");
        setPhone("");
        setPassword("");
        setState("");
        setShowPassword(false);
        setLoading(false);

        // Redirect to SecurityQuestions screen after successful signup
        setTimeout(() => {
          Router.push(`/SecurityQuestions?userId=${response.data.user._id}`);
        }, 1000);
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Internal Server Error.";
      errorMsg(msg);
      setLoading(false);
    }
  };

  // Google Sign-Up trigger
  const handleGoogleSignUp = async () => {
    if (!isGoogleConfigured) {
      errorMsg("Google Sign-In is not configured. Please add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env.local");
      return;
    }
    setGoogleLoading(true);
    try {
      await googlePrompt();
      // result handled in useEffect above
    } catch (e) {
      errorMsg("Could not open Google Sign-In. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Krishi Mittra</Text>
          <Text style={styles.subtitle}>Create your account</Text>

          {/* Input Fields */}
          <View style={styles.inputWrapper}>
            <Feather name="user" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Feather name="phone" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Feather name="map-pin" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="State"
              placeholderTextColor="#888"
              value={state}
              onChangeText={setState}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Feather name="map-pin" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="District"
              placeholderTextColor="#888"
              value={district}
              onChangeText={setDistrict}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Feather name="lock" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 10 }}>
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
            </TouchableOpacity>
          </View>

{/* Buttons */}
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            {loading ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp} disabled={googleLoading}>
            {googleLoading ? (
              <ActivityIndicator size="small" color="#555" />
            ) : (
              <>
                <Image
                  source={{
                    uri: "https://developers.google.com/identity/images/g-logo.png",
                  }}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => Router.push("/login")}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f6f6f6ff",
  },
  container: {
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#f6f6f6ff",
    borderRadius: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    marginBottom: 15,
    paddingHorizontal: 15,
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
  signupButton: {
    width: "100%",
    backgroundColor: "#4caf50",
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#888",
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  googleButtonText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "bold",
  },
  googleIcon: {
    width: 28,
    height: 28,
  },
});
