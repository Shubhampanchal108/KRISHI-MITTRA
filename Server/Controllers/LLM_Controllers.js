const { PestScanner } = require("../LLM/pestDetection");
const fs = require("fs");

const pestDetection = async (req, res) => {
  try {
    const file = req.file; // ✅ multer gives file object here
    const { query } = req.body;

    if (!file || !query) {
      return res
        .status(400)
        .json({ error: "Please provide both image and query" });
    }

    // Path to uploaded image
    const imagePath = file.path; // ✅ use this to pass image to your AI model or logic

    const response = await PestScanner(imagePath, query);

    if (!response) {
      return res.json({ response: "No result found" });
    }

    // Processing ke baad file delete kar do
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    return res.json({ response });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { pestDetection };
