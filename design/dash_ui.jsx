// ============================================================================
// DASH UI — primitivos reutilizáveis do painel (mobile-first)
//   DashDrawer, Toggle, Field, PageHead, Toolbar, EmptyState, KebabMenu
// ============================================================================

// ---------- Modal de criação/edição (centrado no desktop, bottom-sheet no mobile) ----
function DashDrawer({ open, onClose, title, subtitle, icon, children, footer, width = 420 }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-enter" onClick={onClose} />
      <aside
        className="relative w-full bg-white shadow-2xl flex flex-col modal-enter rounded-t-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[88vh]"
        style={{ maxWidth: width }}
      >
        <div className="px-5 py-4 border-b border-ink-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <span className="h-9 w-9 rounded-lg bg-brand-100 text-brand-700 grid place-items-center shrink-0">
                <Icon name={icon} size={18} />
              </span>
            )}
            <div className="min-w-0">
              <div className="font-display font-bold text-ink-900 leading-tight truncate">{title}</div>
              {subtitle && <div className="text-xs text-ink-500 leading-tight truncate">{subtitle}</div>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100 transition-colors shrink-0"
            aria-label="Fechar"
          >
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin">{children}</div>
        {footer && <div className="border-t border-ink-200 p-4 bg-ink-50/60 shrink-0">{footer}</div>}
      </aside>
    </div>
  );
}

// ---------- Toggle switch ----------------------------------------------------
function Toggle({ checked, onChange, label, size = "md" }) {
  const w = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const k = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const on = size === "sm" ? "left-[18px]" : "left-[22px]";
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative ${w} rounded-full transition-colors shrink-0 ${checked ? "bg-brand-600" : "bg-ink-300"}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`absolute top-0.5 ${k} rounded-full bg-white shadow-sm transition-all ${checked ? on : "left-0.5"}`} />
      </button>
      {label && <span className="text-sm text-ink-700">{label}</span>}
    </label>
  );
}

// ---------- Field (label + control) -----------------------------------------
function Field({ label, children, hint, required }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink-700 mb-1.5">
          {label} {required && <span className="text-brand-600">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

// ---------- Cabeçalho de página/seção ---------------------------------------
function PageHead({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="font-display font-extrabold text-[22px] sm:text-2xl text-ink-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

// ---------- Toolbar: busca + filtros ----------------------------------------
function Toolbar({ search, setSearch, placeholder = "Buscar...", children }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
      <div className="relative flex-1 min-w-0">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
          <Icon name="Search" size={17} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-ink-200 rounded-lg pl-10 pr-3 py-2.5 text-sm placeholder-ink-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all"
        />
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

// ---------- Chip de filtro (segmented) --------------------------------------
function FilterChips({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scroll-thin">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`shrink-0 px-3 py-2 rounded-lg text-[13px] font-medium transition-all border
            ${value === o.value
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white text-ink-700 border-ink-200 hover:bg-ink-50"}`}
        >
          {o.label}{typeof o.count === "number" && <span className={`ml-1.5 ${value === o.value ? "text-white/70" : "text-ink-400"}`}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ---------- Estado vazio -----------------------------------------------------
function EmptyState({ icon = "Inbox", title, desc, action }) {
  return (
    <div className="bg-white border border-ink-200 rounded-xl p-10 sm:p-14 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-ink-100 grid place-items-center text-ink-400 mb-3">
        <Icon name={icon} size={22} />
      </div>
      <p className="text-ink-900 font-medium">{title}</p>
      {desc && <p className="text-sm text-ink-500 mt-1 max-w-sm mx-auto">{desc}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

// ---------- Menu kebab (•••) -------------------------------------------------
function KebabMenu({ items }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="h-8 w-8 grid place-items-center rounded-lg text-ink-400 hover:text-ink-900 hover:bg-ink-100 transition-colors"
      >
        <Icon name="MoreVertical" size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 min-w-[160px] bg-white border border-ink-200 rounded-xl shadow-pop p-1.5">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick && it.onClick(); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-colors
                ${it.danger ? "text-red-600 hover:bg-red-50" : "text-ink-700 hover:bg-ink-100"}`}
            >
              {it.icon && <Icon name={it.icon} size={15} />}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Input simples (controlado) --------------------------------------
function TextInput({ value, onChange, placeholder, type = "text", prefix, disabled }) {
  return (
    <div className={`flex items-stretch rounded-lg border overflow-hidden transition-all border-ink-200 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100 ${disabled ? "bg-ink-50" : "bg-white"}`}>
      {prefix && (
        <span className="flex items-center px-3 bg-ink-50 border-r border-ink-200 text-ink-500 text-sm whitespace-nowrap">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none disabled:text-ink-500"
      />
    </div>
  );
}

// ---------- Pill de estoque --------------------------------------------------
function StockPill({ stock }) {
  const tone = stock === 0 ? "danger" : stock <= 5 ? "warning" : "success";
  const label = stock === 0 ? "Esgotado" : `${stock} un.`;
  return <Badge tone={tone} size="sm" dot>{label}</Badge>;
}

Object.assign(window, {
  DashDrawer, Toggle, Field, PageHead, Toolbar, FilterChips, EmptyState, KebabMenu, TextInput, StockPill,
});
