import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  RefreshControl,
  SafeAreaView,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Hardcoded agriculture news fallback (always loads fast)
const FALLBACK_NEWS = [
  {
    id: "1",
    title: "PM Kisan Samman Nidhi: Next Installment Expected in August 2025",
    description:
      "The government is set to release the next installment of PM-KISAN scheme, directly crediting ₹2000 to millions of farmers' accounts across India.",
    url: "https://pmkisan.gov.in",
    publishedAt: "2025-07-20",
    source: "Agricultural Ministry",
    category: "Scheme",
  },
  {
    id: "2",
    title:
      "Kharif Sowing Season: Farmers Report Good Progress Amid Normal Monsoon",
    description:
      "Agriculture officials report that kharif sowing is progressing well with paddy, soybean, and cotton witnessing healthy coverage due to timely monsoon rains.",
    url: "https://pib.gov.in",
    publishedAt: "2025-07-18",
    source: "PIB India",
    category: "Farming",
  },
  {
    id: "3",
    title: "MSP for Kharif Crops 2025-26 Announced by Cabinet",
    description:
      "The Cabinet Committee on Economic Affairs has approved a significant hike in Minimum Support Price (MSP) for paddy, arhar dal, and other kharif crops.",
    url: "https://agriculture.gov.in",
    publishedAt: "2025-07-15",
    source: "CCEA",
    category: "Policy",
  },
  {
    id: "4",
    title: "Organic Farming Zones to be Established in 10 New States",
    description:
      "The Ministry of Agriculture has announced plans to expand the Paramparagat Krishi Vikas Yojana to promote organic farming in clusters across 10 new states.",
    url: "https://pgsindia-ncof.gov.in",
    publishedAt: "2025-07-10",
    source: "NCOF India",
    category: "Organic",
  },
  {
    id: "5",
    title: "Drip Irrigation Subsidy Scheme Gets ₹5000 Crore Boost",
    description:
      "The government has allocated additional funds under PMKSY to support micro-irrigation infrastructure, helping small farmers adopt water-efficient technologies.",
    url: "https://pmksy.gov.in",
    publishedAt: "2025-07-08",
    source: "PMKSY",
    category: "Irrigation",
  },
  {
    id: "6",
    title: "Soil Health Cards to be Upgraded with AI-Based Analysis",
    description:
      "A new initiative to digitize and use AI-based analysis for Soil Health Cards will help farmers get more precise fertilizer recommendations tailored to their land.",
    url: "https://soilhealth.dac.gov.in",
    publishedAt: "2025-07-05",
    source: "Soil Health Portal",
    category: "Technology",
  },
  {
    id: "7",
    title: "Fasal Bima Yojana: Claim Settlement Speeded Up via Mobile App",
    description:
      "PMFBY announces integration with mobile claim settlement — farmers can now submit crop loss reports directly via smartphone within 72 hours of a calamity.",
    url: "https://pmfby.gov.in",
    publishedAt: "2025-07-02",
    source: "PMFBY",
    category: "Insurance",
  },
  {
    id: "8",
    title: "Agri-Export Zones: 12 New Clusters Approved for Horticulture",
    description:
      "The APEDA has approved 12 new agricultural export clusters for fruits, vegetables and spices to boost farmer income through global market access.",
    url: "https://apeda.gov.in",
    publishedAt: "2025-06-28",
    source: "APEDA",
    category: "Export",
  },
];

const CATEGORIES = [
  "All",
  "Scheme",
  "Farming",
  "Policy",
  "Organic",
  "Irrigation",
  "Technology",
  "Insurance",
  "Export",
];

const categoryColors = {
  Scheme: { bg: "#E8F5E9", text: "#2E7D32" },
  Farming: { bg: "#FFF8E1", text: "#F57F17" },
  Policy: { bg: "#E3F2FD", text: "#1565C0" },
  Organic: { bg: "#F3E5F5", text: "#6A1B9A" },
  Irrigation: { bg: "#E1F5FE", text: "#0277BD" },
  Technology: { bg: "#E8EAF6", text: "#283593" },
  Insurance: { bg: "#FCE4EC", text: "#880E4F" },
  Export: { bg: "#F9FBE7", text: "#558B2F" },
  All: { bg: "#E8F5E9", text: "#2E7D32" },
};

const NewsScreen = () => {
  const router = useRouter();
  const [news, setNews] = useState(FALLBACK_NEWS);
  const [filteredNews, setFilteredNews] = useState(FALLBACK_NEWS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic
  useEffect(() => {
    let result = news;
    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    setFilteredNews(result);
  }, [selectedCategory, searchQuery, news]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Refresh from cache or show latest hardcoded data
    await new Promise((r) => setTimeout(r, 800));
    setNews([...FALLBACK_NEWS].reverse());
    setRefreshing(false);
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  const renderNewsCard = ({ item, index }) => {
    const catColor = categoryColors[item.category] || categoryColors.All;
    return (
      <TouchableOpacity
        style={styles.newsCard}
        activeOpacity={0.88}
        onPress={() => openLink(item.url)}
      >
        <View style={styles.cardHeader}>
          <View
            style={[styles.categoryBadge, { backgroundColor: catColor.bg }]}
          >
            <Text style={[styles.categoryText, { color: catColor.text }]}>
              {item.category}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.publishedAt)}</Text>
        </View>

        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.newsDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.sourceContainer}>
            <Ionicons name="newspaper-outline" size={13} color="#4CAF50" />
            <Text style={styles.sourceText}>{item.source}</Text>
          </View>
          <View style={styles.readMoreBtn}>
            <Text style={styles.readMoreText}>Read More</Text>
            <Ionicons name="arrow-forward" size={13} color="#2E7D32" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="article" size={22} color="#1B5E20" />
          <Text style={styles.headerTitle}>Agriculture News</Text>
        </View>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#666"
          style={{ marginLeft: 12 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search news..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={{ paddingRight: 12 }}
          >
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

     

      {/* News Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {filteredNews.length} article{filteredNews.length !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity onPress={onRefresh}>
          <View style={styles.refreshBtn}>
            <Ionicons name="refresh-outline" size={14} color="#4CAF50" />
            <Text style={styles.refreshText}>Refresh</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* News List */}
      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        renderItem={renderNewsCard}
        contentContainerStyle={styles.newsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={["#4CAF50"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={60} color="#C8E6C9" />
            <Text style={styles.emptyText}>No news found</Text>
            <Text style={styles.emptySubText}>
              Try a different search or category
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default NewsScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8F4",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 38 : 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8E2",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },

  headerTitle: {
    marginLeft: 8,
    fontSize: 19,
    fontWeight: "700",
    color: "#1B5E20",
  },

  headerSpacer: {
    width: 40,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE7DC",
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 6,
  },

  categoryChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6E4D6",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  categoryChipActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },

  categoryChipText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "600",
  },

  categoryChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 10,
  },

  countText: {
    fontSize: 13,
    color: "#777",
    fontWeight: "500",
  },

  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  refreshText: {
    marginLeft: 5,
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 13,
  },

  newsList: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  newsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 5,
    borderLeftColor: "#4CAF50",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  dateText: {
    fontSize: 12,
    color: "#8C8C8C",
  },

  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2E1A",
    lineHeight: 23,
    marginBottom: 8,
  },

  newsDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
    marginBottom: 14,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEF4EE",
    paddingTop: 12,
  },

  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  sourceText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },

  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  readMoreText: {
    marginRight: 4,
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 30,
  },

  emptyText: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "700",
    color: "#90A890",
  },

  emptySubText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#AAB7AA",
    lineHeight: 22,
  },
});