const {GoogleGenAI, createUserContent, createPartFromUri,} = require("@google/genai")

const ai = new GoogleGenAI({
    apiKey: "AIzaSyB6ge5vHjsCkirRKi1j8voS7EpC0D6QXB4",
});

async function PestScanner(imageUrl, query) {
  const image = await ai.files.upload({
    file: imageUrl,
  });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      createUserContent([
        query,
        createPartFromUri(image.uri, image.mimeType),
      ]),
    ],
  });
  return response.text.replace(/[*#@!$%^&()_+={}[\]\\|;:'",.<>/?~-]/g, "")
}

module.exports = {PestScanner}
