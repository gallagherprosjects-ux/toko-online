import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Manage from "./pages/Manage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Cart from "./pages/Cart.jsx";
import Profile from "./pages/Profile.jsx";
import { trackPageView } from "./analytics.js";

const titles = { "/": "Beranda", "/products": "Daftar Produk", "/manage": "Kelola Produk", "/login": "Masuk", "/register": "Daftar", "/cart": "Keranjang", "/profile": "Profil" };

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!pathname.startsWith("/products/")) document.title = `${titles[pathname] || "Halaman"} · Warung Nusantara`;
    window.scrollTo(0, 0);
    trackPageView(pathname);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/manage" element={<ProtectedRoute><Manage /></ProtectedRoute>} />
          <Route path="*" element={<p className="empty">Halaman ini tidak ada. Mungkin salah ketik alamat?</p>} />
        </Routes>
      </main>
      <footer className="footer">Warung Nusantara · aplikasi latihan Tugas Personal Lab 2, Week 8 · tidak ada transaksi sungguhan</footer>
    </>
  );
}
