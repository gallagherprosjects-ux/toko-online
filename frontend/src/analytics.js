// Integrasi Google Analytics 4 (gtag.js). Aktif hanya kalau VITE_GA_ID diisi.
const GA_ID = import.meta.env.VITE_GA_ID;

export function initAnalytics() {
  if (!GA_ID || window.__gaLoaded) return;
  window.__gaLoaded = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  // SPA: page_view dikirim manual setiap ganti route, jadi otomatisnya dimatikan
  window.gtag("config", GA_ID, { send_page_view: false });
}

export function trackPageView(path) {
  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
  if (import.meta.env.DEV) console.debug("[GA] page_view", path);
}

export function trackEvent(name, params = {}) {
  if (window.gtag) window.gtag("event", name, params);
  if (import.meta.env.DEV) console.debug("[GA] event", name, params);
}
