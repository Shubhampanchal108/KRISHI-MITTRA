import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AgriAISupport from "../src/components/AppServices";
import Header from "../src/components/HeaderTab";
import NavigationTab from "../src/components/NavigationTab";
import AIAdvise from "../src/components/AIAdvise";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { WeatherLLM } from "../src/services/LLM";
import { getWeatherInfo } from "../src/services/Weather";
import { useRouter } from "expo-router";
import { speak } from "../src/utils/TTS";

const HomeScreen = () => {
  const Router = useRouter();
  const [weatherData, setWeatherData] = useState(null);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [adviceLoading, setAdviceLoading] = useState(false);

  //Display weather
  const DisplayWeather = async () => {
    const City = (await AsyncStorage.getItem("district")) || "Delhi";

    const data = await getWeatherInfo(City);
    setWeatherData(data);
    AsyncStorage.setItem("weatherData", JSON.stringify(data));
  };

  useEffect(() => {
    const fetchOnce = async () => {
      setLoading(true);
      const fetched = await AsyncStorage.getItem("weatherFetched");
      if (fetched === "true") {
        setWeatherData(JSON.parse(await AsyncStorage.getItem("weatherData")));
        console.log("Weather data fetched from storage.");
        setLoading(false);
        return;
      }

      await DisplayWeather();
      await AsyncStorage.setItem("weatherFetched", "true");
      console.log("Weather data fetched from API.");
      setLoading(false);
    };

    fetchOnce();
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
        const adviceFetched = await AsyncStorage.getItem("adviceFetched");

        if (adviceFetched === "true") {
          const storedAdvice = await AsyncStorage.getItem("advice");
          if (storedAdvice) {
            setAdvice(storedAdvice);
            console.log("Advice fetched from storage.");
            setAdviceLoading(false);
            return;
          }
        }

        try {
          const response = await WeatherLLM(weatherInfo);
          setAdvice(response);
          await AsyncStorage.setItem("advice", response);
          await AsyncStorage.setItem("adviceFetched", "true");
          console.log("Advice fetched from LLM.");
          setAdviceLoading(false);
        } catch (error) {
          setAdviceLoading(false);
          console.error("Error fetching advice:", error);
        }
      };

      fetchAdvice();
    }
  }, [weatherData]);

  return (
    <>
      <Header />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <Text style={styles.welcome}>
              Welcome {AsyncStorage.getItem("name")}
            </Text>
          </View>

          {/* Weather Card */}
          <TouchableOpacity
            style={styles.weatherCard}
            onPress={() => Router.push("/Weather")}
          >
            {!loading ? (
              <View style={styles.weatherRow}>
                <Ionicons
                  name="partly-sunny-outline"
                  size={40}
                  color="#FFD54F"
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.temp}>
                    {Math.floor(weatherData?.main?.temp - 273.15)}°C
                  </Text>
                  <Text style={styles.weatherText}>
                    {weatherData?.weather[0]?.description} | {weatherData?.name}
                  </Text>
                </View>
              </View>
            ) : (
              <ActivityIndicator size="large" color="green" />
            )}
          </TouchableOpacity>

          <View style={styles.adviceContainer}>
            <Text style={styles.adviceTitle}>Detect Pests and Dieases</Text>
            <Text style={styles.adviceSubtitle}>
              Upload or click an image to detect pest/disease and get instant
              advice.
            </Text>

            <TouchableOpacity
              style={styles.adviceButton}
              onPress={() => Router.push("/Pest")}
            >
                              <Ionicons
                  name="camera-outline"
                  size={30}
                  color="white"
                />
              <Text style={styles.adviceButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content Placeholder */}
          <AgriAISupport />

          {/* AI  Advise Card */}

          {adviceLoading ? (
            <ActivityIndicator size="large" color="green" />
          ) : (
            <AIAdvise
              title="Today's AI Advice"
              secondTitle="Weather-based Farming Tip"
              advice={advice}
              onClick={() => speak(advice)}
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
    backgroundColor: "white",
    paddingHorizontal: 13,
  },
  weatherCard: {
    backgroundColor: "skyblue",
    borderRadius: 15,
    padding: 20,
    marginTop: 17,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  temp: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E7D32",
  },
  weatherText: {
    fontSize: 16,
    color: "#4CAF50",
  },
  welcome: {
    fontSize: 20,
    marginTop: "5%",
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  tabItem: {
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    color: "#777",
  },
  adviceContainer: {
    backgroundColor: "#F0FAF3",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 1,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    minHeight: 100,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 5,
  },
  adviceSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  adviceButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  adviceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    margin: 16,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 12,
    borderRadius: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
    textAlign: "center",
  },
});
