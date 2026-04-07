const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  submitReview,
  getTutorReviews,
} = require("../controllers/reviewController");

router.post("/submit", authMiddleware, submitReview);
router.get("/tutor/:tutorId", getTutorReviews);

module.exports = router;
