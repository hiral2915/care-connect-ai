const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/** Generate a signed JWT */
function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, phone, address, dob, gender } = req.body;

    // Check duplicate
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = await User.create({
      name, email, password: hashed,
      role: "patient", // public registration is always patient
      phone, address, dob, gender,
    });

    const user = await User.findById(id);
    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Account deactivated. Contact admin." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user);

    // Strip password before responding
    const { password: _pw, ...safeUser } = user;

    return res.json({
      success: true,
      message: "Login successful",
      data: { token, user: safeUser },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { name, phone, address, dob, gender } = req.body;
    await User.update(req.user.id, { name, phone, address, dob, gender });
    const updated = await User.findById(req.user.id);
    return res.json({ success: true, message: "Profile updated", data: { user: updated } });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const userWithPw = await User.findByEmail(req.user.email);
    const match = await bcrypt.compare(currentPassword, userWithPw.password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(req.user.id, hashed);

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, updateProfile, changePassword };