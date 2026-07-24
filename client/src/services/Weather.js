import axios from "axios";

const WEATHER_KEY = process.env.EXPO_PUBLIC_WEATHER_KEY;

export async function getWeatherInfo(city) {
  const Weather_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_KEY}`;

  try {
    const response = await axios.get(Weather_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}
