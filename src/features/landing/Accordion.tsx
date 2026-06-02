"use client";

import { useState } from "react";

type Item = { q: string; a: string };

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 7h8M7 3v8" />
    </svg>
  );
}

export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className={`l-acc-row${open === i ? " open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
          <div className="l-acc-head">
            <span>"{item.q}"</span>
            <span className="l-acc-icon"><PlusIcon /></span>
          </div>
          <div className="l-acc-body">{item.a}</div>
        </div>
      ))}
    </div>
  );
}

export function FAQAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className={`l-acc-row${open === i ? " open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
          <div className="l-acc-head">
            <span>{item.q}</span>
            <span className="l-acc-icon"><PlusIcon /></span>
          </div>
          <div className="l-acc-body">{item.a}</div>
        </div>
      ))}
    </div>
  );
}
