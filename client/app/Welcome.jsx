import React from "react";
import { View, Text, Image, StyleSheet} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.jpeg")} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Krishi Mittra</Text>
        {/* <Text style={styles.welcomeText}>Welcome to Krishi Mittra</Text> */}
        <Text style={styles.tagline}>
          Smart Farming || Smarter Future 🌾
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.developedBy}>Developed by Shubham 👨‍💻</Text>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9f3",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: "center",
    
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "green"
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 20,
    color: "#388e3c",
    fontWeight: "600",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#4caf50",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  footer: {
    alignItems: "center",
  },
  developedBy: {
    fontSize: 18,
    color: "#388e3c",
    fontWeight: 'bold'
  },
});
