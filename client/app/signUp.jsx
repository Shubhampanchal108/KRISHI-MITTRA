import React, { useState } from "react";
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
import Feather from "react-native-vector-icons/Feather";
import axios from "axios";
import Toast from "react-native-toast-message";
import { URL } from "@/App";
import { successMsg, errorMsg } from "../src/utils/Notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// --- Main App Component ---
export default function App() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const Router = useRouter();

  //handle signup logic here
  const handleSignup = async () => {
    if (!name || !phone || !state || !district || !password) {
      errorMsg("Please fill all fields!");
      return;
    }
    setLoading(true);
    try {
      const data = { name, phone, state, district, password };
      setDistrict("");
      setName("");
      setPhone("");
      setPassword("");
      setState("");
      const response = await axios.post(`${URL}/api/main/signup`, data);

      if (response.data) {
        successMsg("SignUp successfully.");

        AsyncStorage.setItem("token", response.data.token);
        AsyncStorage.setItem("name", response.data.user.name);
        AsyncStorage.setItem("userId", response.data.user._id);
        AsyncStorage.setItem("phone", response.data.user.phone);
        AsyncStorage.setItem("state", response.data.user.state);
        AsyncStorage.setItem("district", response.data.user.district);
        setLoading(false);
        successMsg("SignUp successfully");

        setTimeout(() => {
          Router.push("/Home");
        }, 2000);
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Internal Server Error.";
      errorMsg(msg);
      setLoading(false);
      setName("");
      setPassword("");
      setPhone("");
      setState("");
      setDistrict("");
      console.log(e);
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

          {/* In a real app, these would likely be dropdowns/pickers */}
          <View style={styles.inputWrapper}>
            <Feather
              name="map-pin"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              placeholderTextColor="#888"
              value={state}
              onChangeText={setState}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Feather
              name="map-pin"
              size={20}
              color="#666"
              style={styles.icon}
            />
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
              secureTextEntry
            />
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

          <TouchableOpacity style={styles.googleButton}>
            <Image
              source={{
                uri: "https://developers.google.com/identity/images/g-logo.png",
              }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
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
    color: "#2e7d32", // A pleasant green color
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
    // marginRight: 10,
  },
});
