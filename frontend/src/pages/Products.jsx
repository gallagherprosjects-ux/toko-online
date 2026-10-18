import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import useAsync from "../components/useAsync.js";
import ProductCard from "../components/ProductCard.jsx";
import { useCart } from "../CartContext.jsx";

const CATS = ["Semua", "Makanan", "Minuman", "Fashion", "Souvenir"];

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const category = sp.get("category") || "Semua";
  const q = sp.get("q") || "";
  const sort = sp.get("sort") || "terbaru";

  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    if (!v || v === "Semua" || (k === "sort" && v === "terbaru")) n.delete(k); else n.set(k, v);
    setSp(n, { replace: true });
  };

  const { add, items } = useCart();
  const inCart = (id) => items.find((i) => i.id === id)?.qty || 0;
  const { data, state, error } = useAsync(() => api.products({ category, q, sort }), [category, q, sort]);

  return (
    <>
      <section className="page-head">
        <p className="eyebrow">Katalog</p>
        <h1>Daftar produk</h1>
      </section>

      <div className="toolbar">
        <div className="tabs" role="tablist">
          {CATS.map((c, i) => (
            <span key={c}>
              {i > 0 && <i className="sep">/</i>}
              <button role="tab" aria-selected={c === category} className={c === category ? "tab on" : "tab"} onClick={() => set("category", c)}>{c}</button>
            </span>
          ))}
        </div>
        <div className="tools">
          <input type="search" placeholder="cari nama produk…" value={q} onChange={(e) => set("q", e.target.value)} aria-label="Cari produk" />
          <select value={sort} onChange={(e) => set("sort", e.target.value)} aria-label="Urutkan">
            <option value="terbaru">Terbaru</option>
            <option value="nama">Nama A–Z</option>
            <option value="harga-asc">Harga terendah</option>
            <option value="harga-desc">Harga tertinggi</option>
          </select>
        </div>
      </div>

      {state === "loading" && <p className="empty">Sebentar, rak-rak sedang ditata…</p>}
      {state === "error" && <p className="empty error">{error.message}</p>}
      {state === "ok" && data.length === 0 && <p className="empty">Tidak ada produk yang cocok dengan pencarianmu.</p>}
      {state === "ok" && data.length > 0 && (
        <div className="grid">
          {data.map((p) => (
            <ProductCard key={p.id} p={p} action={
              <div className="foot">
                <button className="btn" onClick={() => add(p)} disabled={p.stock < 1}>{p.stock < 1 ? "Habis" : "Masukkan keranjang"}</button>
                <small>{inCart(p.id) > 0 ? `${inCart(p.id)} di keranjang` : `sisa ${p.stock}`}</small>
              </div>
            } />
          ))}
        </div>
      )}
    </>
  );
}
