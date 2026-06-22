const db = require("../config/db");

const User = {
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT id, name, email, role, phone, address, dob, gender, is_active, created_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password, role = "patient", phone, address, dob, gender }) {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role, phone, address, dob, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, password, role, phone || null, address || null, dob || null, gender || null]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const allowed = ["name", "phone", "address", "dob", "gender"];
    const updates = Object.entries(fields)
      .filter(([k]) => allowed.includes(k))
      .map(([k, v]) => ({ k, v }));

    if (!updates.length) return false;

    const setClause = updates.map((u) => `${u.k} = ?`).join(", ");
    const values = updates.map((u) => u.v);
    values.push(id);

    const [result] = await db.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async updatePassword(id, hashedPassword) {
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  },

  async list({ role, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const where = role ? "WHERE role = ?" : "";
    const params = role ? [role, limit, offset] : [limit, offset];
    const [rows] = await db.query(
      `SELECT id, name, email, role, phone, is_active, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      params
    );
    return rows;
  },
};

module.exports = User;