import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const dummyData = [
  { id: "1", crop: "Wheat", price: "₹2,350 / Quintal", market: "Kaithal Mandi", trend: "up" },
  { id: "2", crop: "Rice", price: "₹2,900 / Quintal", market: "Kurukshetra Mandi", trend: "down" },
  { id: "3", crop: "Mustard", price: "₹5,100 / Quintal", market: "Hisar Mandi", trend: "up" },
  { id: "4", crop: "Cotton", price: "₹6,200 / Quintal", market: "Sirsa Mandi", trend: "steady" },
];

const MarketPriceScreen = () => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(dummyData);

  useEffect(() => {
    if (!search.trim()) setFiltered(dummyData);
    else {
      const result = dummyData.filter((item) =>
        item.crop.toLowerCase().includes(search.toLowerCase())
      );
      setFiltered(result);
    }
  }, [search]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>🌾 Market Prices</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#4CAF50" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search crop..."
          placeholderTextColor="#777"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Price List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cropName}>{item.crop}</Text>
              <View style={styles.trendContainer}>
                {item.trend === "up" && (
                  <MaterialCommunityIcons name="trending-up" size={20} color="green" />
                )}
                {item.trend === "down" && (
                  <MaterialCommunityIcons name="trending-down" size={20} color="red" />
                )}
                {item.trend === "steady" && (
                  <MaterialCommunityIcons name="trending-neutral" size={20} color="#777" />
                )}
              </View>
            </View>

            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.market}>📍 {item.market}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noResult}>No crops found 😕</Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={() => alert("Prices updated!")}>
        <MaterialCommunityIcons name="refresh" size={24} color="white" />
        <Text style={styles.refreshText}>Refresh Prices</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 60,
    width: '100%'
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#333",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cropName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#388E3C",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B5E20",
    marginTop: 5,
  },
  market: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  refreshButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 12,
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: "85%",
  },
  refreshText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  noResult: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
    marginTop: 30,
  },
});

export default MarketPriceScreen;
