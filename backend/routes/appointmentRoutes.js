const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  getAll, getOne, create, update, remove, stats,
} = require("../controllers/appointmentController");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

// GET /api/appointments/stats  (admin)
router.get("/stats", authenticate, authorize("admin"), stats);

// GET /api/appointments  (auth — role-filtered)
router.get("/", authenticate, getAll);

// GET /api/appointments/:id  (auth)
router.get("/:id", authenticate, getOne);

// POST /api/appointments  (patient or admin)
router.post(
  "/",
  authenticate,
  authorize("patient", "admin"),
  [
    body("doctor_id").isInt({ gt: 0 }).withMessage("Valid doctor_id required"),
    body("appointment_date").isDate().withMessage("Valid date (YYYY-MM-DD) required"),
    body("appointment_time")
      .matches(/^\d{2}:\d{2}(:\d{2})?$/)
      .withMessage("Valid time (HH:MM) required"),
  ],
  validate,
  create
);

// PUT /api/appointments/:id  (patient can cancel; admin/doctor can update status)
router.put(
  "/:id",
  authenticate,
  [
    body("status")
      .optional()
      .isIn(["pending", "approved", "rejected", "completed", "cancelled"])
      .withMessage("Invalid status value"),
  ],
  validate,
  update
);

// DELETE /api/appointments/:id  (admin only)
router.delete("/:id", authenticate, authorize("admin"), remove);

module.exports = router;