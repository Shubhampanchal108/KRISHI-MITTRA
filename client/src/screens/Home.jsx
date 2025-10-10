import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: "https://i.imgur.com/qcF0pCC.png" }} // Replace with your logo URL
            style={styles.logo}
          />
          <Text style={styles.appName}>Krishi-Mittra</Text>
        </View>

        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={40} color="#1B5E20" />
        </TouchableOpacity>
      </View>

      {/* Weather Card */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherRow}>
          <Ionicons name="partly-sunny-outline" size={40} color="#FFD54F" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.temp}>28°C</Text>
            <Text style={styles.weatherText}>Sunny | Kaithal</Text>
          </View>
        </View>
      </View>

      <View style={styles.adviceContainer}>
  <Text style={styles.adviceTitle}>Detect Pests and Dieases</Text>
  <Text style={styles.adviceSubtitle}>
    Upload or click an image to detect pest/disease and get instant advice.
  </Text>

  <TouchableOpacity
    style={styles.adviceButton}
    onPress={() => alert("Opening Camera / Gallery...")}
  >
    <Text style={styles.adviceButtonText}>📷 Upload</Text>
  </TouchableOpacity>
</View>


      {/* Main Content Placeholder */}
      <View style={styles.mainContent}>
        <Text style={styles.sectionTitle}>🌾 Smart Farming Assistant</Text>
        <Text style={styles.sectionSubtitle}>
          Get real-time crop, soil, and weather insights instantly.
        </Text>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={26} color="#1B5E20" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color="#777" />
          <Text style={styles.tabLabel}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="cart-outline" size={26} color="#777" />
          <Text style={styles.tabLabel}>Market</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="car-outline" size={26} color="#777" />
          <Text style={styles.tabLabel}>Market</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={26} color="#777" />
          <Text style={styles.tabLabel}>stream</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 13,
  },
  header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: '8%',
  paddingBottom: 10,
  borderBottomWidth: 1.2,
  borderBottomColor: "#A5D6A7", // soft green border
},
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 35,
    height: 35,
    borderRadius: 50,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: "green",
    marginLeft: 8,
  },
  weatherCard: {
    backgroundColor: "skyblue",
    borderRadius: 15,
    padding: 20,
    marginTop: 17,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  temp: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E7D32",
  },
  weatherText: {
    fontSize: 16,
    color: "#4CAF50",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  tabItem: {
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    color: "#777",
  },
  adviceContainer: {
  backgroundColor: "#F0FAF3",
  borderRadius: 16,
  padding: 20,
  marginTop: 20,
  marginHorizontal: 1,
  borderWidth: 1,
  borderColor: "#C8E6C9",
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 2,
  height: '28%'
},
adviceTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#2E7D32",
  marginBottom: 5,
},
adviceSubtitle: {
  fontSize: 14,
  color: "#555",
  marginBottom: 15,
},
adviceButton: {
  backgroundColor: "#4CAF50",
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
},
adviceButtonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
},

});
