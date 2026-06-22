const db = require("../config/db");

const NgoRequest = {
  async findAll({ review_status, priority_label, page = 1, limit = 20 } = {}) {
    const conditions = [];
    const params = [];

    if (review_status)  { conditions.push("review_status = ?");  params.push(review_status); }
    if (priority_label) { conditions.push("priority_label = ?"); params.push(priority_label); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const [rows] = await db.query(
      `SELECT * FROM ngo_requests ${where}
       ORDER BY priority_score DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      params
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM ngo_requests WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const {
      user_id, applicant_name, applicant_email, applicant_phone,
      age, gender, income, family_size, employment_status,
      medical_urgency, disability, medical_condition,
      priority_score, priority_label, subsidy_pct,
    } = data;

    const [result] = await db.query(
      `INSERT INTO ngo_requests
         (user_id, applicant_name, applicant_email, applicant_phone,
          age, gender, income, family_size, employment_status,
          medical_urgency, disability, medical_condition,
          priority_score, priority_label, subsidy_pct)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id || null, applicant_name, applicant_email || null, applicant_phone || null,
        age, gender || null, income, family_size, employment_status,
        medical_urgency, disability || "none", medical_condition || null,
        priority_score, priority_label, subsidy_pct,
      ]
    );
    return result.insertId;
  },

  async updateReview(id, { review_status, reviewer_notes }) {
    const [result] = await db.query(
      "UPDATE ngo_requests SET review_status = ?, reviewer_notes = ? WHERE id = ?",
      [review_status, reviewer_notes || null, id]
    );
    return result.affectedRows > 0;
  },

  async stats() {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(priority_label = 'high')   AS high_count,
        SUM(priority_label = 'medium') AS medium_count,
        SUM(priority_label = 'low')    AS low_count,
        SUM(review_status = 'pending') AS pending_review
      FROM ngo_requests
    `);
    return rows[0];
  },
};

module.exports = NgoRequest;