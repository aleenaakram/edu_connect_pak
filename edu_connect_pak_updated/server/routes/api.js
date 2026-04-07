const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Test Route (public)
router.get("/", (req, res) => {
  res.send("EduConnectPakistan Backend Running");
});

// Protected Profile Route
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
});

module.exports = router;
