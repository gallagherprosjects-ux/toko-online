const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Checkout (wajib login). Harga selalu diambil dari database, bukan dari klien.
router.post("/", auth, async (req, res, next) => {
  const reserved = []; // stok yang sudah dikurangi, dikembalikan bila ada item yang gagal
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) return res.status(400).json({ message: "Keranjang kosong." });

    const lines = [];
    for (const it of items) {
      const qty = Number(it.qty);
      if (!mongoose.isValidObjectId(it.id) || !Number.isInteger(qty) || qty < 1) {
        throw Object.assign(new Error("Data item tidak valid."), { status: 400 });
      }
      // kurangi stok secara atomik; hanya berhasil bila stok masih cukup
      const p = await Product.findOneAndUpdate({ _id: it.id, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { new: true });
      if (!p) {
        const exists = await Product.findById(it.id).select("name");
        throw Object.assign(new Error(exists ? `Stok ${exists.name} tidak cukup.` : "Produk tidak ditemukan."), { status: 400 });
      }
      reserved.push({ id: it.id, qty });
      lines.push({ id: String(p._id), name: p.name, price: p.price, qty });
    }

    const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const order = await Order.create({
      user: req.user.sub,
      email: req.user.email,
      code: "ORD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(),
      items: lines,
      total,
    });
    res.status(201).json({ orderId: order.code, buyer: order.email, items: lines, total, createdAt: order.createdAt });
  } catch (e) {
    await Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));
    next(e);
  }
});

// Riwayat pesanan milik pengguna yang login
router.get("/mine", auth, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.sub }).sort({ createdAt: -1 }).limit(10);
    res.json(orders);
  } catch (e) { next(e); }
});

module.exports = router;
