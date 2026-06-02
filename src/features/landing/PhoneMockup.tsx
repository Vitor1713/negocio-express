/** Mockup decorativo do telefone — portado de design/phone-mockup.jsx. */

function MiniQR({ fg = "#0E0E0C", size = 80 }: { fg?: string; size?: number }) {
  const cells: boolean[] = [];
  const seed = 0x4e45;
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const corner = (r < 3 && c < 3) || (r < 3 && c > 9) || (r > 9 && c < 3);
      const innerCorner =
        (r === 1 && c < 3) || (c === 1 && r < 3) ||
        (r === 1 && c >= 10) || (c === 11 && r < 3) ||
        (r === 11 && c < 3) || (c === 1 && r > 9);
      const on = corner ? !innerCorner : (((r * 31 + c * 17 + seed) ^ (r * c)) & 5) > 1;
      cells.push(on);
    }
  }
  return (
    <div style={{ width: size, height: size, display: "grid", gridTemplateColumns: "repeat(13,1fr)" }}>
      {cells.map((on, i) => (
        <div key={i} style={{ background: on ? fg : "transparent" }} />
      ))}
    </div>
  );
}

type Product = { name: string; price: string; swatch: string };

const DEFAULT_PRODUCTS: Product[] = [
  { name: "Bolo de cenoura", price: "R$ 38", swatch: "linear-gradient(135deg,oklch(78% .10 70),oklch(68% .12 60))" },
  { name: "Pão de mel",      price: "R$ 6",  swatch: "linear-gradient(135deg,oklch(72% .08 55),oklch(58% .10 40))" },
  { name: "Brigadeiro 12un", price: "R$ 28", swatch: "linear-gradient(135deg,oklch(40% .07 35),oklch(30% .05 30))" },
  { name: "Torta de limão",  price: "R$ 42", swatch: "linear-gradient(135deg,oklch(88% .09 110),oklch(75% .13 105))" },
];

export function PhoneMockup({ width = 280, showQR = false }: { width?: number; showQR?: boolean }) {
  const h = Math.round(width * 2.05);
  const bezel    = "#0E0E0C";
  const screenBg = "#FFFFFF";
  const fg       = "#0E0E0C";
  const muted    = "#7E7C75";
  const border   = "#ECEAE2";
  const tint     = "#F6F4ED";

  return (
    <div style={{ width, height: h, background: bezel, borderRadius: 44, padding: 10,
      boxShadow: "0 30px 80px -20px rgba(15,15,12,.35),0 8px 24px -8px rgba(15,15,12,.18),inset 0 0 0 1px rgba(255,255,255,.04)",
      position: "relative" }}>
      <div style={{ width: "100%", height: "100%", background: screenBg, borderRadius: 34,
        overflow: "hidden", position: "relative", color: fg }}>

        {/* Status bar */}
        <div style={{ height: 38, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 22px 0 24px", fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em" }}>
          <span>9:41</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
              <rect x="0" y="3" width="2" height="4" rx="0.5" fill={fg}/>
              <rect x="4" y="1" width="2" height="6" rx="0.5" fill={fg}/>
              <rect x="8" y="-1" width="2" height="8" rx="0.5" fill={fg} opacity="0.4"/>
            </svg>
            <div style={{ width: 22, height: 10, border: `1px solid ${fg}`, borderRadius: 2.5, padding: 1 }}>
              <div style={{ background: fg, height: "100%", width: "76%", borderRadius: 1 }}/>
            </div>
          </span>
        </div>

        {/* URL bar */}
        <div style={{ margin: "8px 16px 4px", height: 30, background: tint, borderRadius: 8,
          display: "flex", alignItems: "center", gap: 8, padding: "0 12px",
          fontSize: 11, color: muted, fontFamily: "monospace" }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="2" y="5" width="8" height="6" rx="1"/>
            <path d="M4 5V3.5a2 2 0 014 0V5"/>
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            casa-da-maria.com.br
          </span>
        </div>

        {/* Header */}
        <div style={{ padding: "12px 18px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>Casa da Maria</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>Bolos e doces · Salvador, BA</div>
          </div>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: fg, color: screenBg,
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M2 3h2l1 7h7l1-5H4"/>
              <circle cx="6" cy="12" r="0.8" fill="currentColor"/>
              <circle cx="11" cy="12" r="0.8" fill="currentColor"/>
            </svg>
            <span style={{ position: "absolute", top: -3, right: -3, width: 12, height: 12, borderRadius: 6,
              background: "oklch(52% 0.17 145)", color: "#fff", fontSize: 8, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
          </div>
        </div>

        {/* Hero banner */}
        <div style={{ margin: "8px 16px 12px", height: 110, borderRadius: 12,
          background: "linear-gradient(135deg,oklch(78% .10 70),oklch(60% .13 45))",
          padding: 14, display: "flex", flexDirection: "column", justifyContent: "flex-end",
          color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 10, right: 12, fontFamily: "monospace",
            fontSize: 9, opacity: 0.85, letterSpacing: "0.06em" }}>NOVO · FRESQUINHO</div>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Encomendas até<br/>sexta às 14h
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", overflow: "hidden", fontSize: 11 }}>
          {["Todos","Bolos","Doces","Salgados"].map((c, i) => (
            <div key={c} style={{ padding: "5px 10px", borderRadius: 999,
              background: i === 0 ? fg : tint, color: i === 0 ? screenBg : fg,
              fontWeight: i === 0 ? 600 : 500, flexShrink: 0 }}>{c}</div>
          ))}
        </div>

        {/* Product grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 16px 16px" }}>
          {DEFAULT_PRODUCTS.map((p, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ aspectRatio: "1/1", borderRadius: 10, background: p.swatch, position: "relative" }}>
                <div style={{ position: "absolute", bottom: 6, right: 6, width: 22, height: 22, borderRadius: 11,
                  background: "rgba(255,255,255,.95)", color: "#0E0E0C",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 600, lineHeight: 1 }}>+</div>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: muted, marginTop: -2 }}>{p.price}</div>
            </div>
          ))}
        </div>

        {showQR && (
          <div style={{ position: "absolute", bottom: 24, left: 16, right: 16,
            background: fg, color: screenBg, borderRadius: 14, padding: "14px 16px",
            display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ background: screenBg, padding: 4, borderRadius: 6 }}>
              <MiniQR fg={fg} size={42} />
            </div>
            <div style={{ flex: 1, fontSize: 11, lineHeight: 1.25 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>QR no balcão</div>
              <div style={{ opacity: 0.7 }}>Cliente escaneia e pede</div>
            </div>
          </div>
        )}

        {/* Home indicator */}
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
          width: 96, height: 4, borderRadius: 2, background: fg, opacity: 0.85 }}/>

        {/* Notch */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 96, height: 24, background: bezel, borderRadius: "0 0 14px 14px" }}/>
      </div>
    </div>
  );
}

export { MiniQR };
