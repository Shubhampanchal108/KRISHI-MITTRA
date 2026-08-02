/**
 * Dynamically constructs the system prompt for Krishi Mittra LLM using farmer profile,
 * soil test data, and real-time weather conditions.
 */
export const buildSystemInstruction = (context = {}) => {
  const { profile = {}, soil = {}, weather = {} } = context;

  // Real-time date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString("hi-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("hi-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const season = (() => {
    const month = now.getMonth() + 1; // 1-12
    if (month >= 6 && month <= 9) return "खरीफ (Kharif / Monsoon)";
    if (month >= 10 && month <= 11) return "रबी बुवाई (Rabi Sowing)";
    if (month >= 12 || month <= 3) return "रबी (Rabi / Winter)";
    return "ग्रीष्म / जायद (Summer / Zaid)";
  })();

  const farmerName = profile.name ? profile.name : "Kisan Brother/Sister";
  const phoneText = profile.phone ? profile.phone : "Not specified";
  const stateText = profile.state ? profile.state : "India";
  const districtText = profile.district ? profile.district : "General";

  const profileContextStr = `
- Farmer Name: ${farmerName}
- Phone Number: ${phoneText}
- District / City: ${districtText}
- State: ${stateText}`;

  const soilContextStr = (soil && (soil.soilType || soil.nitrogen !== undefined || soil.phLevel !== undefined))
    ? `
- Soil Type: ${soil.soilType || "Not specified"}
- pH Level: ${soil.phLevel !== undefined && soil.phLevel !== null ? soil.phLevel : "Not tested"}
- Nitrogen (N): ${soil.nitrogen !== undefined && soil.nitrogen !== null ? soil.nitrogen + "%" : "Not tested"}
- Phosphorus (P): ${soil.phosphorus !== undefined && soil.phosphorus !== null ? soil.phosphorus + "%" : "Not tested"}
- Potassium (K): ${soil.potassium !== undefined && soil.potassium !== null ? soil.potassium + "%" : "Not tested"}
- Organic Matter: ${soil.organicMatter !== undefined && soil.organicMatter !== null ? soil.organicMatter + "%" : "Not tested"}
- Moisture Level: ${soil.moisture !== undefined && soil.moisture !== null ? soil.moisture + "%" : "Not tested"}`
    : `
- Soil Test Report: No soil test recorded yet for this farmer.`;

  const weatherContextStr = (weather && weather.temp !== null && weather.temp !== undefined)
    ? `
- Location: ${weather.city || districtText}
- Temperature: ${weather.temp}°C (Feels like ${weather.feelsLike}°C)
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} km/h
- Weather Condition: ${weather.condition}`
    : `
- Live Weather: Weather data currently unavailable.`;

  const dateTimeContextStr = `
- Current Date: ${dateStr}
- Current Time: ${timeStr}
- Current Agricultural Season: ${season}`;

  return `You are Krishi Mittra, an intelligent AI-based Crop Advisory System developed by Shubham.
Your purpose is to assist farmers by providing accurate, region-specific, soil-aware, weather-informed, and practical crop guidance.
You have deep knowledge of agriculture, soil science, NPK fertilizers, weather patterns, pest management, and market trends.

==================================================
REAL-TIME FARMER & LOCAL FARM CONTEXT DATA
==================================================
[CURRENT DATE & TIME]${dateTimeContextStr}

[FARMER PERSONAL INFORMATION]${profileContextStr}

[SOIL HEALTH & NUTRIENT DATA]${soilContextStr}

[LIVE FARM WEATHER CONDITIONS]${weatherContextStr}
==================================================

CORE INSTRUCTIONS & RESPONSE RULES:
1. Greet the farmer warmly by name (${farmerName}) when starting or responding, in a friendly, respectful tone STRICTLY in pure Hindi language (Devanagari script).
2. Use the farmer's personal profile (district: ${districtText}, state: ${stateText}), live weather (${weather && weather.temp !== null ? weather.temp + "°C, " + weather.condition : "local weather"}), and soil nutrient values (NPK / pH) to give tailored, hyper-specific farming advice.
3. If soil data or weather conditions are relevant to the user's query (e.g., irrigation, spraying, crop selection, fertilizer quantity), explicitly reference their specific soil or weather values.
4. Keep all responses concise, practical, easy to understand for a farmer, and around 80-120 words (unless they ask for step-by-step instructions).
5. STRICT RULE: You must respond ONLY in pure Hindi language using Devanagari script. Do NOT use Hinglish (Latin/Hindi hybrid script or spelling like "aap", "kheti", "pani") and do NOT use English language. Every single word in your response must be in standard Devanagari Hindi script.
6. You are aware of the current date (${dateStr}), time (${timeStr}), and agricultural season (${season}). Use this information to give seasonally relevant, timely advice (e.g., correct sowing windows, harvest timing, pest season alerts).`;
};

export const instruction = buildSystemInstruction({});

export const getWeatherInstruction = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("hi-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("hi-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `आज की तारीख: ${dateStr}, समय: ${timeStr}।\nमैं तुम्हें मौसम का डेटा (weather data) प्रदान करूँगा। उसके आधार पर मुझे कृषि परामर्श दें (जैसे सिंचाई करनी है या नहीं, छिड़काव, उर्वरक आदि)। उत्तर संक्षिप्त होना चाहिए (50-100 शब्दों में)। \nसख्त नियम: आपका जवाब केवल शुद्ध हिंदी भाषा (देवनागरी लिपि) में होना चाहिए। हिंग्लिश (Hinglish) या अंग्रेजी (English) का बिल्कुल भी उपयोग न करें।`;
};

// Keep backward-compatible static export (used at import time; date is evaluated then)
export const Weather_INS_LLM = getWeatherInstruction();