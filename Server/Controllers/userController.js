const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Signup controller
const signup = async (req, res) => {
  try {
    const { name, phone, password, district, state } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      phone,
      password: hashedPassword,
      district,
      state,
    });
    await newUser.save();

    //respond with token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser, token });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


//Login controller
const login = async (req, res) => {
    try {
    const { phone, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get specific user details
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by ID
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

//get All users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by ID and delete
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


//update user
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, district, state } = req.body;

    // Find user by ID and update
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

module.exports = {
  signup,
  login,
  getUserDetails,
  getAllUsers,
  deleteUser,
  updateUser
};
