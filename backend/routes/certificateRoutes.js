const router = require("express").Router();
const {
  generateCertificate,
  getCertificate,
  getMyCertificates,
} = require("../controllers/certificateController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getMyCertificates);
router.post("/generate", protect, generateCertificate);
router.get("/:id", getCertificate);

module.exports = router;
