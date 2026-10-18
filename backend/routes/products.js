const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { auth, manager } = require("../middleware/auth");

const router = express.Router();

// hanya field ini yang boleh dikirim klien (mencegah mass assignment)
const FIELDS = ["name", "price", "stock", "category", "origin", "netto", "desc", "art", "bg", "fg", "featured"];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body && body[k] !== undefined).map((k) => [k, body[k]]));
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SORTS = { terbaru: { createdAt: -1 }, nama: { name: 1 }, "harga-asc": { price: 1 }, "harga-desc": { price: -1 } };

const validId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "ID produk tidak valid." });
  next();
};

// READ (daftar): ?category=Makanan&q=kopi&sort=harga-asc&featured=1&limit=3
router.get("/", async (req, res, next) => {
  try {
    const { category, q, sort, featured, limit } = req.query;
    const filter = {};
    if (category && category !== "Semua") filter.category = String(category);
    if (q) filter.name = { $regex: escapeRe(String(q)), $options: "i" };
    if (featured === "1") filter.featured = true;
    let query = Product.find(filter).sort(SORTS[sort] || SORTS.terbaru);
    if (Number(limit) > 0) query = query.limit(Math.min(Number(limit), 50));
    res.json(await query);
  } catch (e) { next(e); }
});

// READ (detail)
router.get("/:id", validId, async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.json(p);
  } catch (e) { next(e); }
});

// CREATE (hanya pengelola yang login)
router.post("/", auth, manager, async (req, res, next) => {
  try {
    const p = await Product.create(pick(req.body));
    res.status(201).json(p);
  } catch (e) { next(e); }
});

// UPDATE (hanya pengelola yang login)
router.put("/:id", auth, manager, validId, async (req, res, next) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.json(p);
  } catch (e) { next(e); }
});

// DELETE (hanya pengelola yang login)
router.delete("/:id", auth, manager, validId, async (req, res, next) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.json({ message: "Produk dihapus.", id: req.params.id });
  } catch (e) { next(e); }
});

module.exports = router;
