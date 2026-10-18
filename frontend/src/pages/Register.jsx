import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (f.password.length < 6) return setError("Password minimal 6 karakter.");
    if (f.password !== f.confirm) return setError("Konfirmasi password belum sama.");
    setBusy(true);
    try {
      await register(f.name, f.email, f.password);
      nav("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-side">
        <p className="eyebrow">Pelanggan baru</p>
        <h2>Daftar dulu, belanja kemudian.</h2>
        <p>Cukup nama, email, dan password. Tidak ada verifikasi berbelit dan tidak ada biaya.</p>
        <span className="note" aria-hidden="true">dua menit selesai</span>
      </aside>
      <form className="auth" onSubmit={submit}>
        <h2>Buat akun</h2>
        {error && <div className="alert err" role="alert">{error}</div>}
        <label>Nama lengkap<input value={f.name} onChange={set("name")} required autoFocus /></label>
        <label>Email<input type="email" value={f.email} onChange={set("email")} required /></label>
        <label>Password<input type="password" value={f.password} onChange={set("password")} placeholder="minimal 6 karakter" required /></label>
        <label>Ulangi password<input type="password" value={f.confirm} onChange={set("confirm")} required /></label>
        <button className="btn" disabled={busy}>{busy ? "Sebentar…" : "Daftar"}</button>
        <p className="alt">Sudah punya akun? <Link to="/login">Masuk</Link></p>
      </form>
    </div>
  );
}
