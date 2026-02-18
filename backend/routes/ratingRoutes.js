const router = require("express").Router();
const { addRating, getCourseRatings } = require("../controllers/ratingController");
const { protect } = require("../middleware/auth");

router.post("/", protect, addRating);
router.get("/:courseId", getCourseRatings);

module.exports = router;
