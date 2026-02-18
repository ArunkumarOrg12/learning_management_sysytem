const router = require("express").Router();
const {
  createOrder,
  verifyPayment,
  getAllPayments,
  getMyPayments,
} = require("../controllers/paymentController");
const { protect, isAdmin } = require("../middleware/auth");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/my", protect, getMyPayments);
router.get("/", protect, isAdmin, getAllPayments);

module.exports = router;
