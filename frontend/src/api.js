const BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
export const TOKEN_KEY = "toko_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Tidak bisa terhubung ke server. Coba lagi sebentar.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Terjadi kesalahan.");
    err.status = res.status;
    throw err;
  }
  return data;
}

const qs = (params = {}) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== "Semua")).toString();
  return s ? `?${s}` : "";
};

export const api = {
  // publik
  products: (params) => request("/api/products" + qs(params)),
  product: (id) => request(`/api/products/${id}`),
  // autentikasi
  register: (b) => request("/api/register", { method: "POST", body: b }),
  login: (b) => request("/api/login", { method: "POST", body: b }),
  me: () => request("/api/me", { auth: true }),
  // butuh token
  createProduct: (b) => request("/api/products", { method: "POST", body: b, auth: true }),
  updateProduct: (id, b) => request(`/api/products/${id}`, { method: "PUT", body: b, auth: true }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE", auth: true }),
  order: (items) => request("/api/orders", { method: "POST", body: { items }, auth: true }),
  myOrders: () => request("/api/orders/mine", { auth: true }),
};
