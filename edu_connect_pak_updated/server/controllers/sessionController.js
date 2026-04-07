const Session = require("../models/session");
const TutorProfile = require("../models/tutorProfile");

const bookSession = async (req, res) => {
  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Access denied. Only students can book sessions." });
  }

  const { tutorId, tutorProfileId, sessionType, date, startTime, endTime } =
    req.body;

  try {
    const tutorProfile = await TutorProfile.findById(tutorProfileId).populate(
      "user"
    );
    if (
      !tutorProfile ||
      tutorProfile.user._id.toString() !== tutorId ||
      tutorProfile.verificationStatus !== "approved"
    ) {
      return res.status(400).json({ message: "Invalid or unapproved tutor" });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.toLocaleString("en-US", {
      weekday: "long",
    });
    const isAvailable = tutorProfile.availability.some(
      (slot) =>
        slot.day === dayOfWeek &&
        slot.timeSlots.some(
          (time) => time.start <= startTime && time.end >= endTime
        )
    );

    if (!isAvailable) {
      return res
        .status(400)
        .json({ message: "Tutor is not available at this time" });
    }

    const overlappingSession = await Session.findOne({
      tutor: tutorId,
      date: requestedDate,
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
      status: { $in: ["pending", "accepted"] },
    });

    if (overlappingSession) {
      return res
        .status(400)
        .json({ message: "Tutor is already booked for this time slot" });
    }

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const durationHours = (end - start) / (1000 * 60 * 60);
    const price = tutorProfile.hourlyRate * durationHours;

    const session = new Session({
      student: req.user.id,
      tutor: tutorId,
      tutorProfile: tutorProfileId,
      sessionType,
      date: requestedDate,
      startTime,
      endTime,
      price,
    });

    await session.save();
    res.status(201).json({ message: "Session booked successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const acceptSession = async (req, res) => {
  if (req.user.role !== "tutor") {
    return res
      .status(403)
      .json({ message: "Access denied. Only tutors can manage sessions." });
  }

  const { sessionId } = req.body;

  try {
    const session = await Session.findById(sessionId);
    if (!session || session.tutor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized or session not found" });
    }
    if (session.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Session cannot be accepted. It is not pending." });
    }

    session.status = "accepted";
    await session.save();
    res.json({ message: "Session accepted successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const declineSession = async (req, res) => {
  if (req.user.role !== "tutor") {
    return res
      .status(403)
      .json({ message: "Access denied. Only tutors can manage sessions." });
  }

  const { sessionId } = req.body;

  try {
    const session = await Session.findById(sessionId);
    if (!session || session.tutor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized or session not found" });
    }
    if (session.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Session cannot be declined. It is not pending." });
    }

    session.status = "declined";
    await session.save();
    res.json({ message: "Session declined successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserSessions = async (req, res) => {
  try {
    let sessions;
    if (req.user.role === "student") {
      sessions = await Session.find({ student: req.user.id })
        .populate("tutor", "name email")
        .populate("tutorProfile", "subjects hourlyRate averageRating");
    } else if (req.user.role === "tutor") {
      sessions = await Session.find({ tutor: req.user.id })
        .populate("student", "name email")
        .populate("tutorProfile", "subjects hourlyRate averageRating");
    } else {
      return res.status(403).json({
        message: "Access denied. Only students and tutors can view sessions.",
      });
    }
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const completeSession = async (req, res) => {
  if (req.user.role !== "tutor") {
    return res
      .status(403)
      .json({ message: "Access denied. Only tutors can complete sessions." });
  }

  const { sessionId } = req.body;

  try {
    const session = await Session.findById(sessionId);
    if (!session || session.tutor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized or session not found" });
    }
    if (session.status !== "accepted") {
      return res.status(400).json({
        message: "Session cannot be completed. It must be accepted first.",
      });
    }

    const now = new Date();
    const sessionEnd = new Date(
      `${session.date.toISOString().split("T")[0]}T${session.endTime}:00Z`
    );
    if (now < sessionEnd) {
      return res.status(400).json({
        message: "Session cannot be completed yet. It has not ended.",
      });
    }

    session.status = "completed";
    await session.save();

    res.json({ message: "Session completed successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTutorSessions = async (req, res) => {
  if (req.user.role !== "tutor") {
    return res
      .status(403)
      .json({ message: "Access denied. Only tutors can view sessions." });
  }
  try {
    const sessions = await Session.find({ tutor: req.user.id })
      .populate("student", "name email")
      .populate("tutorProfile", "subjects hourlyRate averageRating");
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  bookSession,
  acceptSession,
  declineSession,
  getUserSessions,
  completeSession,
  getTutorSessions,
};
