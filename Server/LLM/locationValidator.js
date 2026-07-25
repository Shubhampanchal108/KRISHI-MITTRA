const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function validateLocationLLM(state, district) {
  try {
    const prompt = `You are a geolocation validation assistant for India.
Your task is to validate if the given State is a real state or union territory of India, and if the given District exists within that state or union territory.

Be lenient with casing, spacing, and minor spelling variations.

Input:
State: "${state}"
District: "${district}"

Rules:
1. If the state is a valid Indian state/union territory, AND the district is a valid district within that state/union territory (accounting for minor spelling errors), answer EXACTLY with the word: valid
2. Otherwise, answer EXACTLY with the word: not valid
3. Respond with ONLY that one word. No explanation, no punctuation, no formatting, no other text.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.0, // deterministic
      max_completion_tokens: 10,
    });

    const result = (response.choices[0]?.message?.content || "").trim().toLowerCase();
    console.log(`LLM validation for State: ${state}, District: ${district} -> Response: "${result}"`);
    
    if (result.includes("not valid") || result.includes("invalid")) {
      return "not valid";
    } else if (result.includes("valid")) {
      return "valid";
    }
    return "not valid";
  } catch (error) {
    console.error("Error in validateLocationLLM:", error);
    // fallback to valid so user is not blocked on network/api key errors, or we can say valid to be safe.
    // However, let's return "valid" on system errors so registration is not permanently broken if Groq rate limits.
    return "valid";
  }
}

module.exports = { validateLocationLLM };
