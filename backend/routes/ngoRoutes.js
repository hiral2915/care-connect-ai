const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  predict, apply, getRequests, getOne, reviewRequest,
} = require("../controllers/ngoController");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const scoreValidation = [
  body("income").isFloat({ min: 0 }).withMessage("Income must be a non-negative number"),
  body("family_size").isInt({ min: 1 }).withMessage("Family size must be at least 1"),
  body("employment_status")
    .isIn(["employed", "self", "unemployed", "informal"])
    .withMessage("Invalid employment status"),
  body("medical_urgency").isInt({ min: 1, max: 10 }).withMessage("Medical urgency must be 1–10"),
  body("age").isInt({ min: 0, max: 120 }).withMessage("Valid age required"),
  body("disability")
    .optional()
    .isIn(["none", "partial", "severe"])
    .withMessage("Disability must be none, partial, or severe"),
];

// POST /api/ngo/predict  (public — score only, no DB write)
router.post("/predict", scoreValidation, validate, predict);

// POST /api/ngo/apply  (public — score + save to DB)
router.post(
  "/apply",
  [
    body("applicant_name").trim().notEmpty().withMessage("Applicant name required"),
    ...scoreValidation,
  ],
  validate,
  apply
);

// GET /api/ngo/requests  (admin only)
router.get("/requests", authenticate, authorize("admin"), getRequests);

// GET /api/ngo/requests/:id  (admin only)
router.get("/requests/:id", authenticate, authorize("admin"), getOne);

// PUT /api/ngo/requests/:id/review  (admin only)
router.put(
  "/requests/:id/review",
  authenticate,
  authorize("admin"),
  [
    body("review_status")
      .isIn(["pending", "approved", "rejected"])
      .withMessage("review_status must be pending, approved, or rejected"),
  ],
  validate,
  reviewRequest
);

module.exports = router;