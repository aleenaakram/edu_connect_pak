const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  updateTutorVerification,
  getAllUsers,
  getPendingTutors,
  getPopularSubjects,
  getSessionCompletion,
  getUsageByCity,
  getUserGrowth,
} = require("../controllers/adminController");

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// Existing routes
router.get("/stats", authMiddleware, adminMiddleware, getDashboardStats);
router.post(
  "/update-tutor-verification",
  authMiddleware,
  adminMiddleware,
  updateTutorVerification
);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.get(
  "/pending-tutors",
  authMiddleware,
  adminMiddleware,
  getPendingTutors
);

// New reporting routes
router.get(
  "/reports/popular-subjects",
  authMiddleware,
  adminMiddleware,
  getPopularSubjects
);
router.get(
  "/reports/session-completion",
  authMiddleware,
  adminMiddleware,
  getSessionCompletion
);
router.get(
  "/reports/usage-by-city",
  authMiddleware,
  adminMiddleware,
  getUsageByCity
);
router.get(
  "/reports/user-growth",
  authMiddleware,
  adminMiddleware,
  getUserGrowth
);

module.exports = router;
