import React, { createContext, useContext } from "react";
import { ADMIN_THEMES, ADMIN_EASE } from "./adminTheme";

/* Shared theme context so every Admin component reads one theme state. */
export const TCtx = createContext(ADMIN_THEMES.dark);
export const useT = () => useContext(TCtx);
export { ADMIN_EASE };

/* Slim, theme-aware scrollbars scoped to the Admin shell. */
export function AdminScrollbarStyle() {
  const t = useT();
  return (
    <style>{`
      [data-admin-scope] *::-webkit-scrollbar{width:8px;height:8px;}
      [data-admin-scope] *::-webkit-scrollbar-track{background:transparent;}
      [data-admin-scope] *::-webkit-scrollbar-thumb{background:${t.border};border-radius:8px;}
      [data-admin-scope] *::-webkit-scrollbar-thumb:hover{background:${t.muted};}
      [data-admin-scope] *{scrollbar-width:thin;scrollbar-color:${t.border} transparent;}
      [data-admin-scope] .hide-scrollbar::-webkit-scrollbar{display:none;}
      [data-admin-scope] .hide-scrollbar{scrollbar-width:none;}
    `}</style>
  );
}

export function AdminStatusBadge({ tone = "muted", children }) {
  const t = useT();
  const map = {
    ok: { bg: t.okBg, fg: t.okText }, gold: { bg: t.warnBg, fg: t.warnText },
    muted: { bg: t.elevated, fg: t.muted }, danger: { bg: "rgba(220,38,38,0.12)", fg: t.dangerText },
  };
  const c = map[tone] || map.muted;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap" style={{ background: c.bg, color: c.fg }}>{children}</span>;
}

export function AdminCard({ children, className = "", style = {}, ...rest }) {
  const t = useT();
  return <div className={`rounded-2xl ${className}`} style={{ background: t.card, border: `1px solid ${t.border}`, ...style }} {...rest}>{children}</div>;
}

export function AdminSummaryCard({ label, value, icon: Icon, hint }) {
  const t = useT();
  return (
    <div className="rounded-xl p-3.5" style={{ background: t.card, border: `1px solid ${t.border}` }}>
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: t.elevated }}><Icon className="w-3.5 h-3.5" style={{ color: t.gold }} /></span>}
        <span className="text-[11px] font-semibold" style={{ color: t.muted }}>{label}</span>
      </div>
      <div className="text-sm font-bold" style={{ color: t.text }}>{value}</div>
      {hint && <div className="text-[11px] mt-0.5" style={{ color: t.muted }}>{hint}</div>}
    </div>
  );
}

export function AdminMetricCard({ label, value, icon: Icon, sub, delta }) {
  const t = useT();
  return (
    <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.border}` }}>
      <div className="flex items-center gap-2.5 mb-3">
        {Icon && <span className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: t.elevated }}><Icon className="w-4 h-4" style={{ color: t.gold }} /></span>}
        <span className="text-[11px] font-semibold" style={{ color: t.muted }}>{label}</span>
      </div>
      <div className="text-2xl font-black" style={{ color: t.text }}>{value}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: t.muted }}>{sub}</div>}
      {delta && <div className="text-[11px] mt-2 font-semibold" style={{ color: t.okText }}>{delta}</div>}
    </div>
  );
}

export function AdminEmptyState({ icon: Icon, title, description, action }) {
  const t = useT();
  return (
    <div className="rounded-2xl p-10 text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
      {Icon && <div className="w-12 h-12 rounded-xl grid place-items-center mx-auto mb-4" style={{ background: t.goldSoft, color: t.gold }}><Icon className="w-6 h-6" /></div>}
      <h3 className="text-base font-bold" style={{ color: t.text }}>{title}</h3>
      {description && <p className="text-sm mt-1.5 max-w-md mx-auto" style={{ color: t.text2 }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function AdminActionButton({ variant = "secondary", icon: Icon, children, className = "", ...rest }) {
  const t = useT();
  const base = "text-xs font-semibold px-3.5 py-2 rounded-full inline-flex items-center gap-1.5 transition disabled:opacity-60 whitespace-nowrap";
  const styles = {
    primary: { background: t.primaryBg, color: t.primaryText },
    secondary: { background: "transparent", color: t.text, border: `1px solid ${t.border}` },
    ghost: { background: "transparent", color: t.text2 },
  };
  return <button className={`${base} ${className}`} style={styles[variant]} {...rest}>{Icon && <Icon className="w-3.5 h-3.5" />}{children}</button>;
}

export function AdminTabs({ tabs, value, onChange, testidPrefix = "tab" }) {
  const t = useT();
  return (
    <div className="flex gap-1 overflow-x-auto hide-scrollbar items-end">
      {tabs.map((x) => (
        <button key={x} onClick={() => onChange(x)} data-testid={`${testidPrefix}-${x.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-sm font-semibold px-3 pb-2.5 pt-1 whitespace-nowrap transition"
          style={{ color: value === x ? t.text : t.muted, borderBottom: value === x ? `2px solid ${t.gold}` : "2px solid transparent" }}>{x}</button>
      ))}
    </div>
  );
}

export function AdminWorkspaceHeader({ title, subtitle, backLabel, onBack, status, meta, actions }) {
  const t = useT();
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        {backLabel && <button onClick={onBack} data-testid="admin-ws-back" className="text-xs font-semibold inline-flex items-center gap-1 mb-1.5" style={{ color: t.muted }}>← {backLabel}</button>}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-black" style={{ color: t.text }}>{title}</h1>
          {status && <AdminStatusBadge tone={status.tone}>{status.label}</AdminStatusBadge>}
        </div>
        {subtitle && <p className="text-sm mt-1" style={{ color: t.text2 }}>{subtitle}</p>}
        {meta && <p className="text-[11px] mt-1" style={{ color: t.muted }}>{meta}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* Sidebar bottom Light | Dark segmented control (matches reference). */
export function AdminAppearanceToggle({ mode, onMode, compact }) {
  const t = useT();
  const renderBtn = (v, label, icon) => {
    const on = mode === v;
    return (
      <button onClick={() => onMode(v)} data-testid={`admin-appearance-${v}`} title={label}
        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2 transition"
        style={on ? { background: t.primaryBg, color: t.primaryText } : { color: t.text2 }}>
        <span aria-hidden>{icon}</span>{!compact && label}
      </button>
    );
  };
  return (
    <div className="flex gap-1 rounded-xl p-1" style={{ background: t.elevated, border: `1px solid ${t.border}` }}>
      {renderBtn("light", "Light", "☀️")}
      {renderBtn("dark", "Dark", "🌙")}
    </div>
  );
}
