const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  bookSession,
  acceptSession,
  declineSession,
  getUserSessions,
  completeSession,
  getTutorSessions,
} = require("../controllers/sessionController");

router.post("/book", authMiddleware, bookSession);
router.post("/accept", authMiddleware, acceptSession);
router.post("/decline", authMiddleware, declineSession);
router.get("/my-sessions", authMiddleware, getUserSessions);
router.post("/complete", authMiddleware, completeSession);
router.get("/tutor-sessions", authMiddleware, getTutorSessions);

module.exports = router;
