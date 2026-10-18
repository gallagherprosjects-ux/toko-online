import { useEffect, useState } from "react";

// Ambil data dari API. Mengembalikan { data, state: "loading" | "ok" | "error", error }.
export default function useAsync(fn, deps) {
  const [r, setR] = useState({ data: null, state: "loading", error: null });
  useEffect(() => {
    let alive = true;
    setR((x) => ({ ...x, state: "loading" }));
    fn().then((data) => alive && setR({ data, state: "ok", error: null }))
        .catch((error) => alive && setR({ data: null, state: "error", error }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return r;
}
