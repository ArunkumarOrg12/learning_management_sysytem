const Certificate = require("../models/Certificate");
const Progress = require("../models/Progress");
const Course = require("../models/Course");

// @desc    Generate certificate
// @route   POST /api/certificates/generate
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Verify course completion
    const progress = await Progress.findOne({
      userId: req.user._id,
      courseId,
    });

    if (!progress || progress.completionPercentage < 100) {
      return res.status(400).json({
        success: false,
        message: "Complete all videos before generating certificate",
      });
    }

    // Check if certificate already exists
    const existing = await Certificate.findOne({
      userId: req.user._id,
      courseId,
    });

    if (existing) {
      return res.json({ success: true, certificate: existing });
    }

    const course = await Course.findById(courseId);

    const certificate = await Certificate.create({
      userId: req.user._id,
      courseId,
      studentName: req.user.name,
      courseName: course.title,
    });

    res.status(201).json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get certificate
// @route   GET /api/certificates/:id
exports.getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.id,
    })
      .populate("userId", "name email")
      .populate("courseId", "title instructor");

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my certificates
// @route   GET /api/certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.user._id })
      .populate("courseId", "title thumbnail instructor")
      .sort({ issuedAt: -1 });

    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
