const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },
  district: {
    type: String,
    default: "General",
  },
  state: {
    type: String,
    default: "India",
  },
  googleId: {
    type: String,
    default: "",
  },
  securityQuestion: {
    type: String,
    default: "What is your primary crop?",
  },
  securityAnswer: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
