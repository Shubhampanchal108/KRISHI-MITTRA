import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const HeaderTab = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Brand Logo & Title */}
        <View style={styles.logoContainer}>
          <View style={styles.imageBadge}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.appName}>Krishi Mittra</Text>
              <MaterialCommunityIcons name="leaf" size={16} color="#2E7D32" style={styles.leafIcon} />
            </View>
            <Text style={styles.tagline}>Smart AI Farming Companion</Text>
          </View>
        </View>

        {/* Header Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.push('/Community')}
            activeOpacity={0.7}
          >
            <Ionicons name="people-outline" size={22} color="#1B5E20" />
            <View style={styles.activeDot} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HeaderTab;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F4F9F4",
    paddingTop: "8%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  imageBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  logoImage: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  appName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: 0.3,
  },
  leafIcon: {
    marginLeft: 4,
  },
  tagline: {
    fontSize: 10,
    color: "#558B2F",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FAF3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    position: "relative",
  },
  activeDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});

