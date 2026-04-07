const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
// const TutorProfile = require("../models/tutorProfile"); // 🔴 Temporarily removed - will fix later

// Register a new user
const registerUser = async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (in-memory version)
    user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || "student",
    });

    // 🔴 TUTOR PROFILE CODE - Temporarily disabled (will fix later)
    // If role is tutor, create a tutor profile with pending status
    // if (role === "tutor") {
    //   const tutorProfile = new TutorProfile({
    //     user: user.id,  // Changed from user._id to user.id
    //     subjects: [],
    //     hourlyRate: 0,
    //     location: "",
    //     availability: [],
    //     bio: "",
    //     profilePicture: "",
    //     verificationStatus: "pending",
    //   });
    //   await tutorProfile.save();
    // }

    res.status(201).json({ 
      message: "User registered successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token (using user.id instead of user._id)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "mysecretkey123",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser };