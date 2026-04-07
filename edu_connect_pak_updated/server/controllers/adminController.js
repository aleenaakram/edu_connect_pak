const User = require("../models/user");
const TutorProfile = require("../models/tutorProfile");
const Session = require("../models/session");

const getDashboardStats = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Only admins can view dashboard stats.",
    });
  }

  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: "student" });
    const tutors = await User.countDocuments({ role: "tutor" });
    const admins = await User.countDocuments({ role: "admin" });
    const totalTutorProfiles = await TutorProfile.countDocuments();
    const approvedTutors = await TutorProfile.countDocuments({
      verificationStatus: "approved",
    });
    const pendingTutors = await TutorProfile.countDocuments({
      verificationStatus: "pending",
    });
    const rejectedTutors = await TutorProfile.countDocuments({
      verificationStatus: "rejected",
    });
    const totalSessions = await Session.countDocuments();
    const pendingSessions = await Session.countDocuments({ status: "pending" });
    const acceptedSessions = await Session.countDocuments({
      status: "accepted",
    });
    const declinedSessions = await Session.countDocuments({
      status: "declined",
    });

    const stats = {
      users: {
        total: totalUsers,
        students,
        tutors,
        admins,
      },
      tutorProfiles: {
        total: totalTutorProfiles,
        approved: approvedTutors,
        pending: pendingTutors,
        rejected: rejectedTutors,
      },
      sessions: {
        total: totalSessions,
        pending: pendingSessions,
        accepted: acceptedSessions,
        declined: declinedSessions,
      },
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTutorVerification = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Only admins can update tutor verification.",
    });
  }

  const { tutorProfileId, verificationStatus, comment } = req.body;

  if (!["approved", "pending", "rejected"].includes(verificationStatus)) {
    return res.status(400).json({
      message:
        'Invalid verification status. Must be "approved", "pending", or "rejected".',
    });
  }

  try {
    const profile = await TutorProfile.findById(tutorProfileId).populate(
      "user",
      "name email"
    );
    if (!profile) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    profile.verificationStatus = verificationStatus;
    if (comment) profile.verificationComment = comment;
    await profile.save();

    res.json({
      message: `Tutor profile ${verificationStatus} successfully`,
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Only admins can view all users." });
  }

  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPendingTutors = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Only admins can view pending tutors.",
    });
  }

  try {
    const tutors = await TutorProfile.find({
      verificationStatus: "pending",
    }).populate("user", "name email");
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// New reporting functions
const getPopularSubjects = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const sessions = await Session.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate("tutorProfile");

    const subjectCount = {};
    sessions.forEach((session) => {
      session.tutorProfile.subjects.forEach((subject) => {
        subjectCount[subject] = (subjectCount[subject] || 0) + 1;
      });
    });

    const subjects = Object.entries(subjectCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getSessionCompletion = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const total = await Session.countDocuments({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    const completed = await Session.countDocuments({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: "completed",
    });
    res.json({ completed, total });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUsageByCity = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const tutorProfiles = await TutorProfile.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    const cityCount = {};
    tutorProfiles.forEach((profile) => {
      const location = profile.location || "Online";
      cityCount[location] = (cityCount[location] || 0) + 1;
    });

    const cities = Object.entries(cityCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
    res.json({ cities });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserGrowth = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const users = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const growth = users.map((u) => ({ date: u._id, count: u.count }));
    res.json({ growth });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  updateTutorVerification,
  getAllUsers,
  getPendingTutors,
  getPopularSubjects,
  getSessionCompletion,
  getUsageByCity,
  getUserGrowth,
};
