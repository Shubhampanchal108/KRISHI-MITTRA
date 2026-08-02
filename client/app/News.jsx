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
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { URL as API_BASE_URL } from "../App";

// News endpoint — uses the same base URL as the rest of the app
const NEWS_API_URL = `${API_BASE_URL}/api/main/news`;

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

const CATEGORY_IMAGES = {
  Scheme:
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80",
  Farming:
    "https://media.istockphoto.com/id/2206670602/photo/rural-indian-farmer-standing-in-agriculture-wheat-farm-and-looking-into-the-distant.webp?a=1&b=1&s=612x612&w=0&k=20&c=4jWdLQYAoBKLTwpDYv77dXftaJH-iT39Kxigkzwvj5g=",
  Policy:
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
  Organic:
    "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
  Irrigation:
    "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&auto=format&fit=crop&q=80",
  Technology:
    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80",
  Insurance:
    "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
  Export:
    "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
  All:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80",
};

const NewsScreen = () => {
  const router = useRouter();
  const [allNews, setAllNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(""); // 'live' | 'fallback'

  const fetchNews = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(NEWS_API_URL, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const json = await response.json();

      if (json.success && Array.isArray(json.news) && json.news.length > 0) {
        setAllNews(json.news);
        setDataSource("live");
      } else {
        throw new Error("Empty response from server");
      }
    } catch (err) {
      console.warn("News fetch failed, using fallback:", err.message);
      setError("Could not load live news. Showing cached articles.");
      setAllNews(FALLBACK_NEWS);
      setDataSource("fallback");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Filter logic
  useEffect(() => {
    let result = allNews;
    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredNews(result);
  }, [selectedCategory, searchQuery, allNews]);

  const onRefresh = useCallback(() => {
    fetchNews(true);
  }, [fetchNews]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/<[^>]*>?/gm, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const openLink = async (url) => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Linking.openURL(url).catch(() => {});
    }
  };

  const renderNewsCard = ({ item }) => {
    const catName = item.category || "Farming";
    const catColor = categoryColors[catName] || categoryColors.All;
    const cleanTitle = cleanText(item.title);
    const cleanDesc = cleanText(item.description);
    const imageUri =
      item.imageUrl || CATEGORY_IMAGES[catName] || CATEGORY_IMAGES.All;

    return (
      <TouchableOpacity
        style={styles.newsCard}
        activeOpacity={0.88}
        onPress={() => openLink(item.url)}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View
            style={[styles.categoryBadgeOverlay, { backgroundColor: catColor.bg }]}
          >
            <Text style={[styles.categoryText, { color: catColor.text }]}>
              {catName}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={13} color="#888" style={{ marginRight: 4 }} />
              <Text style={styles.dateText}>{formatDate(item.publishedAt)}</Text>
            </View>
          </View>

          <Text style={styles.newsTitle} numberOfLines={2}>
            {cleanTitle}
          </Text>

          <Text style={styles.newsDescription} numberOfLines={3}>
            {cleanDesc}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.sourceContainer}>
              <Ionicons name="newspaper-outline" size={13} color="#4CAF50" />
              <Text style={styles.sourceText} numberOfLines={1}>
                {cleanText(item.source)}
              </Text>
            </View>
            <View style={styles.readMoreBtn}>
              <Text style={styles.readMoreText}>Read More</Text>
              <Ionicons name="arrow-forward" size={13} color="#2E7D32" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <View style={styles.container}>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Fetching latest news...</Text>
          <Text style={styles.loadingSubText}>
            Powered by Google News RSS
          </Text>
        </View>
      </View>
    );
  }

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

      {/* Category chips */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item)}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const isActive = selectedCategory === item;
          return (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                isActive && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isActive && styles.categoryChipTextActive,
                ]}
              >
                {String(item)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

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

  liveBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#C8E6C9",
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 7,
  },

  liveBannerText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE0B2",
    gap: 6,
  },

  errorBannerText: {
    fontSize: 12,
    color: "#E65100",
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginTop: 8,
  },

  loadingSubText: {
    fontSize: 13,
    color: "#888",
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
    marginBottom: "6%",
  },

  categoryChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6E4D6",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 36,
  },

  categoryChipActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },

  categoryChipText: {
    color: "#1B5E20",
    fontSize: 13,
    fontWeight: "600",
    includeFontPadding: false,
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
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8F0E8",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  cardImageContainer: {
    width: "100%",
    height: 155,
    position: "relative",
    backgroundColor: "#E8F5E9",
  },

  cardImage: {
    width: "100%",
    height: "100%",
  },

  categoryBadgeOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  cardBody: {
    padding: 16,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    flex: 1,
    marginRight: 8,
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