import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { URL } from "../../App";
import { getWeatherInfo } from "./Weather";

/**
 * Fetches and aggregates complete context about the farmer:
 * 1. Personal Info (name, phone, state, district, userId)
 * 2. Soil Data (soilType, phLevel, nitrogen, phosphorus, potassium, organicMatter, moisture)
 * 3. Weather Conditions (temperature, humidity, windSpeed, weather condition, location)
 */
export async function fetchFarmerContext() {
  try {
    const userId = await AsyncStorage.getItem("userId");
    const name = await AsyncStorage.getItem("name");
    const phone = await AsyncStorage.getItem("phone");
    const state = await AsyncStorage.getItem("state");
    const district = await AsyncStorage.getItem("district");

    // 1. Farmer Personal Info
    let profile = {
      userId: userId || "",
      name: name || "",
      phone: phone || "",
      state: state || "",
      district: district || "",
    };

    // Try updating profile from backend if userId is available
    if (userId) {
      try {
        const userRes = await axios.get(`${URL}/api/main/getuser/${userId}`);
        if (userRes.data && userRes.data.name) {
          profile = {
            userId,
            name: userRes.data.name || profile.name,
            phone: userRes.data.phone || profile.phone,
            state: userRes.data.state || profile.state,
            district: userRes.data.district || profile.district,
          };
        }
      } catch (err) {
        console.log("Using cached profile data:", err.message);
      }
    }

    // 2. Soil Data
    let soil = null;
    if (userId) {
      // Check local cache first
      const cachedSoil = await AsyncStorage.getItem(`soilData_${userId}`);
      if (cachedSoil) {
        try {
          soil = JSON.parse(cachedSoil);
        } catch (_) {}
      }

      // Fetch fresh soil data from backend if available
      try {
        const soilRes = await axios.get(`${URL}/api/main/soil/get/user/${userId}`);
        if (soilRes.data && !soilRes.data.msg) {
          soil = soilRes.data;
          await AsyncStorage.setItem(`soilData_${userId}`, JSON.stringify(soilRes.data));
        }
      } catch (err) {
        console.log("Using cached soil data:", err.message);
      }
    }

    // 3. Weather Conditions
    let weather = null;
    const cachedWeather = await AsyncStorage.getItem("weatherData");
    if (cachedWeather) {
      try {
        const wData = JSON.parse(cachedWeather);
        weather = formatWeatherData(wData, profile.district);
      } catch (_) {}
    }

    if (!weather && (profile.district || "Delhi")) {
      try {
        const liveWeather = await getWeatherInfo(profile.district || "Delhi");
        if (liveWeather) {
          weather = formatWeatherData(liveWeather, profile.district);
          await AsyncStorage.setItem("weatherData", JSON.stringify(liveWeather));
        }
      } catch (err) {
        console.log("Error loading weather context:", err.message);
      }
    }

    return { profile, soil, weather };
  } catch (error) {
    console.error("Error fetching farmer context:", error);
    return { profile: {}, soil: null, weather: null };
  }
}

/**
 * Format raw weather API data into clean metrics
 */
function formatWeatherData(data, fallbackDistrict) {
  if (!data) return null;
  const tempC = data.main?.temp ? Math.round(data.main.temp - 273.15) : null;
  const feelsLikeC = data.main?.feels_like ? Math.round(data.main.feels_like - 273.15) : null;
  const humidity = data.main?.humidity ?? null;
  const windKm = data.wind?.speed ? Math.round(data.wind.speed * 3.6) : null;
  const condition = data.weather?.[0]?.description || "clear sky";
  const city = data.name || fallbackDistrict || "Local Region";

  return {
    city,
    temp: tempC,
    feelsLike: feelsLikeC,
    humidity,
    windSpeed: windKm,
    condition,
  };
}
