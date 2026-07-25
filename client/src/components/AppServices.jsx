import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const AgriAISupport = () => {
  const router = useRouter();

  const services = [
    {
      id: "chat",
      title: "AI Agronomist",
      subtitle: "Instant farming advice",
      route: "/ChatBot",
      badge: "AI 24/7",
      badgeColor: "#4CAF50",
      icon: (
        <Image
          source={require("../../assets/images/chat.png")}
          style={styles.cardImage}
        />
      ),
      bgColor: "#F1F8E9",
      borderColor: "#DCEDC8",
    },
    {
      id: "pest",
      title: "Pest Scanner",
      subtitle: "Crop disease diagnosis",
      route: "/Pest",
      badge: "Instant",
      badgeColor: "#FB8C00",
      icon: (
        <Image
          source={require("../../assets/images/scanner.png")}
          style={styles.cardImage}
        />
      ),
      bgColor: "#FFF8E1",
      borderColor: "#FFE082",
    },
    {
      id: "market",
      title: "Mandi Rates",
      subtitle: "Live market prices",
      route: "/MarektPrice",
      badge: "Live",
      badgeColor: "#1E88E5",
      icon: (
        <Image
          source={require("../../assets/images/MarketLogo.png")}
          style={styles.cardImage}
        />
      ),
      bgColor: "#E3F2FD",
      borderColor: "#90CAF9",
    },
    {
      id: "live",
      title: "Expert Live",
      subtitle: "Interact with scientists",
      route: "/LiveStream",
      badge: "Sessions",
      badgeColor: "#E53935",
      icon: (
        <Image
          source={require("../../assets/images/sp.jpeg")}
          style={styles.cardImageRound}
        />
      ),
      bgColor: "#FFEBEE",
      borderColor: "#EF9A9A",
    },
    {
      id: "schemes",
      title: "Govt Schemes",
      subtitle: "Subsidies & welfare",
      route: "/GovtSchemes",
      badge: "Kisan",
      badgeColor: "#4CAF50",
      icon: (
        <FontAwesome5 name="university" size={28} color="#4CAF50" />
      ),
      bgColor: "#F1F8E9",
      borderColor: "#DCEDC8",
    },
    {
      id: "weather",
      title: "Weather Radar",
      subtitle: "Rain & wind alerts",
      route: "/Weather",
      badge: "Hourly",
      badgeColor: "#039BE5",
      icon: (
        <MaterialCommunityIcons name="weather-partly-cloudy" size={34} color="#039BE5" />
      ),
      bgColor: "#E0F7FA",
      borderColor: "#80DEEA",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="grid-outline" size={20} color="#4CAF50" />
          <Text style={styles.heading}>Smart Services</Text>
        </View>
        <Text style={styles.subHeading}>Tools for maximum crop yield & advice</Text>
      </View>

      <View style={styles.cardContainer}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.card, { borderColor: service.borderColor }]}
            onPress={() => router.push(service.route)}
            activeOpacity={0.8}
          >
            {service.badge && (
              <View style={[styles.badge, { backgroundColor: service.badgeColor }]}>
                <Text style={styles.badgeText}>{service.badge}</Text>
              </View>
            )}

            <View style={[styles.iconBox, { backgroundColor: service.bgColor }]}>
              {service.icon}
            </View>

            <Text style={styles.title} numberOfLines={1}>
              {service.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {service.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: 0.2,
  },
  subHeading: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
  },
  cardImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  cardImageRound: {
    width: 38,
    height: 38,
    borderRadius: 19,
    resizeMode: "cover",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#212121",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    marginTop: 3,
    lineHeight: 14,
  },
});

export default AgriAISupport;

