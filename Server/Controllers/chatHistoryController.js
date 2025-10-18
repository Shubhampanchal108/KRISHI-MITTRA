const chatHistoryModel = require('../Models/chatHistoryModel');

//Get Chat History by User ID
const getChatHistoryByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const chatHistory = await chatHistoryModel.find({ userId: id });
        if (!chatHistory) {
            return res.json({ msg: "No chat history found" });
        }
        return res.json(chatHistory);
    } catch (e) {
        console.log(e);
        return res.json({ e });
    }
};

//Add Chat history
const addChatHistory = async (req, res) => {
    try {
        const { userId, query, response } = req.body;

        if(!userId || !query || !response){
            return res.json({ msg: "Please provide all the fields" });
        }

        const newChatHistory = new chatHistoryModel({
            userId,
            query,
            response
        });

        await newChatHistory.save();
        return res.json(newChatHistory);
    } catch (e) {
        console.log(e);
        return res.json({ e });
    }
};

// Delete Chat history by ID (Optional)
const deleteChatHistoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedChatHistory = await chatHistoryModel.findByIdAndDelete(id);
        if (!deletedChatHistory) {
            return res.json({ msg: "Chat history not found" });
        }
        return res.json({ msg: "Chat history deleted successfully" });
    } catch (e) {
        console.log(e);
        return res.json({ e });
    }
};

module.exports = { getChatHistoryByUserId, addChatHistory, deleteChatHistoryById };