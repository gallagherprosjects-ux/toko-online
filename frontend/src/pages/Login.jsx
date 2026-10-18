import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={state?.from || "/"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      nav(state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-side">
        <p className="eyebrow">Pelanggan lama</p>
        <h2>Selamat datang kembali.</h2>
        <p>Keranjang dan checkout hanya bisa dibuka setelah masuk, supaya pesanan tercatat atas nama kamu.</p>
        <span className="note" aria-hidden="true">lupa password? daftar ulang saja, hehe</span>
      </aside>
      <form className="auth" onSubmit={submit}>
        <h2>Masuk</h2>
        {state?.notice && <div className="alert info">{state.notice}</div>}
        {error && <div className="alert err" role="alert">{error}</div>}
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required autoFocus />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="btn" disabled={busy}>{busy ? "Sebentar…" : "Masuk"}</button>
        <p className="alt">Belum punya akun? <Link to="/register">Daftar di sini</Link></p>
      </form>
    </div>
  );
}
