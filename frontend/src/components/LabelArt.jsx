// Motif kemasan tiap produk, digambar dengan SVG pattern (tanpa gambar eksternal).
const TILES = {
  kopi: { w: 34, h: 34, d: (
    <>
      <g transform="rotate(35 9 9)"><ellipse cx="9" cy="9" rx="7" ry="4.4" /><path d="M2.5 9 Q9 6 15.5 9" /></g>
      <g transform="rotate(-30 26 26)"><ellipse cx="26" cy="26" rx="7" ry="4.4" /><path d="M19.5 26 Q26 23 32.5 26" /></g>
    </>) },
  teh: { w: 36, h: 36, d: (
    <>
      <path d="M4 18 Q14 2 24 18 Q14 12 4 18Z" /><path d="M6 16 L22 16" />
      <path d="M22 34 Q30 22 36 34 Q29 29 22 34Z" />
    </>) },
  keripik: { w: 22, h: 22, d: (
    <>
      <circle cx="5" cy="5" r="2.2" /><circle cx="16" cy="12" r="1.6" /><circle cx="7" cy="17" r="1.2" />
    </>) },
  batik: { w: 44, h: 44, d: (
    <>
      <ellipse cx="22" cy="10" rx="6" ry="9" /><ellipse cx="22" cy="34" rx="6" ry="9" />
      <ellipse cx="10" cy="22" rx="9" ry="6" /><ellipse cx="34" cy="22" rx="9" ry="6" />
      <circle cx="22" cy="22" r="2" />
    </>) },
  anyaman: { w: 24, h: 24, d: (
    <>
      <path d="M0 6 H12 M12 18 H24 M6 0 V12 M18 12 V24" /><rect x="1" y="1" width="10" height="10" /><rect x="13" y="13" width="10" height="10" />
    </>) },
  madu: { w: 30, h: 26, d: (
    <>
      <path d="M7 2 L15 2 L19 9 L15 16 L7 16 L3 9Z" /><path d="M22 15 L30 15 L34 22 L30 29 L22 29 L18 22Z" transform="translate(-7 -6)" />
    </>) },
  wayang: { w: 22, h: 22, d: (
    <>
      <path d="M0 20 L11 2 L22 20" /><path d="M5 20 L11 10 L17 20" />
    </>) },
  sambal: { w: 26, h: 26, d: (
    <>
      <path d="M4 24 Q16 18 11 4" /><path d="M15 24 Q24 16 20 8" /><circle cx="11" cy="3" r="1.2" />
    </>) },
};

export default function LabelArt({ id, kind, bg, fg }) {
  const t = TILES[kind] || TILES.keripik;
  const pid = `pat-${id}`;
  return (
    <svg className="art" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id={pid} width={t.w} height={t.h} patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <g fill="none" stroke={fg} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".55">{t.d}</g>
        </pattern>
      </defs>
      <rect width="320" height="150" fill={bg} />
      <rect width="320" height="150" fill={`url(#${pid})`} />
    </svg>
  );
}
