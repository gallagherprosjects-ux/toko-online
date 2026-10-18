import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../CartContext.jsx";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { trackEvent } from "../analytics.js";
import { rupiah } from "../format.js";

export default function Cart() {
  const { items, setQty, remove, clear, total } = useCart();
  const { user, logout } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const checkout = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await api.order(items.map((i) => ({ id: i.id, qty: i.qty })));
      trackEvent("purchase", {
        transaction_id: res.orderId, value: res.total, currency: "IDR",
        items: res.items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.qty })),
      });
      setOrder(res);
      clear();
    } catch (err) {
      if (err.status === 401) logout(); // token habis -> ProtectedRoute mengarahkan ke login
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  if (order) {
    return (
      <div className="nota success">
        <p className="nota-head">WARUNG NUSANTARA</p>
        <h2>Pesanan masuk. Terima kasih!</h2>
        <p className="nota-meta">No. {order.orderId} · {today}<br />Pembeli: {order.buyer}</p>
        <ul className="lines">
          {order.items.map((i) => (<li key={i.id}><span>{i.name} x{i.qty}</span><span>{rupiah(i.price * i.qty)}</span></li>))}
        </ul>
        <p className="total"><span>Total</span><span>{rupiah(order.total)}</span></p>
        <p className="nota-foot">Ini aplikasi latihan, jadi tidak ada pembayaran atau pengiriman sungguhan.</p>
        <Link className="btn" to="/">Belanja lagi</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="nota">
        <p className="nota-head">NOTA BELANJA</p>
        <p className="empty">Keranjangmu masih kosong. <Link to="/">Lihat-lihat produk dulu</Link></p>
      </div>
    );
  }

  return (
    <div className="nota">
      <p className="nota-head">NOTA BELANJA</p>
      <p className="nota-meta">{today} · atas nama {user?.name}</p>
      {error && <div className="alert err">{error}</div>}
      <table className="table">
        <thead><tr><th>Barang</th><th>Harga</th><th>Jml</th><th>Subtotal</th><th></th></tr></thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td><b>{i.name}</b><small>{i.netto}</small></td>
              <td>{rupiah(i.price)}</td>
              <td><input className="qty" type="number" min="1" max={i.stock} value={i.qty} onChange={(e) => setQty(i.id, Number(e.target.value))} aria-label={`Jumlah ${i.name}`} /></td>
              <td>{rupiah(i.price * i.qty)}</td>
              <td><button className="link-btn danger" onClick={() => remove(i.id)}>coret</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="total"><span>Total</span><span>{rupiah(total)}</span></p>
      <div className="checkout">
        <Link to="/" className="link-btn">← lanjut belanja</Link>
        <button className="btn" onClick={checkout} disabled={busy}>{busy ? "Memproses…" : "Checkout"}</button>
      </div>
    </div>
  );
}
