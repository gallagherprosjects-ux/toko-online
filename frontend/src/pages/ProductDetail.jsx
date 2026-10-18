import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import useAsync from "../components/useAsync.js";
import LabelArt from "../components/LabelArt.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { rupiah } from "../format.js";
import { useCart } from "../CartContext.jsx";
import { trackEvent } from "../analytics.js";

export default function ProductDetail() {
  const { id } = useParams();
  const { data: p, state, error } = useAsync(() => api.product(id), [id]);
  const { add, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const rel = useAsync(() => (p ? api.products({ category: p.category }) : Promise.resolve([])), [p?.category]);

  useEffect(() => {
    if (!p) return;
    document.title = `${p.name} · Warung Nusantara`;
    trackEvent("view_item", { currency: "IDR", value: p.price, items: [{ item_id: p.id, item_name: p.name, item_category: p.category, price: p.price }] });
    setQty(1); setAdded(false);
  }, [p?.id]);

  if (state === "loading") return <p className="empty">Sebentar, mengambil data produk…</p>;
  if (state === "error") {
    return (
      <div className="empty error">
        {error.status === 404 || error.status === 400 ? "Produk ini tidak ditemukan. Mungkin sudah dihapus." : error.message}
        <p><Link to="/products">← kembali ke daftar produk</Link></p>
      </div>
    );
  }

  const related = (rel.data || []).filter((x) => x.id !== p.id).slice(0, 3);

  return (
    <>
      <nav className="crumbs" aria-label="Jejak halaman">
        <Link to="/">Beranda</Link><i className="sep">/</i><Link to="/products">Produk</Link><i className="sep">/</i><span>{p.name}</span>
      </nav>

      <article className="detail">
        <div className="detail-art">
          <LabelArt id={`d-${p.id}`} kind={p.art} bg={p.bg} fg={p.fg} />
          <span className="origin">{p.origin}</span>
        </div>
        <div className="detail-info">
          <p className="eyebrow">{p.category}</p>
          <h1>{p.name}</h1>
          <p className="detail-price"><strong>{rupiah(p.price)}</strong><span> / {p.netto}</span></p>
          <p className="detail-desc">{p.desc}</p>
          <dl className="specs">
            <dt>Asal</dt><dd>{p.origin || "-"}</dd>
            <dt>Isi / ukuran</dt><dd>{p.netto || "-"}</dd>
            <dt>Kategori</dt><dd>{p.category}</dd>
            <dt>Stok</dt><dd className={p.stock <= 10 ? "low" : ""}>{p.stock > 0 ? `${p.stock} tersedia${p.stock <= 10 ? " (menipis)" : ""}` : "Habis"}</dd>
          </dl>
          {p.stock > 0 ? (
            <div className="detail-buy">
              <label className="qty-field">Jumlah
                <input className="qty" type="number" min="1" max={p.stock} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value) || 1, p.stock)))} />
              </label>
              <button className="btn" onClick={() => { add(p, qty); setAdded(true); }}>Masukkan keranjang</button>
            </div>
          ) : <p className="alert err">Stok sedang habis.</p>}
          {added && <p className="added" role="status">Sudah di keranjang ({items.find((i) => i.id === p.id)?.qty || qty}). <Link to="/cart">Lihat keranjang →</Link></p>}
          <Link to="/products" className="back">← kembali ke daftar produk</Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="sec">
          <div className="sec-head"><h2>Produk {p.category.toLowerCase()} lainnya</h2></div>
          <div className="grid">{related.map((x) => <ProductCard key={x.id} p={x} />)}</div>
        </section>
      )}
    </>
  );
}
