const router = require("express").Router();
const {
  getProgress,
  markWatched,
  updatePosition,
  getAllProgress,
} = require("../controllers/progressController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getAllProgress);
router.get("/:courseId", protect, getProgress);
router.put("/mark-watched", protect, markWatched);
router.put("/update-position", protect, updatePosition);

module.exports = router;
