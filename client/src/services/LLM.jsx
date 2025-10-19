import { GoogleGenAI } from "@google/genai";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Initialize AI client
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

// Helper to get chat history safely
async function getChatHistory() {
  try {
    const history = await AsyncStorage.getItem("chatHistory");
    console.log("Loaded chat history:", history);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.log("Error loading chat history:", error);
    return [];
  }
}

// ✅ Main LLM function
export async function LLM(query) {
  try {
    const history = await getChatHistory();
    const chat = await ai.chats.create({
      model: "gemini-2.5-flash",
      history,
      config: {
        systemInstruction: instruction,
    },
    });

    const response1 = await chat.sendMessage({
      message: query,
  });

  const text = response1.text.replace(/[*#@!$%^&()_+={}[\]\\|;:'",.<>/?~-]/g, "")

    // Save chat in history
    const newHistory = [...history, { role: "user", parts: [{ text: query }] }, { role: "model", parts: [{ text }] }];

    await AsyncStorage.setItem("chatHistory", JSON.stringify(newHistory));
    console.log("Chat history updated:", await AsyncStorage.getItem("chatHistory"));

    return text;
  } catch (err) {
    console.error("Error in LLM:", err);
    return "Sorry, there was an issue processing your request.";
  }
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