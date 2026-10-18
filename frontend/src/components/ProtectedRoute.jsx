import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

// Bungkus halaman yang butuh login. Kalau belum login, lempar ke /login
// sambil mengingat halaman tujuan supaya bisa kembali setelah masuk.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="empty">Memeriksa sesi…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname, notice: "Silakan login dulu untuk membuka halaman itu." }} />;
  return children;
}
