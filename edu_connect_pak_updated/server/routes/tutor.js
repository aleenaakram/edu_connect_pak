const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTutorProfile,
  getTutorProfile,
  searchTutors,
  getApprovedTutors,
  updateTutorProfile,
} = require("../controllers/tutorController");

// Create tutor profile (protected)
router.post("/profile", authMiddleware, createTutorProfile);

// Get tutor profile (protected)
router.get("/profile", authMiddleware, getTutorProfile);

// Search tutors (public)
router.get("/search", searchTutors);

// Get all approved tutors (protected)
router.get("/approved", authMiddleware, getApprovedTutors);
// Update tutor's profile (protected)
router.put("/profile", authMiddleware, updateTutorProfile);

module.exports = router;
