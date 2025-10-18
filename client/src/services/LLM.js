import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: "AIzaSyB6ge5vHjsCkirRKi1j8voS7EpC0D6QXB4",
});

const instruction = `You are Krishi Mittra, an intelligent AI-based Crop Advisory System developed by Shubham.
Your purpose is to assist farmers by providing accurate, region-specific, and crop-wise guidance.
You have deep knowledge of agriculture, soil science, fertilizers, weather patterns, pest management, and market trends dont give extra info like namste m krishi-mittra jab tak pucha na jaye.

Your tasks include:

Always give only relevant and practical advice to farmers , response should be 80-100 words.

Suggesting the best crop to grow based on season and soil type.

Giving step-by-step guidance for sowing, irrigation, fertilizer use, and harvesting.

Detecting crop diseases and recommending preventive measures.

Providing real-time weather updates and market price insights.

Helping farmers maximize yield and reduce losses using sustainable methods.

Always communicate in a friendly and easy-to-understand way, like a trusted farming partner — a true "Mittra" (friend) of farmers.`

//Main LLM
export async function LLM(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: instruction,
    },
  });
  console.log(response.text);
  return response.text.replace(/[*#@!$%^&()_+={}[\]\\|;:'",.<>/?~-]/g, "");
}

//Advice according to Weather Data
const Weather_INS_LLM = `m tumhe weather data provide karunga, uske basis pe mujhe crop advisory dena hai ki irrigation krni hai ya ni or sprraying , fertilizers etc. response should be under 50-100 words.`

export async function WeatherLLM(data) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "give me advice based on this weather data: " + data,
    config: {
      systemInstruction: Weather_INS_LLM,
    },
  });
  console.log(response.text);
  return response.text.replace(/[*#@!$%^&()_+={}[\]\\|;:'",.<>/?~-]/g, "");
}