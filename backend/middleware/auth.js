const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-ganti-di-production";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "2h";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("JWT_SECRET wajib diisi di production.");
  process.exit(1);
}

const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
// Jika ADMIN_EMAILS kosong, semua pengguna yang sudah login boleh mengelola produk.
const canManage = (email) => adminEmails.length === 0 || adminEmails.includes(String(email).toLowerCase());

const signToken = (user) =>
  jwt.sign({ sub: String(user._id), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// Middleware proteksi: baca "Authorization: Bearer <token>", verifikasi tanda tangan dan masa berlaku.
function auth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Token tidak ditemukan, silakan login." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    const expired = err.name === "TokenExpiredError";
    res.status(401).json({ message: expired ? "Sesi berakhir, silakan login ulang." : "Token tidak valid." });
  }
}

// Dipasang setelah auth: hanya pengelola yang boleh menambah/mengubah/menghapus produk.
function manager(req, res, next) {
  if (!canManage(req.user.email)) return res.status(403).json({ message: "Akun ini tidak punya izin mengelola produk." });
  next();
}

module.exports = { auth, manager, signToken, canManage };
