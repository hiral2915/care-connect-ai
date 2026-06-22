const NgoRequest = require("../models/NgoRequest");
const { calculatePriority } = require("../services/ngoScoring");

// POST /api/ngo/predict  (public — score only, does NOT save)
async function predict(req, res, next) {
  try {
    const {
      income, family_size, employment_status,
      medical_urgency, age, disability,
    } = req.body;

    const result = calculatePriority({
      income:            +income,
      family_size:       +family_size,
      employment_status,
      medical_urgency:   +medical_urgency,
      age:               +age,
      disability:        disability || "none",
    });

    return res.json({
      success: true,
      data: {
        score:       result.score,
        label:       result.label,
        subsidy_pct: result.subsidy_pct,
        factors:     result.factors,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/ngo/apply  (public — score + persist)
async function apply(req, res, next) {
  try {
    const {
      applicant_name, applicant_email, applicant_phone,
      age, gender, income, family_size, employment_status,
      medical_urgency, disability, medical_condition,
    } = req.body;

    const priority = calculatePriority({
      income:            +income,
      family_size:       +family_size,
      employment_status,
      medical_urgency:   +medical_urgency,
      age:               +age,
      disability:        disability || "none",
    });

    const id = await NgoRequest.create({
      user_id:           req.user ? req.user.id : null,
      applicant_name,    applicant_email, applicant_phone,
      age:               +age,   gender,
      income:            +income,
      family_size:       +family_size,
      employment_status,
      medical_urgency:   +medical_urgency,
      disability:        disability || "none",
      medical_condition,
      priority_score:    priority.score,
      priority_label:    priority.label,
      subsidy_pct:       priority.subsidy_pct,
    });

    const request = await NgoRequest.findById(id);

    return res.status(201).json({
      success: true,
      message: "Application submitted. Our team will review and contact you.",
      data: { request, scoring: priority },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/ngo/requests  (admin only)
async function getRequests(req, res, next) {
  try {
    const { review_status, priority_label, page = 1, limit = 20 } = req.query;
    const requests = await NgoRequest.findAll({
      review_status, priority_label,
      page: +page, limit: +limit,
    });
    const stats = await NgoRequest.stats();
    return res.json({ success: true, data: { requests, stats } });
  } catch (err) {
    next(err);
  }
}

// GET /api/ngo/requests/:id  (admin only)
async function getOne(req, res, next) {
  try {
    const request = await NgoRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "NGO request not found" });
    }
    return res.json({ success: true, data: { request } });
  } catch (err) {
    next(err);
  }
}

// PUT /api/ngo/requests/:id/review  (admin only)
async function reviewRequest(req, res, next) {
  try {
    const { review_status, reviewer_notes } = req.body;
    const request = await NgoRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "NGO request not found" });
    }

    await NgoRequest.updateReview(req.params.id, { review_status, reviewer_notes });
    const updated = await NgoRequest.findById(req.params.id);
    return res.json({ success: true, message: "Review updated", data: { request: updated } });
  } catch (err) {
    next(err);
  }
}

module.exports = { predict, apply, getRequests, getOne, reviewRequest };