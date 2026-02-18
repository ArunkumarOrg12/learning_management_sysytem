const router = require("express").Router();
const {
  getAllCourses,
  getTrendingCourses,
  getCourse,
  enrollCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getAdminCourses,
} = require("../controllers/courseController");
const { protect, isAdmin } = require("../middleware/auth");

router.get("/", getAllCourses);
router.get("/trending", getTrendingCourses);
router.get("/admin/all", protect, isAdmin, getAdminCourses);
router.get("/:id", getCourse);
router.post("/:id/enroll", protect, enrollCourse);
router.post("/", protect, isAdmin, createCourse);
router.put("/:id", protect, isAdmin, updateCourse);
router.delete("/:id", protect, isAdmin, deleteCourse);

module.exports = router;
