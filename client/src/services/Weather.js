import axios from "axios";

const WEATHER_KEY = "2888314fe95f78d2be18da5a6099af04";

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
