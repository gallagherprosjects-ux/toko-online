import { createContext, useContext, useState } from "react";
import { trackEvent } from "./analytics";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const add = (p, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + qty, p.stock) } : i));
      return [...prev, { id: p.id, name: p.name, netto: p.netto, price: p.price, stock: p.stock, qty: Math.min(qty, p.stock) }];
    });
    trackEvent("add_to_cart", { currency: "IDR", value: p.price * qty, items: [{ item_id: p.id, item_name: p.name, price: p.price, quantity: qty }] });
  };
  const setQty = (id, qty) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty || 1, i.stock)) } : i)));
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>{children}</CartContext.Provider>;
}
