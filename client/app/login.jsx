import React, { useState, useEffect } from 'react';
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
  ActivityIndicator
} from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { URL } from '../App';
import { useGoogleAuthPrompt, processGoogleAuthResponse } from '../src/services/firebase';

const successMsg = (message) => {
  Toast.show({ type: 'success', text1: 'Success', text2: message });
};
const errorMsg = (message) => {
  Toast.show({ type: 'error', text1: 'Error', text2: message });
};
const infoMsg = (message) => {
  Toast.show({ type: 'info', text1: 'Cancelled', text2: message });
};

const KrishiMittraLoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
      infoMsg('Google Sign-In was cancelled.');
      setGoogleLoading(false);
      return;
    }

    // Any other non-success response (error, locked, etc.)
    if (googleResponse.type !== 'success') {
      errorMsg(`Google Sign-In failed (${googleResponse.type}). Please try again.`);
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
          successMsg('Google Sign-In successful!');
          await AsyncStorage.setItem('token', response.data.token);
          await AsyncStorage.setItem('name', response.data.user.name);
          await AsyncStorage.setItem('userId', response.data.user._id);
          await AsyncStorage.setItem('state', response.data.user.state || 'India');
          await AsyncStorage.setItem('district', response.data.user.district || 'General');

          setTimeout(() => {
            Router.push('/Home');
          }, 1200);
        }
      } catch (e) {
        const msg = e.response?.data?.message || e.message || 'Google Sign-In failed. Please try again.';
        errorMsg(msg);
        console.error('Google Sign-In Error:', e);
      } finally {
        setGoogleLoading(false);
      }
    };

    handleGoogleResponse();
  }, [googleResponse]);

  // ── Phone / Password Login ─────────────────────────────────────────────
  const handleLogin = async () => {
    if (!phone || !password) {
      errorMsg('Please fill all fields!');
      return;
    }
    setLoading(true);
    try {
      const data = { phone, password };
      setPhone('');
      setPassword('');
      const response = await axios.post(`${URL}/api/main/login`, data);

      if (response.data) {
        successMsg('Login successfully.');
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('name', response.data.user.name);
        await AsyncStorage.setItem('userId', response.data.user._id);
        await AsyncStorage.setItem('phone', response.data.user.phone);
        await AsyncStorage.setItem('state', response.data.user.state);
        await AsyncStorage.setItem('district', response.data.user.district);

        setLoading(false);
        setTimeout(() => {
          Router.push('/Home');
        }, 1500);
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'An error occurred. Please try again.';
      errorMsg(msg);
      setLoading(false);
      setPhone('');
      setPassword('');
      console.error('Login Error:', e);
    }
  };

  // ── Google Sign-In trigger ─────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (!isGoogleConfigured) {
      errorMsg(
        'Google Sign-In is not configured. Please add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env.local'
      );
      return;
    }
    setGoogleLoading(true);
    try {
      await googlePrompt();
      // actual result handled in the useEffect above
    } catch (e) {
      errorMsg('Could not open Google Sign-In. Please try again.');
      setGoogleLoading(false);
    }
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
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 10 }}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#6c757d" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => Router.push('/ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* --- Divider --- */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* --- Google Sign-In --- */}
          <TouchableOpacity
            style={[styles.googleButton, !isGoogleConfigured && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#555" />
            ) : (
              <>
                <Image
                  source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>
                  {isGoogleConfigured ? 'Continue with Google' : 'Google (Not Configured)'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!isGoogleConfigured && (
            <Text style={styles.configHint}>
              ⚠️ Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env.local to enable Google Sign-In
            </Text>
          )}

          {/* --- Sign Up Link --- */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => Router.push('/signUp')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
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
  title: {
    fontSize: 30,
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
  googleButtonDisabled: {
    opacity: 0.5,
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
  configHint: {
    textAlign: 'center',
    color: '#e17055',
    fontSize: 12,
    marginTop: 8,
    paddingHorizontal: 10,
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
