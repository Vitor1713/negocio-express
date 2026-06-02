"use client";

import { useState } from "react";

const PAINS = [
  "Clientes perguntam se você tem loja online e você fica sem resposta.",
  "Concorrente menor que o seu já vende pelo Instagram com mais organização.",
  "Você já tentou montar uma loja e desistiu na metade por ser complicado demais.",
  "Paga caro em marketplace e entrega a margem pro app.",
  "Seu ponto físico atende bem — mas fora do horário comercial, você some.",
  "Sente que tá ficando pra trás enquanto o mercado vai pro digital.",
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  );
}

export function PainSection() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i); else next.add(i);
    setChecked(next);
  };
  const hits = checked.size;

  return (
    <section className="l-section l-section-tinted" id="produto">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "40px 80px" }}>
        <div>
          <div className="l-eyebrow" style={{ marginBottom: 18 }}>002 · A dor</div>
          <h2 className="l-display-md" style={{ fontSize: "var(--t-h2)" }}>
            Reconhece alguma dessas{" "}
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>situações?</em>
          </h2>
          <p className="l-muted" style={{ fontSize: 17, marginTop: 18, maxWidth: 480 }}>
            Marca o que você sente. Sem julgamento.{" "}
            <span style={{ color: "var(--fg)" }}>Isso é o dia a dia de quase todo dono de pequeno negócio agora.</span>
          </p>

          <div style={{ marginTop: 36, padding: "18px 22px",
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: "var(--r-md)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2,3,4,5].map((i) => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: 4,
                  background: i < hits ? "var(--accent)" : "var(--border)",
                  transition: "background .2s", display: "block" }} />
              ))}
            </div>
            <div style={{ fontSize: 13, color: "var(--fg-secondary)", flex: 1 }}>
              {hits === 0 && "Marca pelo menos um item se for o seu caso."}
              {hits >= 1 && hits < 3 && <><strong style={{ color: "var(--fg)" }}>Já dá pra ver onde aperta.</strong> O Negócio Express foi feito pra resolver isso.</>}
              {hits >= 3 && <><strong style={{ color: "var(--fg)" }}>É exatamente o seu cenário.</strong> Você precisa começar essa semana.</>}
            </div>
          </div>
        </div>

        <div>
          {PAINS.map((p, i) => (
            <div key={i} className={`l-pain-row${checked.has(i) ? " on" : ""}`} onClick={() => toggle(i)}>
              <span className="l-pain-check">
                {checked.has(i) && <CheckIcon />}
              </span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
