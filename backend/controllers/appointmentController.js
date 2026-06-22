const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// GET /api/appointments
// Admin → all; Doctor → their own; Patient → their own
async function getAll(req, res, next) {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const filters = { status, date, page: +page, limit: +limit };

    if (req.user.role === "patient") {
      filters.patientId = req.user.id;
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findByUserId(req.user.id);
      if (doctor) filters.doctorId = doctor.id;
    }
    // admin gets everything

    const appointments = await Appointment.findAll(filters);
    return res.json({ success: true, data: { appointments } });
  } catch (err) {
    next(err);
  }
}

// GET /api/appointments/:id
async function getOne(req, res, next) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Patients can only see their own
    if (req.user.role === "patient" && appt.patient_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({ success: true, data: { appointment: appt } });
  } catch (err) {
    next(err);
  }
}

// POST /api/appointments  (patient or admin)
async function create(req, res, next) {
  try {
    const { doctor_id, appointment_date, appointment_time, department, reason } = req.body;

    // Patients book for themselves; admin can specify patient_id
    const patient_id =
      req.user.role === "admin" && req.body.patient_id
        ? req.body.patient_id
        : req.user.id;

    // Validate doctor exists
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const id = await Appointment.create({
      patient_id, doctor_id, appointment_date, appointment_time,
      department: department || doctor.department, reason,
    });

    const appt = await Appointment.findById(id);
    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: { appointment: appt },
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/appointments/:id
async function update(req, res, next) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const { role, id: userId } = req.user;

    // Patients can only cancel their own pending appointments
    if (role === "patient") {
      if (appt.patient_id !== userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      if (req.body.status && req.body.status !== "cancelled") {
        return res.status(403).json({
          success: false,
          message: "Patients can only cancel appointments",
        });
      }
    }

    await Appointment.update(req.params.id, req.body);
    const updated = await Appointment.findById(req.params.id);
    return res.json({ success: true, message: "Appointment updated", data: { appointment: updated } });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/appointments/:id  (admin only)
async function remove(req, res, next) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    await Appointment.delete(req.params.id);
    return res.json({ success: true, message: "Appointment deleted" });
  } catch (err) {
    next(err);
  }
}

// GET /api/appointments/stats  (admin)
async function stats(req, res, next) {
  try {
    const breakdown = await Appointment.countByStatus();
    return res.json({ success: true, data: { breakdown } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove, stats };