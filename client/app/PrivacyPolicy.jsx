import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import HeaderTab from "../src/components/HeaderTab";
import NavigationTab from "../src/components/NavigationTab";
import { useRouter } from "expo-router";

const PrivacyPolicy = () => {
  const router = useRouter();

  return (
    <>
      <HeaderTab />
      <View style={styles.container}>
        {/* Top bar with back button & title */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1B5E20" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <FontAwesome5 name="shield-alt" size={18} color="#1B5E20" />
            <Text style={styles.headerTitle}>Privacy Policy</Text>
          </View>
          <View style={{ width: 36 }} />
        </SafeAreaView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerIconBox}>
              <FontAwesome5 name="user-shield" size={28} color="#2E7D32" />
            </View>
            <Text style={styles.bannerTitle}>Your Data & Privacy</Text>
            <Text style={styles.bannerSubtitle}>
              Last Updated: July 24, 2026 • Effective Immediately
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle-outline" size={20} color="#2E7D32" />
              <Text style={styles.cardTitle}>1. Overview</Text>
            </View>
            <Text style={styles.cardBody}>
              At Krishi-Mittra, we are committed to protecting your privacy and ensuring the security of your agricultural data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="cloud-upload-outline" size={20} color="#2E7D32" />
              <Text style={styles.cardTitle}>2. Information We Collect</Text>
            </View>
            <Text style={styles.cardBody}>
              We collect information that you directly provide to us to enhance your farming experience:
            </Text>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Personal Information:</Text> Name, phone number, state, and district provided during profile setup.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Agricultural & Soil Data:</Text> Soil type, pH level, moisture, and NPK nutrient values uploaded by you.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Query & Chat Data:</Text> Questions submitted to Krishi-Mittra AI assistant to provide localized agricultural advisory.
              </Text>
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="cog-outline" size={20} color="#2E7D32" />
              <Text style={styles.cardTitle}>3. How We Use Your Information</Text>
            </View>
            <Text style={styles.cardBody}>
              The collected information is used strictly to deliver personalized services:
            </Text>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>To generate tailored crop and soil advice using AI models.</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>To fetch relevant local weather and market price updates based on your district.</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>To maintain and improve the performance and reliability of the app.</Text>
            </View>
          </View>

          {/* Section 4 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="lock-closed-outline" size={20} color="#2E7D32" />
              <Text style={styles.cardTitle}>4. Data Storage & Security</Text>
            </View>
            <Text style={styles.cardBody}>
              We implement industry-standard encryption and local storage mechanisms to protect your personal details and advisory cache. We do not sell or rent your personal information to third parties.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="call-outline" size={20} color="#2E7D32" />
              <Text style={styles.cardTitle}>5. Contact Us</Text>
            </View>
            <Text style={styles.cardBody}>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please reach out to our support team:
            </Text>
            <Text style={[styles.cardBody, { fontWeight: "700", color: "#2E7D32", marginTop: 6 }]}>
              📧 Email: support@krishimittra.in
            </Text>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
      <NavigationTab />
    </>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8F4",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8E2",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  banner: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  bannerIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A2E1A",
    marginLeft: 8,
  },
  cardBody: {
    fontSize: 13,
    color: "#444444",
    lineHeight: 20,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginTop: 7,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: "#555555",
    lineHeight: 19,
  },
  boldText: {
    fontWeight: "700",
    color: "#2E7D32",
  },
});
