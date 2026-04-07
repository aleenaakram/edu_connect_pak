// TEMPORARILY DISABLED - Tutor controller for assignment purposes
// const TutorProfile = require("../models/tutorProfile");

// Simple in-memory storage for assignment (all functions disabled)
const createTutorProfile = async (req, res) => {
  return res.status(503).json({ 
    message: "Tutor profile feature is disabled for this assignment. Focus: Login/Signup testing only.",
    hint: "This feature requires MongoDB which is not used in this assignment"
  });
};

const getTutorProfile = async (req, res) => {
  return res.status(503).json({ 
    message: "Tutor profile feature is disabled for this assignment"
  });
};

const searchTutors = async (req, res) => {
  return res.status(503).json({ 
    message: "Tutor search feature is disabled for this assignment"
  });
};

const getApprovedTutors = async (req, res) => {
  return res.status(503).json({ 
    message: "Tutor list feature is disabled for this assignment"
  });
};

const updateTutorProfile = async (req, res) => {
  return res.status(503).json({ 
    message: "Tutor update feature is disabled for this assignment"
  });
};

// Helper function (not needed but kept for reference)
const validateAvailability = (availability) => {
  return true; // Disabled for assignment
};

module.exports = {
  createTutorProfile,
  getTutorProfile,
  getApprovedTutors,
  searchTutors,
  updateTutorProfile,
};