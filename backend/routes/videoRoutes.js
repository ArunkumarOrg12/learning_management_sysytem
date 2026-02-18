const router = require("express").Router();
const {
  addVideo,
  updateVideo,
  deleteVideo,
  getCourseVideos,
} = require("../controllers/videoController");
const { protect, isAdmin } = require("../middleware/auth");

router.get("/course/:courseId", getCourseVideos);
router.post("/", protect, isAdmin, addVideo);
router.put("/:id", protect, isAdmin, updateVideo);
router.delete("/:id", protect, isAdmin, deleteVideo);

module.exports = router;
