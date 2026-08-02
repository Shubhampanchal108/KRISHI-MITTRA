const Groq = require("groq-sdk");
const fs = require("fs")
const path = require("path");
const PestSession = require("../Models/pestSessionModel");
const User = require("../Models/userModel");
const SoilData = require("../Models/soilDataModel");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.GROQ_KEY,
});

const INITIAL_SCAN_PROMPT = `You are Krishi Mitra Vision AI, an expert agricultural pathologist.
Analyze this crop image and output your assessment strictly in JSON format.
Your output must contain exactly these keys and nothing else. Do not wrap it in extra words or markdown blocks unless it is standard JSON.

Required JSON format:
{
  "cropName": "Name of the crop (e.g., Tomato, Rice, Maize)",
  "diseaseName": "Name of the disease or pest (e.g., Early Blight, Stem Borer, or Healthy)",
  "confidence": 85, // integer percentage from 0 to 100
  "severity": "Low" | "Moderate" | "High" | "Healthy" | "N/A",
  "diagnosis": {
    "symptoms": "Detailed list of visible symptoms in pure Hindi language",
    "causes": "Underlying pathogens or environmental factors causing this issue in pure Hindi language",
    "organicTreatment": "Non-chemical, eco-friendly treatment methods in pure Hindi language",
    "chemicalTreatment": "Recommended chemical pesticides or treatments if applicable in pure Hindi language",
    "preventativeMeasures": "How to prevent this in future seasons in pure Hindi language",
    "precautions": "Precautions to take while handling infected plants in pure Hindi language"
  },
  "initialResponseText": "A friendly summary of the diagnosis STRICTLY in pure Hindi language (Devanagari script) to start the chat. Do NOT use Hinglish or English."
}

🧩 Rules:
1. If the image is not related to agriculture or plants (e.g. human face, building, random object):
Set "cropName" to "Invalid", "diseaseName" to "Not a plant", "severity" to "N/A", "confidence": 0, "initialResponseText": "⚠️ यह चित्र कृषि या पौधों से संबंधित नहीं है। कृपया पौधे या फसल की पत्ती का स्पष्ट चित्र अपलोड करें।"
2. Keep treatment and advice practical, concise, and clear for a farmer.
3. STRICT LANGUAGE RULE: All diagnostic text fields, treatments, symptoms, and initialResponseText must be written ONLY in pure Hindi language (using Devanagari script). Do NOT use Hinglish (Latin letters) or English language.
4. CRITICAL RULE: Do NOT include any reasoning, internal monologue, thought process, or markdown thinking tags (<think>...</think>). Return ONLY standard JSON.`;

function cleanDiagnosisText(text) {
  if (!text || typeof text !== "string") return "";
  let cleaned = text;
  cleaned = cleaned.replace(/<(think|thought|reasoning|draft)>[\s\S]*?<\/\1>/gi, "");
  cleaned = cleaned.replace(/<\/?(think|thought|reasoning|draft)>/gi, "");
  cleaned = cleaned.replace(/[*#_~`]/g, "").trim();
  return cleaned;
}

function cleanLLMResponse(text) {
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

async function summarizeAndRefineWithTextLLM(rawText) {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) return "";
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are Krishi Mitra Summarizer & Refiner, an intelligent agricultural assistant.
You are given a raw response from a vision AI model analyzing a farmer's crop image or answering a crop diagnosis question.
Your job is to summarize and refine this response into a clean, concise, polite advice directly in pure Hindi language (Devanagari script) for the farmer.

CRITICAL RULES:
1. Extract ONLY useful, relevant agricultural/diagnostic details. Send only details worth sending. Do NOT send useless extra things or meta commentary.
2. Respond ONLY in pure Hindi language using Devanagari script. Do NOT use Hinglish or English words.
3. Filter out internal monologue, thought processes, reasoning tags (<think>...</think>), draft steps, constraint lists, English translation bullets, or headers like "Final Polish:".
4. Provide ONLY the final clean, direct Hindi summary/advice directly to the farmer.`
        },
        {
          role: "user",
          content: `Here is the raw vision response to summarize and refine:\n\n${rawText}`
        }
      ],
      temperature: 0.3,
      max_completion_tokens: 500,
    });

    const refined = response.choices[0]?.message?.content?.trim();
    if (refined) {
      return cleanLLMResponse(refined);
    }
  } catch (err) {
    console.error("Error in summarizeAndRefineWithTextLLM (llama-3.3-70b-versatile):", err);
  }
  return cleanLLMResponse(rawText);
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

// 1. Start Scan
const startScan = async (req, res) => {
  try {
    const file = req.file;
    const { userId } = req.body;

    if (!file) {
      return res.status(400).json({ error: "Please upload an image." });
    }
    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId is required to start a session." });
    }

    const imagePath = file.path;
    const mimeType = getMimeType(imagePath);
    const fileBuffer = fs.readFileSync(imagePath);
    const base64Image = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const messages = [
      { role: "system", content: INITIAL_SCAN_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Scan this agricultural image and return structured diagnosis JSON.",
          },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ];

    const response = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: messages,
      temperature: 0.2,
      max_completion_tokens: 4096,
    });

    const rawText = response.choices[0]?.message?.content || "";
    console.log("Raw Vision Response (truncated):", rawText.slice(0, 300));

    // Strip <think>...</think> and reasoning blocks emitted by qwen models
    const strippedText = cleanDiagnosisText(rawText);

    let parsedResult = null;

    // Helper: try to parse every {...} block found in text (largest first)
    function tryExtractJSON(text) {
      // Remove markdown code fences first
      const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      // Try direct parse
      try { return JSON.parse(cleaned); } catch (_) {}

      // Find all {...} candidates by scanning for balanced braces
      const candidates = [];
      let depth = 0, start = -1;
      for (let i = 0; i < cleaned.length; i++) {
        if (cleaned[i] === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (cleaned[i] === '}') {
          depth--;
          if (depth === 0 && start !== -1) {
            candidates.push(cleaned.slice(start, i + 1));
            start = -1;
          }
        }
      }

      // Try candidates from largest to smallest
      candidates.sort((a, b) => b.length - a.length);
      for (const candidate of candidates) {
        try { return JSON.parse(candidate); } catch (_) {}
      }
      return null;
    }

    parsedResult = tryExtractJSON(strippedText) || tryExtractJSON(rawText);

    if (!parsedResult) {
      console.error("All JSON extraction attempts failed. Raw output snippet:", rawText.slice(0, 500));
    }

    if (parsedResult) {
      // Top-level fallback mapping if diagnosis object is nested differently
      if (!parsedResult.diagnosis && (parsedResult.symptoms || parsedResult.organicTreatment || parsedResult.causes)) {
        parsedResult.diagnosis = {
          symptoms: parsedResult.symptoms || "",
          causes: parsedResult.causes || "",
          organicTreatment: parsedResult.organicTreatment || "",
          chemicalTreatment: parsedResult.chemicalTreatment || "",
          preventativeMeasures: parsedResult.preventativeMeasures || "",
          precautions: parsedResult.precautions || ""
        };
      }

      if (parsedResult.initialResponseText) {
        parsedResult.initialResponseText = await summarizeAndRefineWithTextLLM(parsedResult.initialResponseText);
      }

      if (parsedResult.diagnosis) {
        for (const k in parsedResult.diagnosis) {
          if (typeof parsedResult.diagnosis[k] === "string") {
            parsedResult.diagnosis[k] = cleanDiagnosisText(parsedResult.diagnosis[k]);
          }
        }
      }
    } else {
      const defaultText = cleanLLMResponse(strippedText) || "AI scan is complete. What follow-up questions do you have about this crop?";
      parsedResult = {
        cropName: "फसल का नाम",
        diseaseName: "लक्षण पहचाने गए",
        confidence: 80,
        severity: "Moderate",
        diagnosis: {
          symptoms: "पत्तियों में पीलापन, धब्बे या कीट के लक्षण दिखाई दे रहे हैं।",
          causes: "फंगल या बैक्टीरियल संक्रमण तथा मौसम की नमी के कारण।",
          organicTreatment: "नीम के तेल (Neem Oil) का छिड़काव करें और संक्रमित पत्तियों को हटा दें।",
          chemicalTreatment: "कॉपर ऑक्सीक्लोराइड या उचित फफूंदनाशक का छिड़काव करें।",
          preventativeMeasures: "खेत में जल निकासी और सही फसल चक्र बनाए रखें।",
          precautions: "छिड़काव करते समय दस्ताने और मास्क का प्रयोग करें।"
        },
        initialResponseText: await summarizeAndRefineWithTextLLM(defaultText)
      };
    }

    // Save to server static path format (http://localhost:3000/uploads/filename)
    // We save filename to construct full URL dynamically on client or server
    const imageUrl = `/uploads/${file.filename}`;

    // Create session
    const session = new PestSession({
      userId,
      imageUrl,
      cropName: parsedResult.cropName || "Unknown Crop",
      diseaseName: parsedResult.diseaseName || "Unknown Disease",
      confidence: parsedResult.confidence || 0,
      severity: parsedResult.severity || "N/A",
      diagnosis: parsedResult.diagnosis || {},
      chatHistory: [
        {
          role: "assistant",
          content:
            parsedResult.initialResponseText ||
            `Detected ${parsedResult.diseaseName || "issue"} on ${parsedResult.cropName || "crop"}.`,
        },
      ],
    });

    await session.save();
    return res.status(201).json(session);
  } catch (error) {
    console.error("Start Scan Error:", error);
    return res
      .status(500)
      .json({ error: "AI analysis failed. Please try a clearer image." });
  }
};

// 2. Continue Chat
const continueChat = async (req, res) => {
  try {
    const { sessionId, query } = req.body;
    if (!sessionId || !query) {
      return res
        .status(400)
        .json({ error: "sessionId and query are required." });
    }

    const session = await PestSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    // Load static image file to resend context to vision model
    const relativeImagePath = session.imageUrl.replace("/uploads/", "");
    const absoluteImagePath = path.join(
      __dirname,
      "../Middlewares/uploads",
      relativeImagePath,
    );

    let dataUrl = "";
    if (fs.existsSync(absoluteImagePath)) {
      const mimeType = getMimeType(absoluteImagePath);
      const fileBuffer = fs.readFileSync(absoluteImagePath);
      const base64Image = fileBuffer.toString("base64");
      dataUrl = `data:${mimeType};base64,${base64Image}`;
    }

    // Fetch farmer profile and soil data if available
    let farmerContextText = "";
    if (session.userId) {
      try {
        const user = await User.findById(session.userId);
        const soilData = await SoilData.findOne({ userId: session.userId }).sort({ createdAt: -1 });

        if (user) {
          farmerContextText += `\n- Farmer Name: ${user.name || 'Farmer'}\n- Location: ${user.district || 'General'}, ${user.state || 'India'}\n- Phone: ${user.phone || 'N/A'}`;
        }
        if (soilData) {
          farmerContextText += `\n- Soil Type: ${soilData.soilType || 'N/A'}\n- Soil pH: ${soilData.phLevel || 'N/A'}\n- Soil NPK: N:${soilData.nitrogen}% P:${soilData.phosphorus}% K:${soilData.potassium}%`;
        }
      } catch (err) {
        console.log("Error loading user context for pest chat:", err.message);
      }
    }

    // Construct messages list
    // System instruction sets the persona and tells it to refer to the stored image context.
    const systemPrompt = `You are Krishi Mitra Vision AI, a helpful agricultural assistant.
A farmer has uploaded a picture of their crop. Here is the context of that crop:
- Crop Name: ${session.cropName}
- Disease/Issue: ${session.diseaseName}
- Confidence: ${session.confidence}%
- Severity: ${session.severity}
- Symptoms: ${session.diagnosis.symptoms}
- Organic Treatments: ${session.diagnosis.organicTreatment}
- Chemical Treatments: ${session.diagnosis.chemicalTreatment}${farmerContextText}

Always answer the user's questions about this plant or agricultural topic, referring to their specific soil, location, and plant condition if applicable.
STRICT RULE: You must respond ONLY in pure Hindi language using Devanagari script. Do NOT use Hinglish (Latin/Hindi hybrid script or spelling like "aap", "kheti", "pani") and do NOT use English language. Every single word in your response must be in standard Devanagari Hindi script.
CRITICAL OUTPUT RULE: Do NOT include any internal thoughts, chain-of-thought, reasoning, planning, self-correction notes, translation steps, English explanations, or markdown thinking tags (<think>...</think>). Do NOT output labels such as "Final Polish:", "Refining for:", "Checking constraints:", or translation bullet points. Output ONLY the clean final Hindi message text directly in Devanagari script without any wrapper or meta header.`;

    // Sanitize any existing empty content fields in chatHistory to satisfy Mongoose schema
    session.chatHistory.forEach((msg) => {
      if (!msg.content || !msg.content.trim()) {
        msg.content = "फसल जानकारी";
      }
    });

    const formattedHistory = session.chatHistory.map((msg) => ({
      role: msg.role,
      content: cleanLLMResponse(msg.content) || msg.content,
    }));

    const messages = [{ role: "system", content: systemPrompt }];

    // If we have the image base64, we can attach it as user message context or assistant reference
    // Vision model needs context. Let's include image in the final user message along with query.
    if (dataUrl) {
      // Add all history messages except the last query
      messages.push(...formattedHistory);
      // Last query gets image attached
      messages.push({
        role: "user",
        content: [
          { type: "text", text: query },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      });
    } else {
      messages.push(...formattedHistory);
      messages.push({ role: "user", content: query });
    }

    const response = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: messages,
      temperature: 0.7,
      max_completion_tokens: 800,
    });

    const rawReply = response.choices[0]?.message?.content || "";
    // Step 2: Use ChatBot text model (llama-3.3-70b-versatile) to summarize and refine
    const replyText =
      (await summarizeAndRefineWithTextLLM(rawReply)) ||
      "आपकी फसल के संबंध में यदि कोई और प्रश्न है, तो कृपया पूछें।";

    // Push messages to history
    session.chatHistory.push({ role: "user", content: query });
    session.chatHistory.push({ role: "assistant", content: replyText });
    await session.save();

    return res
      .status(200)
      .json({ reply: replyText, chatHistory: session.chatHistory });
  } catch (error) {
    console.error("Continue Chat Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch response from AI. Please try again." });
  }
};

// 3. Get History
const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }
    const history = await PestSession.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(history);
  } catch (error) {
    console.error("Get History Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 4. Delete Session
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await PestSession.findById(id);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    // Delete image file associated with session
    const relativeImagePath = session.imageUrl.replace("/uploads/", "");
    const absoluteImagePath = path.join(
      __dirname,
      "../Middlewares/uploads",
      relativeImagePath,
    );

    if (fs.existsSync(absoluteImagePath)) {
      fs.unlink(absoluteImagePath, (err) => {
        if (err) console.error("Error deleting session image file:", err);
      });
    }

    await PestSession.findByIdAndDelete(id);
    return res.status(200).json({ message: "Session deleted successfully." });
  } catch (error) {
    console.error("Delete Session Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  startScan,
  continueChat,
  getHistory,
  deleteSession,
};
