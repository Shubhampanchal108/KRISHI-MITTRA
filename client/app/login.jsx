import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

import axios from 'axios';
import {URL} from '@/App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { successMsg, errorMsg } from '../src/utils/Notification';


const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const Router = useRouter();

  // Function to handle the login button press
    const handleLogin = async () => {
  if (!phone || !password) {
    errorMsg("Please fill all fields!");
    return;
  }

  try {
    const data = {phone, password}
    const response = await axios.post(`${URL}/api/main/login`, data);

    if (response.data) {
      successMsg("Login successfully.");

      setPhone("");
      setPassword("");

      AsyncStorage.setItem('token', response.data.token);
      AsyncStorage.setItem('name', response.data.user.name);
      AsyncStorage.setItem('userId', response.data.user._id);
      AsyncStorage.setItem('phone', response.data.user.phone);
      AsyncStorage.setItem('state', response.data.user.state);
      AsyncStorage.setItem('district', response.data.user.district);

      setTimeout(() => {
        Router.push('/Home')
      }, 2000);

    }
  } catch (e) {
    const msg = e.response?.data?.message || "Internal Server Error.";
    errorMsg(msg);
    console.log(e);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back! 👋</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Phone Input */}
        <TextInput
          style={styles.input}
          placeholder="phone no"
          placeholderTextColor="#888"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry // This hides the password characters
        />

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => Router.push('/signUp')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast/>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#aaa',
    fontSize: 14,
  },
  signupText: {
    color: 'green',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Login;