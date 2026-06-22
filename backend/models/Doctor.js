const db = require("../config/db");

const Doctor = {
  async findAll({ department, active = true } = {}) {
    const conditions = [];
    const params = [];

    if (active) { conditions.push("d.is_active = 1"); }
    if (department) { conditions.push("d.department = ?"); params.push(department); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await db.query(
      `SELECT d.*, u.email AS user_email
       FROM doctors d
       LEFT JOIN users u ON u.id = d.user_id
       ${where}
       ORDER BY d.name ASC`,
      params
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT d.*, u.email AS user_email
       FROM doctors d
       LEFT JOIN users u ON u.id = d.user_id
       WHERE d.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await db.query(
      "SELECT * FROM doctors WHERE user_id = ? LIMIT 1",
      [userId]
    );
    return rows[0] || null;
  },

  async create({ user_id, name, email, specialization, department, experience_yrs, bio, available_days, consultation_fee }) {
    const [result] = await db.query(
      `INSERT INTO doctors
         (user_id, name, email, specialization, department, experience_yrs, bio, available_days, consultation_fee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id || null, name, email, specialization,
        department || "general", experience_yrs || 0,
        bio || null, available_days || "Mon,Tue,Wed,Thu,Fri",
        consultation_fee || 0,
      ]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const allowed = [
      "name", "email", "specialization", "department",
      "experience_yrs", "bio", "available_days", "consultation_fee", "is_active",
    ];
    const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));
    if (!updates.length) return false;

    const setClause = updates.map(([k]) => `${k} = ?`).join(", ");
    const values = [...updates.map(([, v]) => v), id];

    const [result] = await db.query(
      `UPDATE doctors SET ${setClause} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.query("DELETE FROM doctors WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  async softDelete(id) {
    const [result] = await db.query(
      "UPDATE doctors SET is_active = 0 WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Doctor;