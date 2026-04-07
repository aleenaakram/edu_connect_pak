const User = require("../models/user");
const TutorProfile = require("../models/tutorProfile");

const addToWishlist = async (req, res) => {
  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Only students can manage a wishlist" });
  }

  const { tutorProfileId } = req.body;

  try {
    const tutor = await TutorProfile.findById(tutorProfileId);
    if (!tutor || tutor.verificationStatus !== "approved") {
      return res.status(400).json({ message: "Invalid or unapproved tutor" });
    }

    const student = await User.findById(req.user.id);
    if (!student.wishlist.includes(tutorProfileId)) {
      student.wishlist.push(tutorProfileId);
      await student.save();
    }
    res.status(200).json({ message: "Tutor added to wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Only students can manage a wishlist" });
  }

  const { tutorProfileId } = req.body;

  try {
    const student = await User.findById(req.user.id);
    student.wishlist = student.wishlist.filter(
      (id) => id.toString() !== tutorProfileId
    );
    await student.save();
    res.status(200).json({ message: "Tutor removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getWishlist = async (req, res) => {
  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Only students can view their wishlist" });
  }

  try {
    const student = await User.findById(req.user.id).populate({
      path: "wishlist",
      populate: { path: "user", select: "name" },
    });
    res.json(student.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addToWishlist, removeFromWishlist, getWishlist };
