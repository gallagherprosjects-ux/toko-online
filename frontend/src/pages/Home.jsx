import { Link } from "react-router-dom";
import { api } from "../api.js";
import useAsync from "../components/useAsync.js";
import ProductCard from "../components/ProductCard.jsx";

const CATS = [
  { name: "Makanan", note: "keripik, madu, sambal" },
  { name: "Minuman", note: "kopi dan teh pilihan" },
  { name: "Fashion", note: "batik dan anyaman" },
  { name: "Souvenir", note: "oleh-oleh kecil" },
];

export default function Home() {
  const feat = useAsync(() => api.products({ featured: 1 }), []);
  const all = useAsync(() => api.products(), []);
  const origins = all.data ? [...new Set(all.data.map((p) => p.origin).filter(Boolean))] : [];

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Hasil tangan pengrajin dan petani kecil</p>
        <h1>Mau belanja apa hari ini?</h1>
        <p className="lead">
          Kopi dari dataran tinggi, batik yang ditulis tangan, sampai sambal roa dari Manado.
          Semuanya dikumpulkan di satu warung.
        </p>
        <div className="hero-cta">
          <Link className="btn" to="/products">Lihat semua produk</Link>
        </div>
        <span className="note" aria-hidden="true">stok batik tinggal sedikit, lho!</span>
      </section>

      <section className="sec">
        <div className="sec-head"><h2>Pilihan minggu ini</h2><Link to="/products">semua produk →</Link></div>
        {feat.state === "loading" && <p className="empty">Sebentar, rak-rak sedang ditata…</p>}
        {feat.state === "error" && <p className="empty error">{feat.error.message}</p>}
        {feat.state === "ok" && <div className="grid">{feat.data.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
      </section>

      <section className="sec">
        <div className="sec-head"><h2>Cari berdasarkan jenis</h2></div>
        <div className="cats">
          {CATS.map((c) => (
            <Link key={c.name} to={`/products?category=${c.name}`} className="cat">
              <strong>{c.name}</strong><span>{c.note}</span>
            </Link>
          ))}
        </div>
      </section>

      {origins.length > 0 && (
        <section className="sec">
          <div className="sec-head"><h2>Datang dari mana saja</h2></div>
          <p className="origins">{origins.map((o, i) => <span key={o}>{o}{i < origins.length - 1 && <i className="sep">·</i>}</span>)}</p>
        </section>
      )}
    </>
  );
}
