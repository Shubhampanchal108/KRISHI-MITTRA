const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function liveAudioProcessing(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Audio file not found at ${filePath}`);
      return;
    }

    const audioFile = fs.createReadStream(filePath);
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      response_format: "json",
    });

    console.log("Transcribed Audio:", transcription.text);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a helpful agricultural assistant. STRICT RULE: You must respond ONLY in pure Hindi language using Devanagari script. Do NOT use Hinglish (Latin script) or English. Greet and respond in a friendly tone." },
        { role: "user", content: transcription.text },
      ],
    });

    const responseText = completion.choices[0]?.message?.content;
    console.log("Groq Response:", responseText);
    return responseText;
  } catch (e) {
    console.error("Error processing live audio:", e);
  }
}

async function main() {
  const samplePath = path.join(__dirname, 'sample.wav');
  await liveAudioProcessing(samplePath).catch((e) => console.error('Got error:', e));
}

if (require.main === module) {
  main();
}

module.exports = { liveAudioProcessing };