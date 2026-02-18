const Video = require("../models/Video");
const Course = require("../models/Course");

// @desc    Add video to module
// @route   POST /api/videos
exports.addVideo = async (req, res) => {
  try {
    const { title, youtubeUrl, duration, moduleId, courseId, order, description } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const video = await Video.create({
      title,
      youtubeUrl,
      duration,
      moduleId,
      courseId,
      order,
      description,
    });

    // Add video to module's videos array
    const module = course.modules.id(moduleId);
    if (module) {
      module.videos.push(video._id);
      await course.save();
    }

    res.status(201).json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    res.json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    // Remove from course module
    const course = await Course.findById(video.courseId);
    if (course) {
      const module = course.modules.id(video.moduleId);
      if (module) {
        module.videos.pull(video._id);
        await course.save();
      }
    }

    res.json({ success: true, message: "Video deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get videos for a course
// @route   GET /api/videos/course/:courseId
exports.getCourseVideos = async (req, res) => {
  try {
    const videos = await Video.find({ courseId: req.params.courseId }).sort({ order: 1 });
    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
