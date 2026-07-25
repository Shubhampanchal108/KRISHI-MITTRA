import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import NavigationTab from "../src/components/NavigationTab";
import HeaderTab from "../src/components/HeaderTab";
import AIAdviceCard from "../src/components/AIAdvise";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WeatherLLM } from "../src/services/LLM";
import { getWeatherInfo, getForecastInfo } from "../src/services/Weather";
import { speak, stopTTS } from "../src/utils/TTS";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const WeatherScreen = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [cityName, setCityName] = useState("Delhi");
  const [advice, setAdvice] = useState("");
  const [activeTab, setActiveTab] = useState("spraying");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Load weather data from cache or API
  const loadWeather = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const storedCity = (await AsyncStorage.getItem("district")) || "Delhi";
      setCityName(storedCity);

      let data = null;
      if (!isRefresh) {
        const storedWeather = await AsyncStorage.getItem("weatherData");
        if (storedWeather) {
          data = JSON.parse(storedWeather);
        }
      }

      if (!data || isRefresh) {
        try {
          data = await getWeatherInfo(storedCity);
          await AsyncStorage.setItem("weatherData", JSON.stringify(data));
        } catch (apiErr) {
          console.log("Weather API fallback error:", apiErr?.message);
        }
      }

      if (data) {
        setWeatherData(data);
      }

      // Fetch 5-day forecast
      try {
        const rawForecast = await getForecastInfo(storedCity);
        if (rawForecast && rawForecast.list) {
          // Extract 1 forecast per day (around 12:00 PM)
          const daily = rawForecast.list.filter((item) =>
            item.dt_txt.includes("12:00:00")
          ).slice(0, 5);
          setForecastData(daily);
        } else {
          setForecastData(generateMockForecast());
        }
      } catch {
        setForecastData(generateMockForecast());
      }
    } catch (error) {
      console.error("Error loading weather screen:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  // Generate AI advice based on current weather
  useEffect(() => {
    if (!weatherData) return;

    const tempC = Math.round(weatherData.main?.temp - 273.15 || 26);
    const humidity = weatherData.main?.humidity || 55;
    const windKm = Math.round((weatherData.wind?.speed || 3) * 3.6);
    const condition = weatherData.weather?.[0]?.description || "clear sky";

    const weatherInfo = `City: ${cityName}, Temperature: ${tempC}°C, Humidity: ${humidity}%, Wind Speed: ${windKm} km/h, Weather Condition: ${condition}`;

    const fetchAdvice = async () => {
      setAdviceLoading(true);
      try {
        const cachedAdvice = await AsyncStorage.getItem("weatherAgronomyAdvice");
        const cachedDate = await AsyncStorage.getItem("weatherAdviceDate");
        const today = new Date().toDateString();

        if (cachedAdvice && cachedDate === today) {
          setAdvice(cachedAdvice);
          setAdviceLoading(false);
          return;
        }

        const prompt = `As an expert agricultural agronomist, give short, practical advice for farmers in ${cityName} based on this current weather: ${weatherInfo}. Cover spraying suitability, irrigation needs, and crop protection in 3-4 bullet points.`;
        const res = await WeatherLLM(prompt);

        if (res) {
          setAdvice(res);
          await AsyncStorage.setItem("weatherAgronomyAdvice", res);
          await AsyncStorage.setItem("weatherAdviceDate", today);
        }
      } catch (err) {
        console.error("AI Advice error:", err);
        setAdvice(
          "Optimal temperature for field operations. Ensure moderate irrigation if humidity is low. Avoid pesticide spraying if wind speed exceeds 15 km/h."
        );
      } finally {
        setAdviceLoading(false);
      }
    };

    fetchAdvice();
  }, [weatherData, cityName]);

  // Mock forecast generator fallback
  const generateMockForecast = () => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return [1, 2, 3, 4, 5].map((offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return {
        dt_txt: date.toISOString(),
        dayName: dayNames[date.getDay()],
        main: { temp: 298 + Math.floor(Math.random() * 6), humidity: 50 + offset * 3 },
        weather: [{ main: offset % 2 === 0 ? "Clear" : "Clouds", description: offset % 2 === 0 ? "sunny" : "partly cloudy" }],
        wind: { speed: 3 + offset },
      };
    });
  };

  // Temperature math
  const tempC = weatherData ? Math.round(weatherData.main?.temp - 273.15) : 26;
  const feelsLikeC = weatherData ? Math.round(weatherData.main?.feels_like - 273.15) : 27;
  const tempMinC = weatherData ? Math.round(weatherData.main?.temp_min - 273.15) : tempC - 2;
  const tempMaxC = weatherData ? Math.round(weatherData.main?.temp_max - 273.15) : tempC + 4;
  const humidity = weatherData?.main?.humidity ?? 55;
  const windKm = weatherData ? Math.round(weatherData.wind?.speed * 3.6) : 10;
  const pressure = weatherData?.main?.pressure ?? 1012;
  const visibilityKm = weatherData?.visibility ? (weatherData.visibility / 1000).toFixed(1) : "10";
  const rainMm = weatherData?.rain?.["1h"] || weatherData?.rain?.["3h"] || 0;
  const weatherMain = weatherData?.weather?.[0]?.main || "Clear";
  const weatherDesc = weatherData?.weather?.[0]?.description || "clear sky";

  // Calculate Spraying Suitability
  const getSprayingStatus = () => {
    if (rainMm > 0 || windKm > 20 || tempC > 35 || tempC < 10) {
      return {
        status: "AVOID SPRAYING TODAY",
        badgeColor: "#D32F2F",
        bgColor: "#FFEBEE",
        icon: "close-circle",
        reason: windKm > 20 ? "High wind will cause chemical drift" : tempC > 35 ? "High temp causes rapid evaporation" : "Rain will wash away pesticide",
      };
    }
    if (windKm > 14 || tempC > 30 || humidity < 35 || humidity > 85) {
      return {
        status: "SPRAY WITH CAUTION",
        badgeColor: "#F57C00",
        bgColor: "#FFF3E0",
        icon: "alert-circle",
        reason: "Moderate wind/temp. Spray early morning or late evening.",
      };
    }
    return {
      status: "OPTIMAL CONDITIONS FOR SPRAYING",
      badgeColor: "#2E7D32",
      bgColor: "#E8F5E9",
      icon: "checkmark-circle",
      reason: "Ideal wind speed, temperature, and humidity for maximum crop absorption.",
    };
  };

  // Calculate Irrigation Advice
  const getIrrigationAdvice = () => {
    if (rainMm > 5) {
      return {
        recommendation: "PAUSE IRRIGATION",
        color: "#D32F2F",
        bgColor: "#FFEBEE",
        desc: "Sufficient rainfall reported. Further watering may lead to waterlogging.",
      };
    }
    if (tempC > 30 && humidity < 50) {
      return {
        recommendation: "IRRIGATION RECOMMENDED TODAY",
        color: "#1565C0",
        bgColor: "#E3F2FD",
        desc: "High temperature & low humidity increase evapotranspiration. Water crops in early morning.",
      };
    }
    return {
      recommendation: "NORMAL IRRIGATION SCHEDULE",
      color: "#2E7D32",
      bgColor: "#E8F5E9",
      desc: "Moisture levels are moderate. Maintain standard crop irrigation routines.",
    };
  };

  const sprayingStatus = getSprayingStatus();
  const irrigationStatus = getIrrigationAdvice();

  // Sunrise / Sunset format helper
  const formatSunTime = (timestamp) => {
    if (!timestamp) return "--:--";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const handleAudioToggle = () => {
    if (isPlayingAudio) {
      stopTTS();
      setIsPlayingAudio(false);
    } else if (advice) {
      setIsPlayingAudio(true);
      speak(advice, () => setIsPlayingAudio(false));
    }
  };

  return (
    <>
      <HeaderTab />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadWeather(true)}
              colors={["#2E7D32"]}
              tintColor="#2E7D32"
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Fetching weather for your farm...</Text>
            </View>
          ) : (
            <>
              {/* ─── Hero Weather Card (Green Gradient Theme) ─── */}
              <View style={styles.heroCard}>
                <View style={styles.heroHeader}>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location" size={18} color="#A5D6A7" />
                    <Text style={styles.cityName}>{cityName}</Text>
                    <Text style={styles.liveTag}>LIVE</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.refreshIconBtn}
                    onPress={() => loadWeather(true)}
                  >
                    <Ionicons name="refresh" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Main Temperature display */}
                <View style={styles.heroTempRow}>
                  <View>
                    <Text style={styles.heroTempText}>{tempC}°C</Text>
                    <Text style={styles.heroFeelsLike}>
                      Feels like {feelsLikeC}°C • {tempMinC}° / {tempMaxC}°
                    </Text>
                  </View>
                  <View style={styles.heroConditionBox}>
                    <Ionicons
                      name={
                        weatherMain.includes("Cloud")
                          ? "cloudy-outline"
                          : weatherMain.includes("Rain")
                          ? "rainy-outline"
                          : "sunny-outline"
                      }
                      size={54}
                      color="#FFE082"
                    />
                    <Text style={styles.heroConditionText}>
                      {weatherDesc.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Quick Bar inside Hero */}
                <View style={styles.heroQuickBar}>
                  <View style={styles.heroQuickItem}>
                    <Ionicons name="water-outline" size={16} color="#A5D6A7" />
                    <Text style={styles.heroQuickText}>Hum: {humidity}%</Text>
                  </View>
                  <View style={styles.heroQuickDivider} />
                  <View style={styles.heroQuickItem}>
                    <Ionicons name="navigate-outline" size={16} color="#A5D6A7" />
                    <Text style={styles.heroQuickText}>Wind: {windKm} km/h</Text>
                  </View>
                  <View style={styles.heroQuickDivider} />
                  <View style={styles.heroQuickItem}>
                    <Ionicons name="rainy-outline" size={16} color="#A5D6A7" />
                    <Text style={styles.heroQuickText}>Rain: {rainMm} mm</Text>
                  </View>
                </View>
              </View>

              {/* ─── Agricultural Weather Metrics Grid ─── */}
              <Text style={styles.sectionHeader}>Farm Weather Parameters</Text>
              <View style={styles.metricsGrid}>
                {/* Temp */}
                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: "#FFEBEE" }]}>
                    <Ionicons name="thermometer-outline" size={20} color="#D32F2F" />
                  </View>
                  <Text style={styles.metricLabel}>Temp Range</Text>
                  <Text style={styles.metricValue}>
                    {tempMinC}°C – {tempMaxC}°C
                  </Text>
                </View>

                {/* Humidity */}
                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: "#E3F2FD" }]}>
                    <Ionicons name="water-outline" size={20} color="#1976D2" />
                  </View>
                  <Text style={styles.metricLabel}>Humidity</Text>
                  <Text style={styles.metricValue}>{humidity}%</Text>
                </View>

                {/* Wind */}
                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: "#E8F5E9" }]}>
                    <Ionicons name="navigate-outline" size={20} color="#2E7D32" />
                  </View>
                  <Text style={styles.metricLabel}>Wind Speed</Text>
                  <Text style={styles.metricValue}>{windKm} km/h</Text>
                </View>

                {/* Pressure */}
                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: "#FFF3E0" }]}>
                    <Ionicons name="speedometer-outline" size={20} color="#F57C00" />
                  </View>
                  <Text style={styles.metricLabel}>Pressure</Text>
                  <Text style={styles.metricValue}>{pressure} hPa</Text>
                </View>

                {/* Visibility */}
                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: "#F3E5F5" }]}>
                    <Ionicons name="eye-outline" size={20} color="#7B1FA2" />
                  </View>
                  <Text style={styles.metricLabel}>Visibility</Text>
                  <Text style={styles.metricValue}>{visibilityKm} km</Text>
                </View>

                {/* Sun Time */}
                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: "#FFF8E1" }]}>
                    <Ionicons name="sunny-outline" size={20} color="#FBC02D" />
                  </View>
                  <Text style={styles.metricLabel}>Sunrise / Sunset</Text>
                  <Text style={styles.metricValueSmall}>
                    {formatSunTime(weatherData?.sys?.sunrise)} / {formatSunTime(weatherData?.sys?.sunset)}
                  </Text>
                </View>
              </View>

              {/* ─── Farming Action Tabs ─── */}
              <View style={styles.tabNavRow}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === "spraying" && styles.tabBtnActive]}
                  onPress={() => setActiveTab("spraying")}
                >
                  <MaterialCommunityIcons
                    name="spray"
                    size={16}
                    color={activeTab === "spraying" ? "#fff" : "#555"}
                  />
                  <Text
                    style={[
                      styles.tabBtnText,
                      activeTab === "spraying" && styles.tabBtnTextActive,
                    ]}
                  >
                    Spraying
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === "irrigation" && styles.tabBtnActive]}
                  onPress={() => setActiveTab("irrigation")}
                >
                  <Ionicons
                    name="water"
                    size={16}
                    color={activeTab === "irrigation" ? "#fff" : "#555"}
                  />
                  <Text
                    style={[
                      styles.tabBtnText,
                      activeTab === "irrigation" && styles.tabBtnTextActive,
                    ]}
                  >
                    Irrigation
                  </Text>
                </TouchableOpacity>

              </View>

              {/* ─── TAB 1: Spraying Advisory ─── */}
              {activeTab === "spraying" && (
                <View style={styles.tabContentContainer}>
                  {/* Status Banner */}
                  <View
                    style={[
                      styles.suitabilityCard,
                      { backgroundColor: sprayingStatus.bgColor, borderColor: sprayingStatus.badgeColor },
                    ]}
                  >
                    <View style={styles.suitabilityHeader}>
                      <Ionicons
                        name={sprayingStatus.icon}
                        size={26}
                        color={sprayingStatus.badgeColor}
                      />
                      <Text style={[styles.suitabilityTitle, { color: sprayingStatus.badgeColor }]}>
                        {sprayingStatus.status}
                      </Text>
                    </View>
                    <Text style={styles.suitabilityReason}>{sprayingStatus.reason}</Text>
                  </View>

                  {/* Benchmark Comparison Checklist */}
                  <View style={styles.cardBox}>
                    <Text style={styles.cardBoxTitle}>Spraying Parameters Check</Text>

                    <View style={styles.checkItem}>
                      <Ionicons
                        name={tempC >= 20 && tempC <= 28 ? "checkmark-circle" : "close-circle"}
                        size={18}
                        color={tempC >= 20 && tempC <= 28 ? "#4CAF50" : "#E53935"}
                      />
                      <Text style={styles.checkItemText}>
                        Temperature: <Text style={styles.bold}>{tempC}°C</Text> (Optimal: 20–28°C)
                      </Text>
                    </View>

                    <View style={styles.checkItem}>
                      <Ionicons
                        name={windKm <= 15 ? "checkmark-circle" : "close-circle"}
                        size={18}
                        color={windKm <= 15 ? "#4CAF50" : "#E53935"}
                      />
                      <Text style={styles.checkItemText}>
                        Wind Speed: <Text style={styles.bold}>{windKm} km/h</Text> (Optimal: 0–15 km/h)
                      </Text>
                    </View>

                    <View style={styles.checkItem}>
                      <Ionicons
                        name={humidity >= 40 && humidity <= 75 ? "checkmark-circle" : "close-circle"}
                        size={18}
                        color={humidity >= 40 && humidity <= 75 ? "#4CAF50" : "#E53935"}
                      />
                      <Text style={styles.checkItemText}>
                        Humidity: <Text style={styles.bold}>{humidity}%</Text> (Optimal: 40–75%)
                      </Text>
                    </View>

                    <View style={styles.checkItem}>
                      <Ionicons
                        name={rainMm === 0 ? "checkmark-circle" : "close-circle"}
                        size={18}
                        color={rainMm === 0 ? "#4CAF50" : "#E53935"}
                      />
                      <Text style={styles.checkItemText}>
                        Rain Risk: <Text style={styles.bold}>{rainMm > 0 ? `${rainMm} mm` : "No Rain"}</Text> (Optimal: No Rain)
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* ─── TAB 2: Irrigation Advisory ─── */}
              {activeTab === "irrigation" && (
                <View style={styles.tabContentContainer}>
                  <View
                    style={[
                      styles.suitabilityCard,
                      { backgroundColor: irrigationStatus.bgColor, borderColor: irrigationStatus.color },
                    ]}
                  >
                    <View style={styles.suitabilityHeader}>
                      <Ionicons name="water" size={26} color={irrigationStatus.color} />
                      <Text style={[styles.suitabilityTitle, { color: irrigationStatus.color }]}>
                        {irrigationStatus.recommendation}
                      </Text>
                    </View>
                    <Text style={styles.suitabilityReason}>{irrigationStatus.desc}</Text>
                  </View>

                  <View style={styles.cardBox}>
                    <Text style={styles.cardBoxTitle}>Water Management Tips</Text>
                    <Text style={styles.tipText}>
                      💧 <Text style={{ fontWeight: "700" }}>Morning Irrigation:</Text> Best executed between 6:00 AM – 8:00 AM to minimize evaporation loss.
                    </Text>
                    <Text style={styles.tipText}>
                      🌿 <Text style={{ fontWeight: "700" }}>Soil Moisture Check:</Text> Inspect top 2 inches of soil before running pumps.
                    </Text>
                    <Text style={styles.tipText}>
                      ⚡ <Text style={{ fontWeight: "700" }}>Drip Irrigation:</Text> Reduces water consumption by up to 50% during dry spells.
                    </Text>
                  </View>
                </View>
              )}

             

              {/* ─── AI Agronomist Voice Advisory Card ─── */}
              <View style={{ marginHorizontal: 16, marginTop: 14, marginBottom: 20 }}>
                {adviceLoading ? (
                  <View style={styles.adviceLoadingBox}>
                    <ActivityIndicator size="small" color="#2E7D32" />
                    <Text style={styles.adviceLoadingText}>Generating AI crop advisory for {cityName}...</Text>
                  </View>
                ) : (
                  <AIAdviceCard
                    title={`Today's Farm Advisory for ${cityName}`}
                    advice={advice}
                    isPlaying={isPlayingAudio}
                    onClick={handleAudioToggle}
                  />
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <NavigationTab />
    </>
  );
};

export default WeatherScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8F4",
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F8F4",
  },
  loadingContainer: {
    paddingTop: 100,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: "#2E7D32",
    fontWeight: "600",
  },
  // Hero Card
  heroCard: {
    backgroundColor: "#4f84caff",
    marginHorizontal: 4,
    marginTop: 14,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 6,
  },
  liveTag: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  refreshIconBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 6,
    borderRadius: 20,
  },
  heroTempRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 14,
  },
  heroTempText: {
    fontSize: 44,
    fontWeight: "900",
    color: "#fff",
  },
  heroFeelsLike: {
    fontSize: 13,
    color: "#A5D6A7",
    fontWeight: "500",
    marginTop: 2,
  },
  heroConditionBox: {
    alignItems: "center",
  },
  heroConditionText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFE082",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  heroQuickBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 4,
  },
  heroQuickItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroQuickText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  heroQuickDivider: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  // Grid
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  metricCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A2E1A",
    marginTop: 2,
  },
  metricValueSmall: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A2E1A",
    marginTop: 2,
  },

  // Tabs
  tabNavRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 14,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: "#2E7D32",
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    marginLeft: 4,
  },
  tabBtnTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  // Suitability Card
  tabContentContainer: {
    paddingHorizontal: 16,
  },
  suitabilityCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  suitabilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  suitabilityTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
    flex: 1,
  },
  suitabilityReason: {
    fontSize: 13,
    color: "#444",
    lineHeight: 19,
    marginTop: 2,
  },

  // Card Box
  cardBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  cardBoxTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkItemText: {
    fontSize: 13,
    color: "#444",
    marginLeft: 8,
  },
  bold: {
    fontWeight: "700",
    color: "#1A2E1A",
  },
  tipText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
    marginBottom: 8,
  },

  // Forecast
  forecastList: {
    paddingVertical: 4,
    gap: 10,
  },
  forecastCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    width: 90,
    borderWidth: 1,
    borderColor: "#E8F5E9",
    elevation: 2,
    marginRight: 10,
  },
  forecastDay: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B5E20",
  },
  forecastDate: {
    fontSize: 10,
    color: "#888",
    marginTop: 1,
    marginBottom: 2,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A2E1A",
  },
  forecastCond: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
    textAlign: "center",
  },
  forecastDivider: {
    height: 1,
    backgroundColor: "#E8F5E9",
    width: "100%",
    marginVertical: 7,
  },
  forecastMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    gap: 3,
  },
  forecastMetaText: {
    fontSize: 10,
    color: "#555",
    fontWeight: "600",
  },
  sprayBadge: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  sprayBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  forecastLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: "#555",
    fontWeight: "500",
  },

  // AI Advisory
  adviceLoadingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
  },
  adviceLoadingText: {
    fontSize: 13,
    color: "#2E7D32",
    marginLeft: 10,
  },
  aiWrapper: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    elevation: 2,
  },
  aiHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  aiHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1B5E20",
    marginLeft: 8,
  },
  audioBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  audioBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
    marginLeft: 4,
  },
});
