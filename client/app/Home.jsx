import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AgriAISupport from "../src/components/AppServices";
import Header from "../src/components/HeaderTab";
import NavigationTab from "../src/components/NavigationTab";
import AIAdvise from "../src/components/AIAdvise";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WeatherLLM } from "../src/services/LLM";
import { getWeatherInfo } from "../src/services/Weather";
import { useRouter } from "expo-router";
import { speak, stopTTS } from "../src/utils/TTS";

const HomeScreen = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("Farmer");
  const [weatherData, setWeatherData] = useState(null);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Time-based greeting helper
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning 🌅";
    if (hours < 17) return "Good Afternoon ☀️";
    return "Good Evening 🌙";
  };

  // Fetch farmer name safely
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const storedName = await AsyncStorage.getItem("name");
        if (storedName) {
          setUserName(storedName);
        }
      } catch (err) {
        console.log("Error fetching user name:", err);
      }
    };
    fetchUserName();
  }, []);

  // Display weather
  const DisplayWeather = async () => {
    const City = (await AsyncStorage.getItem("district")) || "Delhi";
    const data = await getWeatherInfo(City);
    setWeatherData(data);
    if (data) {
      await AsyncStorage.setItem("weatherData", JSON.stringify(data));
    }
  };

  useEffect(() => {
    const fetchOnce = async () => {
      setLoading(true);
      const fetched = await AsyncStorage.getItem("weatherFetched");
      if (fetched === "true") {
        const cached = await AsyncStorage.getItem("weatherData");
        if (cached) {
          setWeatherData(JSON.parse(cached));
          setLoading(false);
          return;
        }
      }

      await DisplayWeather();
      await AsyncStorage.setItem("weatherFetched", "true");
      setLoading(false);
    };

    fetchOnce();
  }, []);

  useEffect(() => {
    if (weatherData) {
      const weatherInfo = `Temperature: ${Math.floor(
        (weatherData.main?.temp || 273.15) - 273.15
      )}°C, Weather: ${weatherData.weather?.[0]?.description}, Humidity: ${
        weatherData.main?.humidity
      }%, Wind Speed: ${weatherData.wind?.speed} mph`;

      setAdviceLoading(true);

      const fetchAdvice = async () => {
        const adviceFetched = await AsyncStorage.getItem("adviceFetched");

        if (adviceFetched === "true") {
          const storedAdvice = await AsyncStorage.getItem("advice");
          if (storedAdvice) {
            setAdvice(storedAdvice);
            setAdviceLoading(false);
            return;
          }
        }

        try {
          const response = await WeatherLLM(weatherInfo);
          setAdvice(response);
          await AsyncStorage.setItem("advice", response);
          await AsyncStorage.setItem("adviceFetched", "true");
          setAdviceLoading(false);
        } catch (error) {
          setAdviceLoading(false);
          console.error("Error fetching advice:", error);
        }
      };

      fetchAdvice();
    }
  }, [weatherData]);

  const handleSpeak = (text) => {
    if (isPlaying) {
      stopTTS();
      setIsPlaying(false);
    } else {
      speak(text, () => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const formattedTemp = weatherData?.main?.temp
    ? Math.floor(weatherData.main.temp - 273.15)
    : "--";

  return (
    <>
      <Header />
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Welcome & Farmer Hero Header */}
          <View style={styles.heroBanner}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.welcomeName}>Welcome, {userName} 👋</Text>
            </View>
          </View>

          {/* Weather Widget Card */}
          <TouchableOpacity
            style={styles.weatherCard}
            onPress={() => router.push("/Weather")}
            activeOpacity={0.85}
          >
            <View style={styles.weatherCardHeader}>
              <View style={styles.weatherTitleRow}>
                <Ionicons name="partly-sunny" size={24} color="#FFD54F" />
                <Text style={styles.weatherCardTitle}>Live Farm Weather</Text>
              </View>
              <View style={styles.detailBadge}>
                <Text style={styles.detailBadgeText}>Details</Text>
                <Feather name="chevron-right" size={14} color="#FFFFFF" />
              </View>
            </View>

            {!loading && weatherData ? (
              <View style={styles.weatherBody}>
                <View style={styles.tempSection}>
                  <Text style={styles.tempText}>{formattedTemp}°C</Text>
                  <Text style={styles.weatherConditionText}>
                    {weatherData?.weather?.[0]?.description || "Clear sky"}
                  </Text>
                </View>

                <View style={styles.weatherMetricsRow}>
                  <View style={styles.metricItem}>
                    <Ionicons name="water-outline" size={16} color="#A5D6A7" />
                    <Text style={styles.metricLabel}>Humidity</Text>
                    <Text style={styles.metricValue}>
                      {weatherData?.main?.humidity}%
                    </Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Feather name="wind" size={16} color="#A5D6A7" />
                    <Text style={styles.metricLabel}>Wind</Text>
                    <Text style={styles.metricValue}>
                      {weatherData?.wind?.speed} mph
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading weather...</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Disease & Pest Scanner Widget */}
          <View style={styles.scannerCard}>
            <View style={styles.scannerHeaderRow}>
              <View style={styles.scannerBadge}>
                <MaterialCommunityIcons
                  name="shield-bug-outline"
                  size={24}
                  color="#2E7D32"
                />
              </View>
              <View style={styles.scannerTextCol}>
                <Text style={styles.scannerTitle}>Crop Disease & Pest AI Scanner</Text>
                <Text style={styles.scannerSubtitle}>
                  Snap a photo of leaf or crop damage for instant diagnostic cure.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push("/Pest")}
              activeOpacity={0.85}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.scanButtonText}>Scan Crop Leaf Now</Text>
            </TouchableOpacity>
          </View>

          {/* Quick AI Services Grid */}
          <AgriAISupport />

          {/* AI Farming Advice Card */}
          {adviceLoading ? (
            <View style={styles.loadingAdviceBox}>
              <ActivityIndicator size="small" color="#2E7D32" />
              <Text style={styles.loadingAdviceText}>Generating AI Farming Advisory...</Text>
            </View>
          ) : (
            <AIAdvise
              title="Today's AI Advisory"
              secondTitle="Personalized Crop Tip"
              advice={advice}
              isPlaying={isPlaying}
              onClick={() => handleSpeak(advice)}
            />
          )}
        </ScrollView>
      </SafeAreaView>
      <NavigationTab />
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBF8",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heroBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  greetingText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2E7D32",
    marginTop: 2,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCEDC8",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#388E3C",
  },
  weatherCard: {
    backgroundColor: "#94d1e6ff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    elevation: 3,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 16,
  },
  weatherCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  weatherTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weatherCardTitle: {
    color: "#1B5E20",
    fontSize: 15,
    fontWeight: "800",
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a6e3a8ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  detailBadgeText: {
    color: "#1B5E20",
    fontSize: 11,
    fontWeight: "700",
  },
  weatherBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tempSection: {
    justifyContent: "center",
  },
  tempText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2E7D32",
  },
  weatherConditionText: {
    fontSize: 13,
    color: "#4CAF50",
    textTransform: "capitalize",
    fontWeight: "700",
    marginTop: 2,
  },
  weatherMetricsRow: {
    flexDirection: "row",
    backgroundColor: "#f0f8f2ff",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#DCEDC8",
  },
  metricItem: {
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 9,
    color: "#558B2F",
    marginTop: 2,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1B5E20",
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#C8E6C9",
  },
  loadingBox: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#2E7D32",
    fontSize: 12,
  },
  scannerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCEDC8",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  scannerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  scannerBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F1F8E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCEDC8",
  },
  scannerTextCol: {
    flex: 1,
  },
  scannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2E7D32",
  },
  scannerSubtitle: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
    lineHeight: 15,
  },
  scanButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  loadingAdviceBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  loadingAdviceText: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "600",
  },
});

