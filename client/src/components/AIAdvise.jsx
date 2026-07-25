import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const AIAdviceCard = ({ title, secondTitle, advice, onClick, isPlaying }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="sparkles" size={20} color="#4CAF50" />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.heading}>{title || "Today's AI Advice"}</Text>
          <Text style={styles.subHeading}>{secondTitle || "Smart Agricultural Tip"}</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI POWERED</Text>
        </View>
      </View>

      <View style={styles.contentBox}>
        <MaterialCommunityIcons 
          name="format-quote-open" 
          size={24} 
          color="#A5D6A7" 
          style={styles.quoteIcon} 
        />
        <Text style={styles.adviceText}>
          {advice || "Loading personalized agricultural insights based on your region and weather updates..."}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.audioBtn, isPlaying && styles.audioBtnActive]}
        onPress={onClick}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isPlaying ? "volume-mute-outline" : "volume-high-outline"}
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.audioBtnText}>
          {isPlaying ? "Stop Audio" : "Listen to Advice"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AIAdviceCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F8E9",
    borderRadius: 20,
    padding: 16,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: "#DCEDC8",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCEDC8",
  },
  headerTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  heading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E7D32",
  },
  subHeading: {
    fontSize: 11,
    color: "#66BB6A",
    fontWeight: "700",
  },
  aiBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  aiBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  contentBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DCEDC8",
    position: "relative",
  },
  quoteIcon: {
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 21,
    fontWeight: "500",
  },
  audioBtn: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 14,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 25,
    alignItems: "center",
    gap: 8,
    elevation: 2,
  },
  audioBtnActive: {
    backgroundColor: "#E53935",
  },
  audioBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});

