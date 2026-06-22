const db = require("../config/db");

const Donation = {
  async findAll({ status, page = 1, limit = 20 } = {}) {
    const where = status ? "WHERE status = ?" : "";
    const params = status ? [status] : [];
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const [rows] = await db.query(
      `SELECT * FROM donations ${where} ORDER BY donated_at DESC LIMIT ? OFFSET ?`,
      params
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM donations WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create({ donor_name, donor_email, amount, message, payment_ref }) {
    const [result] = await db.query(
      `INSERT INTO donations (donor_name, donor_email, amount, message, payment_ref, status)
       VALUES (?, ?, ?, ?, ?, 'confirmed')`,
      [donor_name, donor_email || null, amount, message || null, payment_ref || null]
    );
    return result.insertId;
  },

  async total() {
    const [rows] = await db.query(
      "SELECT SUM(amount) AS total, COUNT(*) AS count FROM donations WHERE status = 'confirmed'"
    );
    return rows[0];
  },
};

module.exports = Donation;