const express = require("express")
const Router = express.Router()

const {
  signup,
  login,
  googleLogin,
  getSecurityQuestion,
  getSecurityQuestionByUserId,
  resetPassword,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  updateSecurityQuestion,
  validateLocation,
} = require("../Controllers/userController");

const {
  addSoilData,
  getSoilData,
  getSoilDataByUserId,
  deleteSoilData,
  updateSoilData,
} = require("../Controllers/soilDataController");

const upload = require('../Middlewares/Multer')

const {pestDetection} = require('../Controllers/LLM_Controllers')
const {
  startScan,
  continueChat,
  getHistory,
  deleteSession
} = require("../Controllers/pestSessionController");

const { getChatHistoryByUserId, addChatHistory, deleteChatHistoryById } = require("../Controllers/chatHistoryController");

const {addFeedback, deleteFeedback, getAllFeedback} = require('../Controllers/FeedbackController')

const { getNews } = require('../Controllers/newsController')

//user routes
Router.post("/signup", signup);
Router.post("/login", login);
Router.post("/google-login", googleLogin);
Router.post("/get-security-question", getSecurityQuestion);
Router.post("/reset-password", resetPassword);
Router.put("/update-security-question/:userId", updateSecurityQuestion);
Router.get("/user-security-question/:userId", getSecurityQuestionByUserId);
Router.post("/validate-location", validateLocation);
Router.get("/getallusers", getAllUsers);
Router.get("/getuser/:id", getUserDetails);
Router.put("/updateuser/:userId", updateUser);
Router.delete("/deleteuser/:id", deleteUser);

//Soil routes
Router.post("/soil/add", addSoilData);
Router.get("/soil/get", getSoilData);
Router.get("/soil/get/user/:id", getSoilDataByUserId);
Router.delete("/soil/delete/:id", deleteSoilData);
Router.patch("/soil/update/:id", updateSoilData);

//chatHistory routes
Router.post("/chat/add", addChatHistory);
Router.get("/chat/get/user/:id", getChatHistoryByUserId);
Router.delete("/chat/delete/:id", deleteChatHistoryById);

//pest routes
Router.post("/pest/scan", upload.single("image"), startScan);
Router.post("/pest/chat", continueChat);
Router.get("/pest/history/:userId", getHistory);
Router.delete("/pest/session/:id", deleteSession);

//LLM Routes
Router.post('/pestdetection', upload.single("image"), pestDetection)

//Feedback routes
Router.post("/feedback/add", addFeedback);
Router.get("/feedback/get", getAllFeedback);
Router.delete("/feedback/delete/:id", deleteFeedback);

//News routes
Router.get("/news", getNews);

module.exports = Router;
