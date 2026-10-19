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
const MONGODB_URI = "mongodb+srv://gallagherprosjects_db_user:RfwLTWtIfTieYp01@cluster0.rypc46y.mongodb.net/toko_online?retryWrites=true&w=majority";

// === KONEKSI GLOBAL UNTUK VERCEL ===
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("MongoDB terhubung.");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Middleware untuk memastikan koneksi DB siap sebelum request diproses
app.use(async (req, res, next) => {
  try {
    await connectDB();
    // Jalankan seed hanya jika koleksi masih kosong
    await seedIfEmpty();
    next();
  } catch (err) {
    console.error("Gagal koneksi DB:", err.message);
    res.status(500).json({ message: "Gagal terhubung ke database." });
  }
});

const allowedOrigins = ["http://localhost:5173", "https://toko-online-g7cu.vercel.app"];

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

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(" ") });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Format data tidak valid." });
  if (String(err.message).startsWith("Origin tidak diizinkan")) return res.status(403).json({ message: err.message });
  res.status(err.status || 500).json({ message: err.message || "Terjadi kesalahan server." });
});

module.exports = app;