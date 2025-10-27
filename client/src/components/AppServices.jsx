import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from 'expo-router';

const AgriAISupport = () => {
  const Router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Krishi Mittra Services</Text>

      <View style={styles.cardContainer}>
        {/* Chat Card */}
        <TouchableOpacity style={styles.card} onPress={()=>Router.push("/ChatBot")}>
          <Image source={require("../../assets/images/chat.png")} style={styles.icon} />
          <Text style={styles.title}>Chat</Text>
          <Text style={styles.subtitle}>Get instant farming advice</Text>
        </TouchableOpacity>

        {/* Disease Scanner Card */}
        <TouchableOpacity style={styles.card} onPress={()=>Router.push("/Pest")}>
          <Image source={require("../../assets/images/scanner.png")} style={styles.icon} />
          <Text style={styles.title}>Disease Scanner</Text>
          <Text style={styles.subtitle}>Identify plant problems</Text>
        </TouchableOpacity>

        {/* Smart Recommendations Card */}
        <TouchableOpacity style={styles.card} onPress={()=>Router.push('/MarektPrice')}>
          <Image source={require("../../assets/images/MarketLogo.png")} style={styles.icon} />
          <Text style={styles.title}>Market Trends</Text>
          <Text style={styles.subtitle}>Get latest mandi prices.</Text>
        </TouchableOpacity>

        {/* Agri AI News Card */}
        <TouchableOpacity style={styles.card} onPress={()=>Router.push('/LiveStream')}>
          <Image source={require("../../assets/images/sp.jpeg")} style={styles.icon} />
          <Text style={styles.title}>Live Chat</Text>
          <Text style={styles.subtitle}>Lets talk in realtime with AI</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 0,
    marginTop: '5%'
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 9,
    marginBottom: 20,
    alignItems: "center",
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    resizeMode: "contain",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
});

export default AgriAISupport;
