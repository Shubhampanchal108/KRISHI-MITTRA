import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavigantionTab from '../src/components/NavigationTab'
import HeaderTab from "../src/components/HeaderTab";
import AIAdviceCard from "../src/components/AIAdvise";

export default function WeatherScreen() {
  return (
    <>
    <HeaderTab/>
    <ScrollView style={styles.container}>

    {/* Current Weather */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Weather in Kaithal</Text>
        <View style={styles.tempRow}>
          <Ionicons name="sunny-outline" size={28} color="#007AFF" />
          <Text style={styles.tempText}>29.5°C</Text>
        </View>
        <Text style={styles.subHeading}>CLEAR SKY</Text>

        {/* Current Conditions */}
        <Text style={styles.sectionTitle}>Current Conditions</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Ionicons name="thermometer-outline" size={20} color="#007AFF" />
            <Text>Feels Like: 28.9°C</Text>
          </View>
          <View style={styles.gridItem}>
            <Ionicons name="water-outline" size={20} color="#007AFF" />
            <Text>Humidity: 38%</Text>
          </View>
          <View style={styles.gridItem}>
            <Ionicons name="navigate-outline" size={20} color="#007AFF" />
            <Text>Wind: 11.3 km/h</Text>
          </View>
          <View style={styles.gridItem}>
            <Ionicons name="speedometer-outline" size={20} color="#007AFF" />
            <Text>Pressure: 1012 hPa</Text>
          </View>
        </View>

        {/* Precipitation */}
        <Text style={styles.sectionTitle}>Precipitation</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Ionicons name="rainy-outline" size={20} color="#007AFF" />
            <Text>Rain (1h): 0.0 mm</Text>
          </View>
          <View style={styles.gridItem}>
            <Ionicons name="snow-outline" size={20} color="#007AFF" />
            <Text>Snow (1h): 0.0 mm</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Text style={styles.tabInactive}>Fertilizers</Text>
        <Text style={styles.tabActive}>Spraying</Text>
      </View>

      {/* Current Spraying Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Spraying Status</Text>

        <View style={styles.statusRow}>
          <Ionicons name="warning-outline" size={20} color="#F7B500" />
          <Text style={styles.statusText}>Acceptable</Text>
        </View>

        <View style={styles.infoList}>
          <Text style={styles.infoItem}>✅ Temperature: 29.5°C</Text>
          <Text style={styles.infoItem}>✅ Wind Speed: 11.3 km/h</Text>
          <Text style={styles.infoItem}>❌ Humidity: 38%</Text>
          <Text style={styles.infoItem}>✅ Rain Probability: 19%</Text>
        </View>
      </View>

      

      {/* Current Spraying Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Optimal Conditions</Text>

        <View style={styles.statusRow}>
          <Ionicons name="warning-outline" size={20} color="#F7B500" />
          <Text style={styles.statusText}>Acceptable</Text>
        </View>

        <View style={styles.infoList}>
          <Text style={styles.infoItem}>✅ Temperature: 29.5°C</Text>
          <Text style={styles.infoItem}>✅ Wind Speed: 11.3 km/h</Text>
          <Text style={styles.infoItem}>❌ Humidity: 38%</Text>
          <Text style={styles.infoItem}>✅ Rain Probability: 19%</Text>
        </View>
      </View>

      {/* Current Spraying Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Avoid Spraying</Text>

        <View style={styles.statusRow}>
          <Ionicons name="warning-outline" size={20} color="#F7B500" />
          <Text style={styles.statusText}>Acceptable</Text>
        </View>

        <View style={styles.infoList}>
          <Text style={styles.infoItem}>✅ Temperature: 29.5°C</Text>
          <Text style={styles.infoItem}>✅ Wind Speed: 11.3 km/h</Text>
          <Text style={styles.infoItem}>❌ Humidity: 38%</Text>
          <Text style={styles.infoItem}>✅ Rain Probability: 19%</Text>
        </View>
      </View>

    {/* Recommendations */}
      {/* <View style={styles.card}>
        <Text style={styles.cardTitle}>Recommendations</Text>
        <Text style={styles.subHeading}>💧 Humidity too low</Text>
        <Text style={styles.description}>
          Consider using drift reduction additives and larger droplet sizes.
        </Text>
      </View> */}
      
      <View style={styles.Advise}><AIAdviceCard/></View>
      
    </ScrollView>
    <NavigantionTab/>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  Advise:{
    marginHorizontal: 10
  },
  header: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tabActive: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  tabInactive: {
    color: "#666",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A0A0A",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusText: {
    color: "#F7B500",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 5,
  },
  infoList: {
    marginTop: 6,
  },
  infoItem: {
    fontSize: 15,
    marginVertical: 2,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  tempText: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 6,
  },
  sectionTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#F3F7FB",
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
  },
});