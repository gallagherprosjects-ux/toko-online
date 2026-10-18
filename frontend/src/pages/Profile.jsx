import { useAuth } from "../AuthContext.jsx";
import { getToken, api } from "../api.js";
import useAsync from "../components/useAsync.js";
import { rupiah } from "../format.js";

// decode payload JWT hanya untuk ditampilkan; verifikasi sebenarnya tetap di server
function decode(token) {
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export default function Profile() {
  const { user } = useAuth();
  const token = getToken();
  const p = token ? decode(token) : null;
  const fmt = (s) => new Date(s * 1000).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  const orders = useAsync(() => api.myOrders(), []);

  return (
    <div className="member">
      <div className="member-strip" />
      <div className="member-body">
        <p className="eyebrow">Kartu pelanggan</p>
        <h2>{user.name}</h2>
        <dl className="kv">
          <dt>Email</dt><dd>{user.email}</dd>
          {p && (<><dt>Masuk sejak</dt><dd>{fmt(p.iat)}</dd><dt>Sesi habis</dt><dd>{fmt(p.exp)}</dd></>)}
        </dl>

        <div className="nota-orders">
          <p className="eyebrow">Riwayat pesanan</p>
          {orders.state === "loading" && <p className="hint">Memuat…</p>}
          {orders.state === "ok" && orders.data.length === 0 && <p className="hint">Belum ada pesanan.</p>}
          {orders.state === "ok" && orders.data.length > 0 && (
            <ul className="order-list">
              {orders.data.map((o) => (
                <li key={o.id}>
                  <span><b>{o.code}</b><small>{new Date(o.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })} · {o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</small></span>
                  <span>{rupiah(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="hint">Halaman ini hanya terbuka kalau token JWT yang valid tersimpan di localStorage browser. Setelah sesi habis, kamu akan diminta masuk lagi.</p>
      </div>
    </div>
  );
}
