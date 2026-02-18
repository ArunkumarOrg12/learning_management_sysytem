const router = require("express").Router();
const {
  createNotification,
  getNotifications,
  markAsRead,
  getAllNotifications,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect, isAdmin } = require("../middleware/auth");

router.get("/", protect, getNotifications);
router.get("/admin/all", protect, isAdmin, getAllNotifications);
router.post("/", protect, isAdmin, createNotification);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, isAdmin, deleteNotification);

module.exports = router;
