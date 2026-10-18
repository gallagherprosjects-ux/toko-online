import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useCart } from "../CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();

  return (
    <header className="top">
      <div className="top-inner">
        <Link to="/" className="brand">
          Warung <em>Nusantara</em>
          <span className="brand-sub">hasil tangan pengrajin lokal</span>
        </Link>
        <nav>
          <NavLink to="/" end>Beranda</NavLink>
          <NavLink to="/products">Produk</NavLink>
          <NavLink to="/cart">Keranjang{count > 0 && <span className="badge">{count}</span>}</NavLink>
          {user?.canManage && <NavLink to="/manage">Kelola</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile">{user.name.split(" ")[0]}</NavLink>
              <button className="link-btn" onClick={() => { logout(); nav("/"); }}>Keluar</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Masuk</NavLink>
              <NavLink to="/register" className="cta">Daftar</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
