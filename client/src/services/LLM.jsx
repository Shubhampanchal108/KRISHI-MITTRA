import { GoogleGenAI } from "@google/genai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { instruction, Weather_INS_LLM } from "./instruction";

// Initialize AI client
const ai = new GoogleGenAI({
  apiKey: "AIzaSyB6ge5vHjsCkirRKi1j8voS7EpC0D6QXB4",
});

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

  const text = response1.text.replace(/[*#@!$%^&()_+={}[\]\\|;:'"<>/?~-]/g, "")

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


// Weather data advice LLM
export async function WeatherLLM(data) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "give me advice based on this weather data: " + data,
    config: {
      systemInstruction: Weather_INS_LLM,
    },
  });
  console.log(response.text);
  return response.text.replace(/[*#@!$%^&()_+={}[\]\\|;:'",<>/?~-]/g, "");
}