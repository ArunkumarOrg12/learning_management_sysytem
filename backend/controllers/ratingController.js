const Rating = require("../models/Rating");
const Course = require("../models/Course");

// @desc    Add rating & comment
// @route   POST /api/ratings
exports.addRating = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    // Check if already rated
    const existing = await Rating.findOne({
      userId: req.user._id,
      courseId,
    });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
    } else {
      await Rating.create({
        userId: req.user._id,
        courseId,
        rating,
        comment,
      });
    }

    // Recalculate course average
    const ratings = await Rating.find({ courseId });
    const avgRating =
      ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;

    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length,
    });

    res.json({ success: true, message: "Rating submitted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ratings for a course
// @route   GET /api/ratings/:courseId
exports.getCourseRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ courseId: req.params.courseId })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
