import { Link } from "react-router-dom";
import LabelArt from "./LabelArt.jsx";
import { rupiah } from "../format.js";

// Kartu produk: seluruh kartu menuju halaman detail. Aksi tambahan (mis. tombol keranjang) lewat prop `action`.
export default function ProductCard({ p, action }) {
  return (
    <article className="card">
      <Link to={`/products/${p.id}`} className="card-link" aria-label={`Lihat detail ${p.name}`}>
        <div className="label">
          <LabelArt id={p.id} kind={p.art} bg={p.bg} fg={p.fg} />
          <span className="origin">{p.origin}</span>
        </div>
        <div className="card-body">
          <h3>{p.name}</h3>
          <p className="desc">{p.desc}</p>
          <div className="price-row">
            <strong className="price">{rupiah(p.price)}</strong>
            <span className="netto">/ {p.netto}</span>
          </div>
        </div>
      </Link>
      {action && <div className="card-action">{action}</div>}
    </article>
  );
}
