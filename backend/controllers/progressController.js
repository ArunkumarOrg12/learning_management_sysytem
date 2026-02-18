const Progress = require("../models/Progress");
const Video = require("../models/Video");

// @desc    Get progress for a course
// @route   GET /api/progress/:courseId
exports.getProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
    }).populate("completedVideos lastWatchedVideo");

    if (!progress) {
      progress = await Progress.create({
        userId: req.user._id,
        courseId: req.params.courseId,
      });
    }

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark video as watched
// @route   PUT /api/progress/mark-watched
exports.markWatched = async (req, res) => {
  try {
    const { courseId, videoId } = req.body;

    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        userId: req.user._id,
        courseId,
      });
    }

    // Add to completed if not already there
    if (!progress.completedVideos.includes(videoId)) {
      progress.completedVideos.push(videoId);
    }

    progress.lastWatchedVideo = videoId;

    // Calculate completion percentage
    const totalVideos = await Video.countDocuments({ courseId });
    progress.completionPercentage =
      totalVideos > 0
        ? Math.round((progress.completedVideos.length / totalVideos) * 100)
        : 0;

    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update last position
// @route   PUT /api/progress/update-position
exports.updatePosition = async (req, res) => {
  try {
    const { courseId, videoId, position } = req.body;

    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        userId: req.user._id,
        courseId,
      });
    }

    progress.lastWatchedVideo = videoId;
    progress.lastPosition = position;
    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all progress for user (dashboard)
// @route   GET /api/progress
exports.getAllProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id })
      .populate("courseId")
      .populate("lastWatchedVideo");

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
