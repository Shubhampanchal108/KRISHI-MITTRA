import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

const NavigationTab = () => {
  const router = useRouter();
  const pathname = usePathname(); 

  // function to check active tab
  const isActive = (path) => pathname === path;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Home */}
      <TouchableOpacity style={styles.tabButton} onPress={() => router.push("/")}>
        <Ionicons
          name="home-outline"
          size={26}
          color={isActive("/") ? "#1B5E20" : "#A5D6A7"}
        />
        <Text style={[styles.label, { color: isActive("/") ? "#1B5E20" : "#A5D6A7" }]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Advise */}
      <TouchableOpacity style={styles.tabButton} onPress={() => router.push("/ChatBot")}>
        <Ionicons
          name="chatbubbles-outline"
          size={26}
          color={isActive("/ChatBot") ? "#1B5E20" : "#A5D6A7"}
        />
        <Text style={[styles.label, { color: isActive("/ChatBot") ? "#1B5E20" : "#A5D6A7" }]}>
          Advise
        </Text>
      </TouchableOpacity>

      {/* Market */}
      <TouchableOpacity style={styles.tabButton} onPress={() => router.push("/MarektPrice")}>
        <FontAwesome5
          name="store"
          size={24}
          color={isActive("/MarektPrice") ? "#1B5E20" : "#A5D6A7"}
        />
        <Text style={[styles.label, { color: isActive("/MarektPrice") ? "#1B5E20" : "#A5D6A7" }]}>
          Mandi
        </Text>
      </TouchableOpacity>

      {/* Weather */}
      <TouchableOpacity style={styles.tabButton} onPress={() => router.push("/Weather")}>
        <MaterialCommunityIcons
          name="cloud-outline"
          size={28}
          color={isActive("/Weather") ? "#1B5E20" : "#A5D6A7"}
        />
        <Text style={[styles.label, { color: isActive("/Weather") ? "#1B5E20" : "#A5D6A7" }]}>
          Weather
        </Text>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity style={styles.tabButton} onPress={() => router.push("/Profile")}>
        <Ionicons
          name="person-circle-outline"
          size={28}
          color={isActive("/Profile") ? "#1B5E20" : "#A5D6A7"}
        />
        <Text style={[styles.label, { color: isActive("/Profile") ? "#1B5E20" : "#A5D6A7" }]}>
          Profile
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default NavigationTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#A5D6A7",
    elevation: 10,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
});
