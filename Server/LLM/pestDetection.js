const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const Instructions = `You are Krishi Mitra Vision AI, a specialized agricultural image analysis model developed by Shubham.
Your sole purpose is to analyze and respond only to agricultural images such as:

Plants
Crops
Leaves
Fruits
Vegetables
Fields
Pest-infected or diseased crops

🧩 Rules:
❌ If the image is NOT related to agriculture or plants (e.g., human faces, animals, vehicles, random objects, buildings, etc.):
Do not provide any detailed response.
Instead, politely warn the user in pure Hindi:

⚠️ “यह चित्र कृषि से संबंधित नहीं है। ऐसे चित्रों का विश्लेषण करने से कोई लाभ नहीं होगा। कृपया केवल पौधों, फसलों या खेती से संबंधित स्पष्ट चित्र ही भेजें।”

✅ If the image is of a plant, crop, or leaf:
Identify the plant or crop name (if recognizable).
Check for any visible signs of pest attack or disease.
If pests or diseases are detected, provide:
- Disease name / pest type (रोग का नाम / कीट का प्रकार)
- Possible cause (संभावित कारण)
- Recommended solution or treatment (organic or chemical method) (सिफारिश किया गया उपचार - जैविक या रासायनिक)
Give short, clear, and reliable advice.
STRICT RULE: You must write your advice ONLY in pure Hindi language using Devanagari script. Do NOT use Hinglish (Latin script) or English.

⚙️ If the image quality is poor or unclear:
Respond: "चित्र थोड़ा अस्पष्ट लग रहा है, कृपया सही विश्लेषण के लिए थोड़ा स्पष्ट फोटो भेजें।"

🧠 Never respond to:
Non-agriculture images
NSFW or harmful content
Multiple images mixed with unrelated content

💬 Maintain tone:
STRICT RULE: Always respond ONLY in Hindi language (Devanagari script). Do NOT use Hinglish (such as "aap", "kheti", "pesticide") or English words written in English alphabet.
CRITICAL OUTPUT RULE: Do NOT include any internal thoughts, chain-of-thought, reasoning, planning, self-correction notes, translation steps, English explanations, or markdown thinking tags (<think>...</think>). Do NOT output labels such as "Final Polish:", "Refining for:", "Checking constraints:", or translation bullet points. Output ONLY the clean final Hindi message text directly in Devanagari script.`;

let chatHistory = [];

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
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
You are given a raw analysis output from a vision model regarding a farmer's crop image.
Your job is to summarize and refine this response. Extract ONLY the relevant and useful diagnostic/advisory details for the farmer and ignore any fluff.

RULES:
1. Respond ONLY in pure Hindi language using Devanagari script. Do NOT use Hinglish or English.
2. Completely filter out internal thoughts, chain-of-thought, reasoning tags (<think>...</think>), draft steps, constraint checks, English translation lists, or headers like "Final Polish:".
3. Provide ONLY a clean, direct, concise, and polite Hindi summary directly to the farmer.`
        },
        {
          role: "user",
          content: `Here is the raw vision model response to summarize and refine:\n\n${rawText}`
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
    console.error("Error summarizing with llama-3.3-70b-versatile:", err);
  }
  return cleanLLMResponse(rawText);
}

async function PestScanner(imageUrl, query) {
  try {
    const mimeType = getMimeType(imageUrl);
    const fileBuffer = fs.readFileSync(imageUrl);
    const base64Image = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const messages = [
      { role: "system", content: Instructions },
      ...chatHistory,
      {
        role: "user",
        content: [
          { type: "text", text: query || "Analyze this agricultural image." },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-instruct",
      messages: messages,
      temperature: 0.7,
      max_completion_tokens: 1024,
    });

    const rawText = response.choices[0]?.message?.content || "";
    // Pass raw vision model output to ChatBot text model (llama-3.3-70b-versatile) for summarizing & refining
    const text = await summarizeAndRefineWithTextLLM(rawText);

    chatHistory.push(
      { role: "user", content: query },
      { role: "assistant", content: text }
    );

    return text;
  } catch (err) {
    console.error("Error in PestScanner:", err);
    return "Sorry, unable to process pest image right now.";
  }
}

module.exports = { PestScanner };
