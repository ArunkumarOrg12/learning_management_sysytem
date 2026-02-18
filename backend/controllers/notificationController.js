const Notification = require("../models/Notification");

// @desc    Create notification (admin)
// @route   POST /api/notifications
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, targetAll, targetUsers } = req.body;

    const notification = await Notification.create({
      title,
      message,
      type,
      targetAll: targetAll || false,
      targetUsers: targetUsers || [],
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get notifications for user
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { targetAll: true },
        { targetUsers: req.user._id },
      ],
    }).sort({ createdAt: -1 });

    // Add read status
    const withReadStatus = notifications.map((n) => ({
      ...n.toObject(),
      isRead: n.readBy.includes(req.user._id),
    }));

    res.json({ success: true, notifications: withReadStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notifications (admin)
// @route   GET /api/notifications/admin/all
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notification (admin)
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
