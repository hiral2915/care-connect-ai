const db = require("../config/db");

const Appointment = {
  async findAll({ patientId, doctorId, status, date, page = 1, limit = 20 } = {}) {
    const conditions = [];
    const params = [];

    if (patientId) { conditions.push("a.patient_id = ?"); params.push(patientId); }
    if (doctorId)  { conditions.push("a.doctor_id = ?");  params.push(doctorId); }
    if (status)    { conditions.push("a.status = ?");     params.push(status); }
    if (date)      { conditions.push("a.appointment_date = ?"); params.push(date); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const [rows] = await db.query(
      `SELECT
         a.*,
         u.name  AS patient_name, u.email AS patient_email, u.phone AS patient_phone,
         d.name  AS doctor_name,  d.specialization, d.department
       FROM appointments a
       JOIN users   u ON u.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       ${where}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT ? OFFSET ?`,
      params
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT
         a.*,
         u.name  AS patient_name, u.email AS patient_email, u.phone AS patient_phone,
         d.name  AS doctor_name,  d.specialization, d.department
       FROM appointments a
       JOIN users   u ON u.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       WHERE a.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ patient_id, doctor_id, appointment_date, appointment_time, department, reason }) {
    const [result] = await db.query(
      `INSERT INTO appointments
         (patient_id, doctor_id, appointment_date, appointment_time, department, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_date, appointment_time, department || "general", reason || null]
    );
    return result.insertId;
  },

  async updateStatus(id, status, notes = null) {
    const [result] = await db.query(
      "UPDATE appointments SET status = ?, notes = ? WHERE id = ?",
      [status, notes, id]
    );
    return result.affectedRows > 0;
  },

  async update(id, fields) {
    const allowed = ["appointment_date", "appointment_time", "department", "reason", "status", "notes"];
    const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));
    if (!updates.length) return false;

    const setClause = updates.map(([k]) => `${k} = ?`).join(", ");
    const values = [...updates.map(([, v]) => v), id];

    const [result] = await db.query(
      `UPDATE appointments SET ${setClause} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.query("DELETE FROM appointments WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  async countByStatus() {
    const [rows] = await db.query(
      "SELECT status, COUNT(*) AS total FROM appointments GROUP BY status"
    );
    return rows;
  },
};

module.exports = Appointment;