const router = require("express").Router();
const {
  createChat,
  getCourseChats,
  replyToChat,
  resolveChat,
  getAllChats,
} = require("../controllers/chatController");
const { protect, isAdmin } = require("../middleware/auth");

router.post("/", protect, createChat);
router.get("/course/:courseId", protect, getCourseChats);
router.get("/admin/all", protect, isAdmin, getAllChats);
router.put("/:id/reply", protect, replyToChat);
router.put("/:id/resolve", protect, isAdmin, resolveChat);

module.exports = router;
