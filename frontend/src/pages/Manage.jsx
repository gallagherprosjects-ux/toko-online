import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import useAsync from "../components/useAsync.js";
import { rupiah } from "../format.js";

const CATS = ["Makanan", "Minuman", "Fashion", "Souvenir"];
const ARTS = ["kopi", "teh", "keripik", "batik", "anyaman", "madu", "wayang", "sambal"];
const EMPTY = { name: "", price: "", stock: "", category: "Makanan", origin: "", netto: "", desc: "", art: "keripik", bg: "#8a6a3b", fg: "#e5d1a1", featured: false };

// CRUD produk lewat antarmuka. Halaman ini dilindungi login (ProtectedRoute) dan endpoint tulisnya butuh token JWT.
export default function Manage() {
  const { user, logout } = useAuth();
  const [tick, setTick] = useState(0);
  const { data, state, error } = useAsync(() => api.products({ sort: "nama" }), [tick]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null); // { type: "ok" | "err", text }
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const reset = () => { setForm(EMPTY); setEditId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const body = { ...form, price: Number(form.price), stock: form.stock === "" ? 0 : Number(form.stock) };
    try {
      if (editId) await api.updateProduct(editId, body); else await api.createProduct(body);
      setMsg({ type: "ok", text: editId ? "Produk berhasil diperbarui." : "Produk baru berhasil ditambahkan." });
      reset(); setTick((t) => t + 1);
    } catch (err) {
      if (err.status === 401) return logout(); // sesi habis -> diarahkan ke login
      setMsg({ type: "err", text: err.message });
    } finally { setBusy(false); }
  };

  const edit = (p) => {
    setEditId(p.id); setMsg(null);
    setForm({ name: p.name, price: p.price, stock: p.stock, category: p.category, origin: p.origin, netto: p.netto, desc: p.desc, art: p.art, bg: p.bg, fg: p.fg, featured: !!p.featured });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (p) => {
    if (!window.confirm(`Hapus "${p.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try { await api.deleteProduct(p.id); setMsg({ type: "ok", text: `"${p.name}" sudah dihapus.` }); if (editId === p.id) reset(); setTick((t) => t + 1); }
    catch (err) { if (err.status === 401) return logout(); setMsg({ type: "err", text: err.message }); }
  };

  if (!user.canManage) {
    return (
      <div className="panel-denied">
        <p className="eyebrow">Ruang belakang</p>
        <h1>Khusus pengelola</h1>
        <p>Akun <b>{user.email}</b> tidak punya izin mengelola produk. Hubungi pemilik warung bila kamu merasa seharusnya bisa masuk.</p>
      </div>
    );
  }

  return (
    <>
      <section className="page-head">
        <p className="eyebrow">Ruang belakang</p>
        <h1>Kelola produk</h1>
      </section>

      {msg && <div className={`alert ${msg.type === "ok" ? "ok" : "err"}`} role="status">{msg.text}</div>}

      <form className="manage-form" onSubmit={submit}>
        <h2>{editId ? "Ubah produk" : "Tambah produk"}</h2>
        <div className="form-grid">
          <label className="span2">Nama produk<input value={form.name} onChange={set("name")} required maxLength={80} /></label>
          <label>Harga (Rp)<input type="number" min="0" value={form.price} onChange={set("price")} required /></label>
          <label>Stok<input type="number" min="0" step="1" value={form.stock} onChange={set("stock")} /></label>
          <label>Kategori
            <select value={form.category} onChange={set("category")}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label>Isi / ukuran<input value={form.netto} onChange={set("netto")} placeholder="250 g" /></label>
          <label className="span2">Asal<input value={form.origin} onChange={set("origin")} placeholder="Kota, Provinsi" /></label>
          <label className="span2">Deskripsi<textarea rows="3" value={form.desc} onChange={set("desc")} maxLength={400} /></label>
          <label>Motif kemasan
            <select value={form.art} onChange={set("art")}>{ARTS.map((a) => <option key={a}>{a}</option>)}</select>
          </label>
          <label>Warna<span className="colors"><input type="color" value={form.bg} onChange={set("bg")} aria-label="Warna latar" /><input type="color" value={form.fg} onChange={set("fg")} aria-label="Warna motif" /></span></label>
          <label className="check"><input type="checkbox" checked={form.featured} onChange={set("featured")} /> Tampilkan di "Pilihan minggu ini"</label>
        </div>
        <div className="form-actions">
          <button className="btn" disabled={busy}>{busy ? "Menyimpan…" : editId ? "Simpan perubahan" : "Tambah produk"}</button>
          {editId && <button type="button" className="link-btn" onClick={reset}>batal ubah</button>}
        </div>
      </form>

      <section className="sec">
        <div className="sec-head"><h2>Semua produk{data ? ` (${data.length})` : ""}</h2></div>
        {state === "loading" && <p className="empty">Memuat…</p>}
        {state === "error" && <p className="empty error">{error.message}</p>}
        {state === "ok" && (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Nama</th><th>Kategori</th><th>Harga</th><th>Stok</th><th></th></tr></thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.name}</b><small>{p.origin}</small></td>
                    <td>{p.category}</td>
                    <td>{rupiah(p.price)}</td>
                    <td>{p.stock}</td>
                    <td className="row-actions">
                      <button className="link-btn" onClick={() => edit(p)}>ubah</button>
                      <button className="link-btn danger" onClick={() => del(p)}>hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
