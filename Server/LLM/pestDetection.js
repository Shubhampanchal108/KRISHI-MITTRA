const {GoogleGenAI, createUserContent, createPartFromUri,} = require("@google/genai")
const env = require('dotenv').config()

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_KEY,
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
Always respond in Hindi`

let chatHistory = [];

async function PestScanner(imageUrl, query) {
  try {
    // Upload image
    const image = await ai.files.upload({
      file: imageUrl,
    });

    // Create a chat session with model + past history
    const chat = await ai.chats.create({
      model: "gemini-2.5-flash",
      history: chatHistory,
      config: {
        systemInstruction: Instructions,
      },
    });

    // Send query with image
    const response = await chat.sendMessage({
      message: [
        query,
        createPartFromUri(image.uri, image.mimeType),
      ],
    });

    // Clean text response
    const text = response.text.replace(/[*#@!$%^&()_+={}[\]\\|;:'"<>/?~-]/g, "");

    // Update in-memory chat history
    chatHistory.push(
      { role: "user", parts: [{ text: query }] },
      { role: "model", parts: [{ text }] }
    );
    return text;
  } catch (err) {
    console.error("Error in PestScanner:", err);
    return "Sorry, unable to process pest image right now.";
  }
}

module.exports = {PestScanner}
