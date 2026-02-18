const router = require("express").Router();
const {
  getDashboard,
  getStudents,
  deleteStudent,
} = require("../controllers/adminController");
const { protect, isAdmin } = require("../middleware/auth");

router.get("/dashboard", protect, isAdmin, getDashboard);
router.get("/students", protect, isAdmin, getStudents);
router.delete("/students/:id", protect, isAdmin, deleteStudent);

module.exports = router;
