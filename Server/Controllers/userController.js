const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validateLocationLLM } = require("../LLM/locationValidator");

// Signup controller
const signup = async (req, res) => {
  try {
    const { name, phone, email, password, district, state, securityQuestion, securityAnswer } = req.body;

    if (password && password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ phone: phone || "___no_phone___" }, { email: email || "___no_email___" }]
    });
    if (existingUser) {
      return res.status(400).json({ message: "User with this phone or email already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = password ? await bcrypt.hash(password, salt) : "";

    // Create a new user
    const newUser = new User({
      name,
      phone: phone || "",
      email: email || "",
      password: hashedPassword,
      district: district || "General",
      state: state || "India",
      securityQuestion: securityQuestion || "What is your primary crop?",
      securityAnswer: securityAnswer ? securityAnswer.trim().toLowerCase() : "",
    });
    await newUser.save();

    // respond with token
    const jwtSecret = process.env.JWT_SECRET || "krishimittrasecretkey123";
    const token = jwt.sign({ userId: newUser._id }, jwtSecret, {
      expiresIn: "7d",
    });

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during signup" });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    // Find user by phone or email
    const query = phone ? { phone } : { email };
    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ message: "User not found with these credentials." });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Please sign in using Google." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate token
    const jwtSecret = process.env.JWT_SECRET || "krishimittrasecretkey123";
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// Google OAuth Login / Signup controller
const googleLogin = async (req, res) => {
  try {
    const { name, email, googleId, picture } = req.body;

    if (!email && !googleId) {
      return res.status(400).json({ message: "Email or Google ID required." });
    }

    let user = await User.findOne({
      $or: [{ email: email || "___no_email___" }, { googleId: googleId || "___no_googleId___" }]
    });

    if (!user) {
      // Register new user via Google
      user = new User({
        name: name || "Farmer",
        email: email || "",
        googleId: googleId || Date.now().toString(),
        phone: "",
        password: "",
        district: "General",
        state: "India",
        securityQuestion: "What is your primary crop?",
        securityAnswer: "google_oauth",
      });
      await user.save();
    } else {
      // Update googleId if missing
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    const jwtSecret = process.env.JWT_SECRET || "krishimittrasecretkey123";
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Google Authentication successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ message: "Server error during Google auth" });
  }
};

// Fetch User's Security Question for Password Recovery
const getSecurityQuestion = async (req, res) => {
  try {
    const { identifier } = req.body; // phone or email
    if (!identifier) {
      return res.status(400).json({ message: "Phone or Email is required." });
    }

    const user = await User.findOne({
      $or: [{ phone: identifier }, { email: identifier }]
    });

    if (!user) {
      return res.status(404).json({ message: "Account not found with this Phone/Email." });
    }

    const hasAnswer = !!(
      user.securityAnswer &&
      user.securityAnswer.trim() !== "" &&
      user.securityAnswer.trim().toLowerCase() !== "google_oauth"
    );

    if (!hasAnswer) {
      return res.status(400).json({
        message: "You didn't set a security question, so we are not able to recover your account.",
      });
    }

    return res.status(200).json({
      securityQuestion: user.securityQuestion || "What is your primary crop?",
      phone: user.phone,
      email: user.email,
    });
  } catch (error) {
    console.error("Get Security Question Error:", error);
    return res.status(500).json({ message: "Server error fetching security question." });
  }
};

// Reset Password using Security Answer
const resetPassword = async (req, res) => {
  try {
    const { identifier, securityAnswer, newPassword } = req.body;

    if (!identifier || !securityAnswer || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({
      $or: [{ phone: identifier }, { email: identifier }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hasAnswer = !!(
      user.securityAnswer &&
      user.securityAnswer.trim() !== "" &&
      user.securityAnswer.trim().toLowerCase() !== "google_oauth"
    );

    if (!hasAnswer) {
      return res.status(400).json({
        message: "You didn't set a security question, so we are not able to recover your account.",
      });
    }

    const normalizedAnswer = securityAnswer.trim().toLowerCase();
    const storedAnswer = (user.securityAnswer || "").trim().toLowerCase();

    if (normalizedAnswer !== storedAnswer) {
      return res.status(400).json({ message: "Incorrect security answer. Please try again." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = Date.now();
    await user.save();

    return res.status(200).json({ message: "Password reset successful! You can now log in." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Server error resetting password." });
  }
};

// Get specific user details
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// get All users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// update user
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, district, state } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, district, state },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get security question by userId (for profile page)
const getSecurityQuestionByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine if a real answer has been set (not the default google_oauth placeholder or empty)
    const hasAnswer = !!(user.securityAnswer &&
      user.securityAnswer.trim() !== "" &&
      user.securityAnswer.trim().toLowerCase() !== "google_oauth");

    return res.status(200).json({
      securityQuestion: user.securityQuestion || "What is your primary crop?",
      hasAnswer,
    });
  } catch (error) {
    console.error("Get Security Question By UserId Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update security question and answer (called after signup)
const updateSecurityQuestion = async (req, res) => {
  try {
    const { userId } = req.params;
    const { securityQuestion, securityAnswer } = req.body;

    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: "Security question and answer are required." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        securityQuestion,
        securityAnswer: securityAnswer.trim().toLowerCase(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Security question updated successfully", user });
  } catch (error) {
    console.error("Update Security Question Error:", error);
    return res.status(500).json({ message: "Server error updating security question" });
  }
};

// Validate state and district using LLM
const validateLocation = async (req, res) => {
  try {
    const { state, district } = req.body;
    if (!state || !district) {
      return res.status(400).json({ message: "State and District are required." });
    }
    const result = await validateLocationLLM(state, district);
    return res.status(200).json({ status: result });
  } catch (error) {
    console.error("validateLocation error:", error);
    return res.status(500).json({ message: "Server error during validation" });
  }
};

module.exports = {
  signup,
  login,
  googleLogin,
  getSecurityQuestion,
  getSecurityQuestionByUserId,
  resetPassword,
  getUserDetails,
  getAllUsers,
  deleteUser,
  updateUser,
  updateSecurityQuestion,
  validateLocation,
};
