import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildSystemInstruction, getWeatherInstruction } from "./instruction";
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

export function cleanLLMResponse(text) {
  if (!text || typeof text !== "string") return "";
  let cleaned = text;

  // 1. Remove XML/HTML reasoning tags (<think>, <thought>, <reasoning>, <draft>, etc.)
  cleaned = cleaned.replace(/<(think|thought|reasoning|draft)>[\s\S]*?<\/\1>/gi, "");
  cleaned = cleaned.replace(/<(think|thought|reasoning|draft)>[\s\S]*/gi, "");
  cleaned = cleaned.replace(/<\/?(think|thought|reasoning|draft)>/gi, "");

  // 2. Extract after final markers like "Final Polish:", "Final Hindi Response Structure:", "Final Response:", etc.
  const finalMarkerRegex = /(?:Final\s*(?:Polish|Hindi\s*Response\s*Structure|Hindi\s*Response|Response|Output|Version|Draft|Answer)?|अंतिम\s*उत्तर)\s*[:\-\u2013\u2014]?/gi;
  let matches = [...cleaned.matchAll(finalMarkerRegex)];
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const afterMarker = cleaned.substring(lastMatch.index + lastMatch[0].length).trim();
    if (afterMarker) {
      cleaned = afterMarker;
    }
  }

  // 3. Split into lines and filter out meta/reasoning lines
  const lines = cleaned.split(/\r?\n/);
  const filteredLines = [];

  for (let line of lines) {
    let trimmed = line.trim();
    if (!trimmed) continue;

    // Skip lines with English translation arrows or bullet quotes e.g. - "The crop..." ->
    if (/(?:->|=>|-->)/.test(trimmed) && /[a-zA-Z]/.test(trimmed)) continue;

    // Skip meta headings, constraint checks, or reasoning intros
    if (/^(?:Refining for|Checking constraints|Final Hindi Response Structure|The user likely wants|Let's combine|Internal Monologue|Drafting|Key points|My task|Constraints|Rules|Note|Translate|Candidate|Step \d+|Greeting|Context)/i.test(trimmed)) {
      continue;
    }
    if (/^(?:-\s*)?(?:Pure Hindi|No Hinglish|No English|No reasoning tags|\w+\s*\?)\s*[:\?]?\s*(?:Yes|No|True|False|OK)?$/i.test(trimmed)) {
      continue;
    }

    // Skip pure English lines that contain no Hindi (Devanagari) characters
    const containsHindi = /[\u0900-\u097F]/.test(trimmed);
    const containsEnglish = /[a-zA-Z]{3,}/.test(trimmed);
    if (containsEnglish && !containsHindi) {
      continue;
    }

    filteredLines.push(trimmed);
  }

  cleaned = filteredLines.join("\n").trim();

  // 4. Remove outer brackets [...] or quotes "..." wrapping the text if present
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith('“') && cleaned.endsWith('”'))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // 5. Remove markdown symbols (*, #, _, ~, `)
  cleaned = cleaned.replace(/[*#_~`]/g, "").trim();

  // 6. Clean up residual leading labels
  cleaned = cleaned.replace(/^(?:Final Polish|Final Response|Final Output|Output|उत्तर|जवाब)\s*[:\-\u2013\u2014]?\s*/gi, "").trim();

  // 7. Remove any trailing or leading bracket artifacts
  cleaned = cleaned.replace(/^\[+|\]+$/g, "").trim();

  // 8. Safeguard: if cleaning resulted in empty string but original text had Hindi, extract Hindi
  if (!cleaned && text.trim().length > 0) {
    const hindiMatch = text.match(/[\u0900-\u097F][\s\S]*/);
    if (hindiMatch) {
      cleaned = hindiMatch[0].replace(/<\/?(think|thought|reasoning|draft)>/gi, "").replace(/[*#_~`]/g, "").trim();
    } else {
      cleaned = text.replace(/<\/?(think|thought|reasoning|draft)>/gi, "").replace(/[*#_~`]/g, "").trim();
    }
  }

  return cleaned;
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
    const text = cleanLLMResponse(rawText);

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
          { role: "system", content: getWeatherInstruction() },
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
    return cleanLLMResponse(rawText);
  } catch (err) {
    console.error("Error in WeatherLLM:", err);
    return "Unable to fetch weather advice right now.";
  }
}