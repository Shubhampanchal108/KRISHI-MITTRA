const Feedback = require("../Models/FeedbackModel");

//Add Feedback
const addFeedback = async (req, res) => {
  try {
    const { userId, feedback } = req.body;

    if (!userId || !feedback) {
      return res.json({ msg: "Please provide all the fields" });
    }

    const newFeedback = new Feedback({
      userId,
      feedback
    });

    await newFeedback.save();
    return res.json(newFeedback);
  } catch (e) {
    console.log(e);
    return res.json({ e });
  }
};


//Get All Feedback
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find();
    return res.json(feedback);
  } catch (e) {
    console.log(e);
    return res.json({ e });
  }
};

//delete Feedback
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFeedback = await Feedback.findByIdAndDelete(id);
    if (!deletedFeedback) {
      return res.json({ msg: "Feedback not found" });
    }
    return res.json({ msg: "Feedback deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.json({ e });
  }
};

module.exports = { addFeedback, getAllFeedback, deleteFeedback };