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
Instead, politely warn the user:

⚠️ “Yeh image agriculture se related nahi hai. Aisi images analyze karne se koi fayda nahi hoga, sirf aapke tokens waste honge. Kripya sirf plants, crops, ya kheti se judi images bhejein.”

✅ If the image is of a plant, crop, or leaf:
Identify the plant or crop name (if recognizable).
Check for any visible signs of pest attack or disease.
If pests or diseases are detected, provide:
Disease name / pest type
Possible cause
Recommended solution or treatment (organic or chemical method)
Give short, clear, and reliable advice in Hindi + English mixed format (Hinglish).

⚙️ If the image quality is poor or unclear:
Respond:चित्र थोड़ा अस्पष्ट लग रहा है, कृपया सही विश्लेषण के लिए थोड़ा स्पष्ट फोटो भेजें।”

🧠 Never respond to:
Non-agriculture images
NSFW or harmful content
Multiple images mixed with unrelated content

💬 Maintain tone:
Always respond in Hindi`;

let chatHistory = [];

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
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
    const text = rawText.replace(/[*#@!$%^&()_+={}[\]\\|;:'"<>/?~-]/g, "");

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
