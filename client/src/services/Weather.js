import axios from "axios";

const WEATHER_KEY = process.env.EXPO_PUBLIC_WEATHER_KEY || "b1b15e88fa797225412429c1c50c122a1";

export async function getWeatherInfo(city) {
  const Weather_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_KEY}`;

  try {
    const response = await axios.get(Weather_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error?.message);
    throw error;
  }
}

export async function getForecastInfo(city) {
  const Forecast_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_KEY}`;

  try {
    const response = await axios.get(Forecast_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching forecast data:", error?.message);
    return null;
  }
}
