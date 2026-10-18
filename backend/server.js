const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const seedIfEmpty = require("./seed");

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/toko_online";

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",").map((s) => s.trim().replace(/\/$/, ""));

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Origin tidak diizinkan oleh CORS: " + origin));
  },
}));
app.use(express.json());

app.get("/", (req, res) => res.json({ app: "Toko Online API", status: "ok" }));
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected", time: new Date().toISOString() }));

app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => res.status(404).json({ message: "Endpoint tidak ditemukan." }));

// penanganan error terpusat
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(" ") });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Format data tidak valid." });
  if (String(err.message).startsWith("Origin tidak diizinkan")) return res.status(403).json({ message: err.message });
  res.status(err.status || 500).json({ message: err.message || "Terjadi kesalahan server." });
});

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB terhubung.");
    await seedIfEmpty();
  })
  .catch((e) => { console.error("Gagal terhubung ke MongoDB:", e.message); process.exit(1); });

module.exports = app;