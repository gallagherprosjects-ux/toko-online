import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, TOKEN_KEY, getToken } from "./api";
import { trackEvent } from "./analytics";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken()); // true selama token lama diverifikasi

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // saat halaman dibuka ulang: cek token di localStorage ke backend
  useEffect(() => {
    if (!getToken()) return;
    api.me().then(setUser).catch(() => logout()).finally(() => setLoading(false));
  }, [logout]);

  const handleAuth = (data, eventName) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    trackEvent(eventName, { method: "email" });
  };

  const login = async (email, password) => handleAuth(await api.login({ email, password }), "login");
  const register = async (name, email, password) => handleAuth(await api.register({ name, email, password }), "sign_up");

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
