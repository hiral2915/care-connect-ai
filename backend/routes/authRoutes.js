const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const { register, login, me, updateProfile, changePassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// GET /api/auth/me  (protected)
router.get("/me", authenticate, me);

// PUT /api/auth/profile  (protected)
router.put(
  "/profile",
  authenticate,
  [body("name").optional().trim().notEmpty().withMessage("Name cannot be empty")],
  validate,
  updateProfile
);

// PUT /api/auth/change-password  (protected)
router.put(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  validate,
  changePassword
);

module.exports = router;