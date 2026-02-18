const router = require("express").Router();
const {
  register,
  login,
  adminLogin,
  logout,
  refresh,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Student routes
router.post("/register", register);
router.post("/login", login);

// Admin-specific login
router.post("/admin/login", adminLogin);

// Token management
router.post("/refresh", refresh);
router.post("/logout", protect, logout);

// Profile
router.get("/me", protect, getMe);

module.exports = router;
