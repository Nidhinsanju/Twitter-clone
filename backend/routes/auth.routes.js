const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");
const { signToken, setAuthCookie, clearAuthCookie } = require("../utils/jwt");
const { randomAvatarColor, randomBanner } = require("../utils/palette");

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("username")
      .trim()
      .toLowerCase()
      .matches(/^[a-z0-9_]{3,20}$/)
      .withMessage(
        "Username must be 3-20 characters: letters, numbers, underscores only"
      ),
    body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { name, username, email, password } = req.body;

      const existing = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (existing) {
        const field = existing.username === username ? "Username" : "Email";
        return res.status(409).json({ error: `${field} is already taken` });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        username,
        email,
        password: hashed,
        avatarColor: randomAvatarColor(),
        banner: randomBanner(),
      });

      const token = signToken(user._id);
      setAuthCookie(res, req, token);
      res.status(201).json({ user: user.toPublicJSON(user._id) });
    } catch (err) {
      res.status(500).json({ error: "Could not create account", detail: err.message });
    }
  }
);

router.post(
  "/login",
  [
    body("identifier").trim().notEmpty().withMessage("Email or username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { identifier, password } = req.body;
      const query = identifier.includes("@")
        ? { email: identifier.toLowerCase() }
        : { username: identifier.toLowerCase() };

      const user = await User.findOne(query).select("+password");
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = signToken(user._id);
      setAuthCookie(res, req, token);
      res.json({ user: user.toPublicJSON(user._id) });
    } catch (err) {
      res.status(500).json({ error: "Could not log in", detail: err.message });
    }
  }
);

router.post("/logout", (req, res) => {
  clearAuthCookie(res, req);
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: user.toPublicJSON(user._id) });
});

module.exports = router;
