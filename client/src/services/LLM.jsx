import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildSystemInstruction, Weather_INS_LLM } from "./instruction";
import { fetchFarmerContext } from "./farmerContext";

const apiKey = process.env.EXPO_PUBLIC_GROQ_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Helper to normalize legacy Gemini or OpenAI format chat history
async function getChatHistory() {
  try {
    const history = await AsyncStorage.getItem("chatHistory");
    if (!history) return [];

    const parsed = JSON.parse(history);
    return parsed.map((item) => {
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

/**
 * Main LLM function using Groq API.
 * Automatically injects real-time Farmer Personal Info, Soil Data, and Weather Conditions into the prompt.
 */
export async function LLM(query, providedContext = null) {
  try {
    const history = await getChatHistory();

    // Fetch complete farmer context (soil, weather, profile) if not directly provided
    const farmerContext = providedContext || (await fetchFarmerContext());
    const systemPrompt = buildSystemInstruction(farmerContext);

    const messages = [
      { role: "system", content: systemPrompt },
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
    return text;
  } catch (err) {
    console.error("Error in LLM:", err);
    return "Sorry, there was an issue processing your request.";
  }
}

/**
 * Weather data advice LLM using Groq API.
 * Enhances weather prompt with farmer profile & soil context if available.
 */
export async function WeatherLLM(data) {
  try {
    const farmerContext = await fetchFarmerContext();
    const profile = farmerContext?.profile || {};
    const soil = farmerContext?.soil || {};

    let extraContext = "";
    if (profile.name || profile.district) {
      extraContext += `Farmer Name: ${profile.name || "Kisan"}, Location: ${profile.district || ""}, ${profile.state || ""}. `;
    }
    if (soil.soilType || soil.phLevel) {
      extraContext += `Soil Type: ${soil.soilType || "N/A"}, pH: ${soil.phLevel || "N/A"}, NPK: N:${soil.nitrogen || "N/A"}% P:${soil.phosphorus || "N/A"}% K:${soil.potassium || "N/A"}%. `;
    }

    const promptUser = `${extraContext}Give me practical farming advice based on this weather data: ${data}`;

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
          { role: "user", content: promptUser },
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
    return rawText.replace(/[*#@!$%^&()_+={}[\]\\|;:'",<>/?~-]/g, "");
  } catch (err) {
    console.error("Error in WeatherLLM:", err);
    return "Unable to fetch weather advice right now.";
  }
}