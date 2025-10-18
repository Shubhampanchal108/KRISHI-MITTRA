import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AIAdviceCard = ({title, secondTitle, advice, onClick}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="bulb-outline" size={26} color="#1B5E20" />
        <Text style={styles.heading}>{title}</Text>
      </View>

      <View style={styles.contentBox}>
        {/* <Image
          source={require("../../assets/images/logo.jpeg")}
          style={styles.image}
        /> */}
        <View style={styles.textSection}>
          <Text style={styles.title}>{secondTitle}</Text>
          <Text style={styles.adviceText}>
            {advice}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={onClick}>
        <Ionicons name="volume-high-outline" size={24} color="#fff" />
        <Text style={styles.refreshText}>Hear the expert advice.</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AIAdviceCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 16,
    margin: 1,
    elevation: 2,
    marginBottom: "10"
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginLeft: 6,
  },
  contentBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
  },
  image: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginRight: 12,
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },
  refreshBtn: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 14,
    backgroundColor: "#1B5E20",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  refreshText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});
