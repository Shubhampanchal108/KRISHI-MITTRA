import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';

// Third-party libraries for functionality
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import {URL} from "../App"


const successMsg = (message) => {
  Toast.show({ type: 'success', text1: 'Success', text2: message });
};
const errorMsg = (message) => {
  Toast.show({ type: 'error', text1: 'Error', text2: message });
};

const KrishiMittraLoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const Router = useRouter();

  // Function to handle the login button press with API call
  const handleLogin = async () => {
    if (!phone || !password) {
      errorMsg("Please fill all fields!");
      return;
    }

    try {
      const data = { phone, password };
      const response = await axios.post(`${URL}/api/main/login`, data);

      if (response.data) {
        successMsg("Login successfully.");
        
        // Store user data and token
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('name', response.data.user.name);
        await AsyncStorage.setItem('userId', response.data.user._id);
        await AsyncStorage.setItem('phone', response.data.user.phone);
        await AsyncStorage.setItem('state', response.data.user.state);
        await AsyncStorage.setItem('district', response.data.user.district);
        
        setPhone("");
        setPassword("");

        // Navigate to Home screen after a short delay
        setTimeout(() => {
          Router.push('/Home');
        }, 1500);
      }
    } catch (e) {
      const msg = e.response?.data?.message || "An error occurred. Please try again.";
      errorMsg(msg);
      console.error("Login Error:", e);
    }
  };
  
  const handleGoogleSignIn = () => {
      // Logic for Google Sign-In would go here
      Alert.alert('Google Sign-In', 'This would launch the Google Sign-In flow.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f2" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* --- Header Section --- */}
          <View style={styles.header}>
            {/* <AppLogo /> */}
            <Text style={styles.title}>Krishi Mittra</Text>
            <Text style={styles.subtitle}>Welcome back! Please login to your account.</Text>
          </View>

          {/* --- Form Section --- */}
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Feather name="phone" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#6c757d"
                keyboardType="phone-pad"
                autoCapitalize="none"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6c757d"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity onPress={() => Router.push('/forgot-password')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
          
          {/* --- Divider --- */}
          <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
          </View>
          
          {/* --- Social Login --- */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
             <Image source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} style={styles.googleIcon} />
             <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* --- Sign Up Link --- */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => Router.push('/signUp')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast/>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6ff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 38,
  },
  logoContainer: {
      marginBottom: 12,
  },
  logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
  },
  title: {
    fontSize: 30,
    // fontWeight: 'bold',
    color: 'green',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ced4da',
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  inputIcon: {
      marginRight: 10,
  },
  input: {
    flex: 1,
    height: 60,
    fontSize: 16,
    color: '#212529',
  },
  forgotPasswordText: {
    textAlign: 'right',
    color: '#16A34A',
    fontWeight: '400',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
  },
  dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#ced4da',
  },
  dividerText: {
      marginHorizontal: 10,
      color: '#6c757d',
      fontWeight: '600',
  },
  googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      paddingVertical: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#ced4da',
  },
  googleIcon: {
      width: 28,
      height: 28,
      marginRight: 12,
  },
  googleButtonText: {
      color: '#212529',
      fontSize: 14,
      fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    fontSize: 14,
    color: '#6c757d',
  },
  signupLink: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: 'bold',
  },
});

export default KrishiMittraLoginScreen;

