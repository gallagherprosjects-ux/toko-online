const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { auth, signToken, canManage } = require("../middleware/auth");

const router = express.Router();
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, canManage: canManage(u.email) });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") return res.status(400).json({ message: "Format data tidak valid." });
    if (!emailRe.test(email)) return res.status(400).json({ message: "Format email tidak valid." });
    if (password.length < 6) return res.status(400).json({ message: "Password minimal 6 karakter." });

    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: "Email sudah terdaftar." });
    const user = await User.create({ name: name.trim(), email, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "Email sudah terdaftar." });
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi." });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    // pesan sengaja sama untuk email tak terdaftar dan password salah, agar tidak membocorkan email mana yang punya akun
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ message: "Email atau password salah." });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(401).json({ message: "Akun tidak ditemukan." });
    res.json(publicUser(user));
  } catch (e) { next(e); }
});

module.exports = router;
