const Doctor = require("../models/Doctor");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET /api/doctors
async function getAll(req, res, next) {
  try {
    const { department } = req.query;
    const doctors = await Doctor.findAll({ department });
    return res.json({ success: true, data: { doctors } });
  } catch (err) {
    next(err);
  }
}

// GET /api/doctors/:id
async function getOne(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    return res.json({ success: true, data: { doctor } });
  } catch (err) {
    next(err);
  }
}

// POST /api/doctors  (admin only)
// Optionally creates a linked user account for the doctor
async function create(req, res, next) {
  try {
    const {
      name, email, specialization, department,
      experience_yrs, bio, available_days, consultation_fee,
      createAccount, password,
    } = req.body;

    let userId = null;

    if (createAccount && password) {
      // Check if email already used
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }
      const hashed = await bcrypt.hash(password, 10);
      userId = await User.create({ name, email, password: hashed, role: "doctor" });
    }

    const doctorId = await Doctor.create({
      user_id: userId,
      name, email, specialization, department,
      experience_yrs, bio, available_days, consultation_fee,
    });

    const doctor = await Doctor.findById(doctorId);
    return res.status(201).json({ success: true, message: "Doctor added", data: { doctor } });
  } catch (err) {
    next(err);
  }
}

// PUT /api/doctors/:id  (admin only)
async function update(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    await Doctor.update(req.params.id, req.body);
    const updated = await Doctor.findById(req.params.id);
    return res.json({ success: true, message: "Doctor updated", data: { doctor: updated } });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/doctors/:id  (admin only)
async function remove(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    await Doctor.softDelete(req.params.id);
    return res.json({ success: true, message: "Doctor removed" });
  } catch (err) {
    next(err);
  }
}

// GET /api/doctors/me/appointments  (doctor only — their own)
async function myAppointments(req, res, next) {
  try {
    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found for this account" });
    }
    const Appointment = require("../models/Appointment");
    const appointments = await Appointment.findAll({ doctorId: doctor.id });
    return res.json({ success: true, data: { appointments } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove, myAppointments };