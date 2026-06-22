const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const { getAll, create, total } = require("../controllers/donationController");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

// GET /api/donations/total  (public — for homepage counter)
router.get("/total", total);

// GET /api/donations  (admin only)
router.get("/", authenticate, authorize("admin"), getAll);

// POST /api/donations  (public)
router.post(
  "/",
  [
    body("donor_name").trim().notEmpty().withMessage("Donor name required"),
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number"),
    body("donor_email").optional().isEmail().normalizeEmail(),
  ],
  validate,
  create
);

module.exports = router;