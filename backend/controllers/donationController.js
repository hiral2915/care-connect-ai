const Donation = require("../models/Donation");

// GET /api/donations  (admin only)
async function getAll(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const donations = await Donation.findAll({ status, page: +page, limit: +limit });
    const totals = await Donation.total();
    return res.json({ success: true, data: { donations, totals } });
  } catch (err) {
    next(err);
  }
}

// POST /api/donations  (public)
async function create(req, res, next) {
  try {
    const { donor_name, donor_email, amount, message } = req.body;

    // Generate a simple payment reference (in production, integrate a payment gateway)
    const payment_ref = `DON-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    const id = await Donation.create({ donor_name, donor_email, amount, message, payment_ref });
    const donation = await Donation.findById(id);

    return res.status(201).json({
      success: true,
      message: "Thank you for your donation! Your contribution will help a patient in need.",
      data: { donation },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/donations/total  (public — for the UI counter)
async function total(req, res, next) {
  try {
    const totals = await Donation.total();
    return res.json({ success: true, data: totals });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, total };