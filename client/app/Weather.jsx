import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavigantionTab from "../src/components/NavigationTab";
import HeaderTab from "../src/components/HeaderTab";
import AIAdviceCard from "../src/components/AIAdvise";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WeatherLLM } from "../src/services/LLM";
import { speak } from "../src/utils/TTS";

export default function WeatherScreen() {
  const [weatherData, setWeatherData] = useState(null);
  const [advice, setAdvice] = useState("");
  const [activeTab, setActiveTab] = useState("spraying");
  const [adviceLoading, setAdviceLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await AsyncStorage.getItem("weatherData");
      if (data) {
        setWeatherData(JSON.parse(data));
        return;
      }
      setWeatherData(data);
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    if (weatherData) {
      const weatherInfo = `Temperature: ${Math.floor(
        weatherData.main?.temp - 273.15
      )}°C, Weather: ${weatherData.weather[0]?.description}, Humidity: ${
        weatherData.main?.humidity
      }%, Wind Speed: ${weatherData.wind?.speed} mph`;

      setAdviceLoading(true);
      const fetchAdvice = async () => {
        const fetchedOnce = await AsyncStorage.getItem("sprayingAdviceFetched");
        if (fetchedOnce === "true") {
          setAdvice(await AsyncStorage.getItem("sprayingAdvice"));
          setAdviceLoading(false);
          return;
        }

        try {
          const response = await WeatherLLM(
            `give me spraying advice according to this data ${weatherInfo}`
          );
          setAdvice(response);
          await AsyncStorage.setItem("sprayingAdvice", response);
          await AsyncStorage.setItem("sprayingAdviceFetched", "true");
          setAdviceLoading(false);
        } catch (error) {
          console.error("Error fetching advice:", error);
        }
      };

      fetchAdvice();
    }
  }, [weatherData]);

  return (
    <>
      <HeaderTab />
      <ScrollView style={styles.container}>
        {/* Current Weather */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Current Weather in {weatherData?.name}
          </Text>
          <View style={styles.tempRow}>
            <Ionicons name="sunny-outline" size={28} color="#007AFF" />
            <Text style={styles.tempText}>
              {Math.floor(weatherData?.main?.temp - 273.15)}°C
            </Text>
          </View>
          <Text style={styles.subHeading}>
            {weatherData?.weather[0]?.description}
          </Text>

          {/* Current Conditions */}
          <Text style={styles.sectionTitle}>Current Conditions</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Ionicons name="thermometer-outline" size={20} color="#007AFF" />
              <Text>
                Feels Like: {Math.floor(weatherData?.main?.feels_like - 273.15)}
                °C
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="water-outline" size={20} color="#007AFF" />
              <Text>Humidity: {weatherData?.main?.humidity}%</Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="navigate-outline" size={20} color="#007AFF" />
              <Text>
                Wind: {Math.floor(weatherData?.wind?.speed * 3.6)} km/h
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="speedometer-outline" size={20} color="#007AFF" />
              <Text>Pressure: {weatherData?.main?.pressure} hPa</Text>
            </View>
          </View>

          {/* Precipitation */}
          <Text style={styles.sectionTitle}>Precipitation</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Ionicons name="rainy-outline" size={20} color="#007AFF" />
              <Text>Rain (1h): {weatherData?.rain?.["1h"] || 0} mm</Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="snow-outline" size={20} color="#007AFF" />
              <Text>Snow (1h): {weatherData?.snow?.["1h"] || 0} mm</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab("spraying")}>
            <Text
              style={
                activeTab === "spraying" ? styles.tabActive : styles.tabInactive
              }
            >
              Spraying Advice
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "spraying" && (
          <>
            {/* Current Conditions Status */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Conditions</Text>

              <View style={styles.infoList}>
                <Text style={styles.infoItem}>
                  Temperature: {Math.floor(weatherData?.main?.temp - 273.15)}°C
                </Text>
                <Text style={styles.infoItem}>
                  Wind Speed: {Math.floor(weatherData?.wind?.speed * 3.6)} km/h
                </Text>
                <Text style={styles.infoItem}>
                  Humidity: {weatherData?.main?.humidity}%
                </Text>
                <Text style={styles.infoItem}>
                  Rain Probability: {weatherData?.rain?.["1h"] || 0}%
                </Text>
              </View>
            </View>

            {/* Current Spraying Status */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Optimal Conditions</Text>

              <View style={styles.statusRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#16be16ff"
                />
                <Text style={[styles.statusText, { color: "#16c716ff" }]}>
                  Best Conditions
                </Text>
              </View>

              <View style={styles.infoList}>
                <Text style={styles.infoItem}>✅ Temperature: 20–28°C</Text>
                <Text style={styles.infoItem}>✅ Wind Speed: 0–15 km/h</Text>
                <Text style={styles.infoItem}>✅ Humidity: 40–60%</Text>
                <Text style={styles.infoItem}>✅ Rain Probability: 1-20%</Text>
              </View>
            </View>

            {/* Current Spraying Status */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Avoid Spraying</Text>

              <View style={styles.statusRow}>
                <Ionicons name="warning-outline" size={20} color="#f70400ff" />
                <Text style={[styles.statusText, { color: "#f70400ff" }]}>
                  Avoid
                </Text>
              </View>

              <View style={styles.infoList}>
                <Text style={styles.infoItem}>
                  ❌ Temperature: 40°C and 4°C
                </Text>
                <Text style={styles.infoItem}>❌ Wind Speed: 25-30 km/h</Text>
                <Text style={styles.infoItem}>❌ Humidity: 70%</Text>
                <Text style={styles.infoItem}>
                  ❌ Rain Probability: 60-100%
                </Text>
              </View>
            </View>

            {adviceLoading ? (
              <ActivityIndicator size="large" color="green" />
            ) : (
              <View style={styles.Advise}>
                <AIAdviceCard
                  title="Today's Spraying Advice"
                  advice={advice}
                  onClick={() => speak(advice)}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
      <NavigantionTab />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  Advise: {
    marginHorizontal: 10,
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
    paddingHorizontal: 10,
  },
  tabActive: {
    color: "#4CAF50",
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
