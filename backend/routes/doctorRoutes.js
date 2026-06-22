const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  getAll, getOne, create, update, remove, myAppointments,
} = require("../controllers/doctorController");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

// GET /api/doctors  (public)
router.get("/", getAll);

// GET /api/doctors/me/appointments  (doctor only)
router.get("/me/appointments", authenticate, authorize("doctor"), myAppointments);

// GET /api/doctors/:id  (public)
router.get("/:id", getOne);

// POST /api/doctors  (admin only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("specialization").trim().notEmpty().withMessage("Specialization required"),
    body("department")
      .isIn(["dental", "physiotherapy", "general"])
      .withMessage("Department must be dental, physiotherapy, or general"),
  ],
  validate,
  create
);

// PUT /api/doctors/:id  (admin only)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  [
    body("email").optional().isEmail().normalizeEmail(),
    body("department")
      .optional()
      .isIn(["dental", "physiotherapy", "general"]),
  ],
  validate,
  update
);

// DELETE /api/doctors/:id  (admin only)
router.delete("/:id", authenticate, authorize("admin"), remove);

module.exports = router;