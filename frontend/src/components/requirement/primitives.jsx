import React from "react";
import { Plus, Minus, Check } from "lucide-react";

/* ── Custom-generated elevation illustrations (BDesigner brand assets) ── */
export const ELEV_IMAGES = {
  "Simple Design": "https://static.prod-images.emergentagent.com/jobs/5486805e-5a43-460e-a2da-a0aea6281fd7/images/e848ee86fcd71775e3513a3204d382aa492c920f0d44a55ce595d3f9d36b50ae.jpeg",
  "Modern Design": "https://static.prod-images.emergentagent.com/jobs/5486805e-5a43-460e-a2da-a0aea6281fd7/images/20e92bfca20e66ef4ff24defb905151e93fa6d0f6c77e18e77ed47a1ff32e771.jpeg",
  "Kerala Design": "https://static.prod-images.emergentagent.com/jobs/5486805e-5a43-460e-a2da-a0aea6281fd7/images/a9787d117b148878f11ba05803de295ad9f1a26d0538646cc3ae0f481970f734.jpeg",
  "Classical Design": "https://static.prod-images.emergentagent.com/jobs/5486805e-5a43-460e-a2da-a0aea6281fd7/images/934a57c13b43de376aff2002f1d745e7e8e1b6ec469cbf9a8b5d049552b72179.jpeg",
};

export const rupee = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* Panel card — token surface that never merges with the canvas. */
export function ReqCard({ title, right, subtitle, children, className = "" }) {
  return (
    <div className={`bd-card-surface rounded-2xl p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[15px] font-bold text-[var(--text-primary)] leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function ReqField({ placeholder, value, onChange, type = "text", testid, icon, inputMode }) {
  return (
    <div className="bd-req-field relative flex items-center gap-2 rounded-xl px-3.5 py-3">
      {icon && <span className="text-[var(--text-muted)] shrink-0">{icon}</span>}
      <input
        data-testid={testid}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none text-[15px] font-medium"
      />
    </div>
  );
}

export function ReqSegmented({ options, value, onChange, testid }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length},minmax(0,1fr))` }} data-testid={testid}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          data-testid={testid ? `${testid}-${o.replace(/\s+/g, "-").toLowerCase()}` : undefined}
          onClick={() => onChange(o)}
          className={`bd-req-seg ${value === o ? "bd-req-seg--on" : ""} rounded-xl py-2.5 text-sm font-semibold`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function ReqCounter({ label, hint, value, onChange, testid }) {
  return (
    <div className="bd-card-surface rounded-2xl px-4 py-3.5 flex items-center justify-between" data-testid={testid}>
      <div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
        {hint && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          data-testid={`${testid}-minus`}
          className="bd-req-iconbtn w-9 h-9 grid place-items-center rounded-full"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-7 text-center text-base font-bold text-[var(--text-primary)]">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          data-testid={`${testid}-plus`}
          className="bd-req-iconbtn w-9 h-9 grid place-items-center rounded-full"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ReqChips({ items, selected, onToggle, testid }) {
  return (
    <div className="flex flex-wrap gap-2" data-testid={testid}>
      {items.map((it) => {
        const on = selected.includes(it);
        return (
          <button
            key={it}
            type="button"
            onClick={() => onToggle(it)}
            className={`bd-req-chip ${on ? "bd-req-chip--on" : ""} text-xs font-semibold px-3.5 py-2 rounded-full`}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}

/* Image option card — used for Services + Elevation styles. */
export function ReqImageCard({ image, label, sublabel, selected, onClick, badge, testid }) {
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={onClick}
      className={`bd-req-pick ${selected ? "bd-req-pick--on" : ""} group relative text-left rounded-2xl overflow-hidden`}
    >
      <span
        className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-full grid place-items-center transition ${
          selected ? "bd-req-accent-bg" : "bg-black/45 border border-white/40"
        }`}
      >
        <Check className={`w-3.5 h-3.5 ${selected ? "" : "text-white/80"}`} />
      </span>
      {badge && (
        <span className="bd-req-accent-bg absolute top-2.5 right-2.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded">
          {badge}
        </span>
      )}
      <div
        className="aspect-[4/3] bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="p-3 bg-[var(--background-card)]">
        <div className="text-sm font-bold text-[var(--text-primary)] leading-tight">{label}</div>
        {sublabel && <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{sublabel}</div>}
      </div>
    </button>
  );
}

export function ReqRow({ k, v, accent }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-[var(--text-secondary)]">{k}</span>
      <span className={`font-semibold text-right ${accent ? "bd-req-accent" : "text-[var(--text-primary)]"}`}>{v}</span>
    </div>
  );
}
