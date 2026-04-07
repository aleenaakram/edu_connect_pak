const Review = require("../models/review");
const TutorProfile = require("../models/tutorProfile");
const Session = require("../models/session");

const submitReview = async (req, res) => {
  const { sessionId, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const session = await Session.findById(sessionId).populate(
      "tutorProfile student"
    );
    if (!session || session.student._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized or session not found" });
    }
    if (session.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Can only review completed sessions" });
    }

    const existingReview = await Review.findOne({ session: sessionId });
    if (existingReview) {
      return res.status(400).json({ message: "Session already reviewed" });
    }

    const review = new Review({
      student: req.user.id,
      tutor: session.tutorProfile._id,
      session: sessionId,
      rating,
      comment,
    });
    await review.save();

    const tutor = await TutorProfile.findById(session.tutorProfile._id);
    tutor.reviews.push(review._id);
    const reviews = await Review.find({ tutor: tutor._id });
    tutor.averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await tutor.save();

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTutorReviews = async (req, res) => {
  const { tutorId } = req.params;

  try {
    const reviews = await Review.find({ tutor: tutorId })
      .populate("student", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { submitReview, getTutorReviews };
