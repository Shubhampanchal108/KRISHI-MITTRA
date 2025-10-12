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
  ScrollView,
} from 'react-native';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          {/* App Logo */}
          {/* <Image
            source={require('../assets/agrimate-logo.png')}
            style={styles.logo}
          /> */}

          {/* Title */}
          <Text style={styles.title}>Create Account 🌿</Text>
          <Text style={styles.subtitle}>Krishi Mittra || Grow smarter!</Text>

          {/* Full Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={setName}
          />

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Mobile"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />

          

          {/* State */}
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
          />

          {/* District */}
          <TextInput
            style={styles.input}
            placeholder="District"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Confirm Password Input */}
          {/* <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#6b7280"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          /> */}

          {/* Signup Button */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  innerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    // shadowColor: 'green',
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 6,
  },
  logo: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#16A34A',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Signup;
