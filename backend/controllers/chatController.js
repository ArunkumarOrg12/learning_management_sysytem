const Chat = require("../models/Chat");

// @desc    Create doubt thread
// @route   POST /api/chats
exports.createChat = async (req, res) => {
  try {
    const { courseId, subject, message } = req.body;

    const chat = await Chat.create({
      courseId,
      userId: req.user._id,
      subject,
      messages: [
        {
          sender: req.user._id,
          senderRole: "student",
          text: message,
        },
      ],
    });

    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chat threads for a course (student's own)
// @route   GET /api/chats/course/:courseId
exports.getCourseChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      courseId: req.params.courseId,
      userId: req.user._id,
    })
      .populate("userId", "name avatar")
      .populate("messages.sender", "name avatar")
      .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to chat
// @route   PUT /api/chats/:id/reply
exports.replyToChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    chat.messages.push({
      sender: req.user._id,
      senderRole: req.user.role,
      text: req.body.message,
    });

    await chat.save();

    const updated = await Chat.findById(chat._id)
      .populate("userId", "name avatar")
      .populate("messages.sender", "name avatar");

    res.json({ success: true, chat: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve chat
// @route   PUT /api/chats/:id/resolve
exports.resolveChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all chats (admin)
// @route   GET /api/chats/admin/all
exports.getAllChats = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const chats = await Chat.find(query)
      .populate("userId", "name email avatar")
      .populate("courseId", "title")
      .populate("messages.sender", "name avatar")
      .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
