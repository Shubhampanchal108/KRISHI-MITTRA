import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HeaderTab = () => {
  return (
    <SafeAreaView style={styles.header}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.jpeg")}
          style={{ width: 45, height: 45, borderRadius: 50, borderColor: "#83d288ff", }}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Krishi-Mittra</Text>
      </View>

      <TouchableOpacity>
        <Ionicons name="menu-outline" size={40} color="#1B5E20" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HeaderTab;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10%",
    paddingBottom: 10,
    borderBottomWidth: 1.2,
    borderBottomColor: "#A5D6A7",
    width : "100%"
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: "green",
    marginLeft: 8,
  },
});
