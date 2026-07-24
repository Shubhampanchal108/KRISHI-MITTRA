import AsyncStorage from "@react-native-async-storage/async-storage";
import { instruction, Weather_INS_LLM } from "./instruction";

const apiKey = process.env.EXPO_PUBLIC_GROQ_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Helper to normalize legacy Gemini or OpenAI format chat history
async function getChatHistory() {
  try {
    const history = await AsyncStorage.getItem("chatHistory");
    console.log("Loaded chat history:", history);
    if (!history) return [];

    const parsed = JSON.parse(history);
    return parsed.map((item) => {
      // Legacy Gemini format handling
      if (item.parts && Array.isArray(item.parts)) {
        return {
          role: item.role === "model" ? "assistant" : "user",
          content: item.parts[0]?.text || "",
        };
      }
      return {
        role: item.role === "model" ? "assistant" : item.role,
        content: item.content || item.text || "",
      };
    });
  } catch (error) {
    console.log("Error loading chat history:", error);
    return [];
  }
}

// ✅ Main LLM function using Groq API
export async function LLM(query) {
  try {
    const history = await getChatHistory();

    const messages = [
      { role: "system", content: instruction },
      ...history,
      { role: "user", content: query },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Groq API Error:", data);
      throw new Error(data.error?.message || "Failed to fetch response from Groq API");
    }

    const rawText = data.choices[0]?.message?.content || "";
    const text = rawText.replace(/[*#@!$%^&()_+={}[\]\\|;:'"<>/?~-]/g, "");

    // Save chat in history with Groq/OpenAI compatible format
    const newHistory = [
      ...history,
      { role: "user", content: query },
      { role: "assistant", content: text },
    ];

    await AsyncStorage.setItem("chatHistory", JSON.stringify(newHistory));
    console.log("Chat history updated:", await AsyncStorage.getItem("chatHistory"));

    return text;
  } catch (err) {
    console.error("Error in LLM:", err);
    return "Sorry, there was an issue processing your request.";
  }
}

// Weather data advice LLM using Groq API
export async function WeatherLLM(data) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: Weather_INS_LLM },
          { role: "user", content: "give me advice based on this weather data: " + data },
        ],
        temperature: 0.7,
      }),
    });

    const resData = await response.json();
    if (!response.ok) {
      console.error("Groq API Weather Error:", resData);
      return "Unable to fetch weather advice right now.";
    }

    const rawText = resData.choices[0]?.message?.content || "";
    console.log("Weather advice:", rawText);
    return rawText.replace(/[*#@!$%^&()_+={}[\]\\|;:'",<>/?~-]/g, "");
  } catch (err) {
    console.error("Error in WeatherLLM:", err);
    return "Unable to fetch weather advice right now.";
  }
}