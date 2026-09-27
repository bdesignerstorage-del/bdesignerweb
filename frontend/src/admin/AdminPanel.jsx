import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { setStoredToken } from "@/lib/api";
import getIcon, { ICON_NAMES } from "@/components/home/iconMap";
import PasswordInput from "@/components/PasswordInput";
import { toast } from "sonner";
import { ADMIN_THEMES, ADMIN_EASE } from "./adminTheme";
import {
  TCtx, useT, AdminScrollbarStyle, AdminStatusBadge, AdminSummaryCard,
  AdminEmptyState, AdminActionButton, AdminTabs, AdminWorkspaceHeader, AdminAppearanceToggle,
} from "./adminUI";
import {
  LayoutDashboard, Users, FolderKanban, UserSquare, MessagesSquare, Boxes,
  FileSignature, Wallet, FileText, Globe, Tag, LayoutTemplate, MapPin, Settings,
  LogOut, ChevronDown, ChevronRight, Upload, Trash2, Eye, Loader2, Save, Send,
  ArrowUp, ArrowDown, ImageIcon, Film, Music, X, KeyRound, Menu, Sun, Moon,
  BadgeCheck, ListChecks, ShieldCheck, Scale, MessageSquareQuote, HelpCircle,
  Info, Megaphone, PanelBottom, DraftingCompass, UserCircle2, Search, Bell,
  Clock, CheckCircle2, Palette,
} from "lucide-react";

const SIDEBAR = [
  { group: "MAIN", items: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "leads", label: "Leads", icon: MessagesSquare },
    { key: "projects", label: "Projects", icon: FolderKanban },
    { key: "clients", label: "Clients", icon: UserSquare },
    { key: "team", label: "Team", icon: Users },
    { key: "chat", label: "Chat", icon: MessageSquareQuote },
  ]},
  { group: "COMMERCIAL", items: [
    { key: "packages", label: "Package & Proposal", icon: Boxes },
    { key: "agreements", label: "Agreements", icon: FileSignature },
    { key: "payments", label: "Payments", icon: Wallet },
    { key: "documents", label: "Documents", icon: FileText },
  ]},
  { group: "WEBSITE", items: [
    { key: "cms", label: "Website CMS", icon: Globe, enabled: true },
  ]},
  { group: "CONFIGURATION", items: [
    { key: "pricing", label: "Pricing", icon: Tag },
    { key: "templates", label: "Package Templates", icon: LayoutTemplate },
    { key: "areas", label: "Service Areas", icon: MapPin },
    { key: "settings", label: "Settings", icon: Settings },
  ]},
];

const CMS_TABS = ["Homepage", "Projects", "Homeowner Stories", "FAQs", "About", "How It Works", "Contact", "Media", "SEO"];

const HOMEPAGE_SECTIONS = [
  { key: "hero", label: "Hero", icon: Film, kind: "hero" },
  { key: "trust_indicator", label: "Trust Indicators", icon: BadgeCheck, kind: "items" },
  { key: "architectural_service", label: "Architectural Services", icon: DraftingCompass, kind: "services" },
  { key: "construction_step", label: "How It Works", icon: ListChecks, kind: "items" },
  { key: "service_area", label: "Service Area / Availability", icon: MapPin, kind: "items" },
  { key: "guarantee", label: "Guarantees You Deserve", icon: ShieldCheck, kind: "items" },
  { key: "comparison_feature", label: "Why Choose BDesigner", icon: Scale, kind: "items" },
  { key: "trending_projects", label: "Trending Projects", icon: FolderKanban, kind: "listSettings" },
  { key: "homeowner_review", label: "Homeowner Stories", icon: MessageSquareQuote, kind: "items", carousel: true },
  { key: "faq", label: "FAQs", icon: HelpCircle, kind: "items", maxItems: true },
  { key: "advisor_benefit", label: "About BDesigner", icon: Info, kind: "about" },
  { key: "cta_section", label: "Final CTA", icon: Megaphone, kind: "cta" },
  { key: "footer", label: "Footer", icon: PanelBottom, kind: "footer" },
];
const ITEM_LABEL = { trust_indicator: "Indicator", construction_step: "Step", service_area: "Area", guarantee: "Guarantee", comparison_feature: "Feature", homeowner_review: "Story", faq: "FAQ" };

const toMMSS = (s) => { const n = Math.max(0, Math.floor(Number(s) || 0)); return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`; };
const fromMMSS = (str) => { const m = String(str || "").trim().match(/^(\d{1,2}):(\d{1,2})$/); return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null; };
const initials = (name) => (name || "BA").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/* ---------------- form primitives ---------------- */
function Field({ value, onChange, placeholder, type = "text", rows, testid }) {
  const t = useT();
  const st = { background: t.inputBg, border: `1px solid ${t.border}`, color: t.text };
  const cls = "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition";
  if (rows) return <textarea data-testid={testid} rows={rows} className={cls} style={st} value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
  return <input data-testid={testid} type={type} className={cls} style={st} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}
function Label({ children }) { const t = useT(); return <label className="block text-[11px] font-semibold mb-1.5" style={{ color: t.text2 }}>{children}</label>; }
function Toggle({ checked, onChange, label, testid }) {
  const t = useT();
  return (
    <button type="button" data-testid={testid} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-sm" style={{ color: t.text2 }}>
      <span className="relative inline-block w-9 h-5 rounded-full transition" style={{ background: checked ? t.gold : t.border }}><span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: checked ? "18px" : "2px" }} /></span>{label}
    </button>
  );
}
function Group({ title, children }) { const t = useT(); return <div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: t.muted }}>{title}</p><div className="space-y-3">{children}</div></div>; }

function MediaField({ kind = "image", value, alt, onChange, onAlt, hint }) {
  const t = useT();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const [meta, setMeta] = useState(null);
  const accept = kind === "image" ? "image/jpeg,image/png,image/webp,image/svg+xml" : kind === "video" ? "video/mp4,video/webm" : "audio/mpeg,audio/wav,audio/mp4,audio/ogg";
  const recommend = kind === "image" ? "JPG / PNG / WEBP · 16:9 or square" : kind === "video" ? "MP4 / WebM" : "MP3 / WAV / OGG";
  const pick = () => inputRef.current?.click();
  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true); setPct(0); setErr("");
    const fd = new FormData(); fd.append("kind", kind); fd.append("file", file);
    try {
      const { data } = await api.post("/admin/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" }, onUploadProgress: (p) => setPct(Math.round((p.loaded / (p.total || 1)) * 100)) });
      onChange?.(data.url); setMeta({ name: file.name, size: file.size }); toast.success("Uploaded");
    } catch (e2) { setErr(e2.response?.data?.detail || "Upload failed"); toast.error("Upload failed"); }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = ""; }
  };
  const Icon = kind === "image" ? ImageIcon : kind === "video" ? Film : Music;
  const fmtSize = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
  return (
    <div className="rounded-xl p-3" style={{ background: t.inputBg, border: `1px solid ${t.border}` }}>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg overflow-hidden grid place-items-center shrink-0" style={{ background: t.elevated, border: `1px solid ${t.border}` }}>
          {value ? (kind === "image" ? <img src={value} alt={alt || ""} className="w-full h-full object-cover" /> : <Icon className="w-6 h-6" style={{ color: t.gold }} />) : <Icon className="w-6 h-6" style={{ color: t.muted }} />}
        </div>
        <div className="min-w-0 flex-1">
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={upload} />
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={pick} disabled={busy} data-testid={`media-upload-${kind}`} className="text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-60" style={{ background: t.primaryBg, color: t.primaryText }}>{busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}{value ? `Replace` : `Upload`}</button>
            {value && !busy && <button type="button" onClick={() => { onChange?.(""); setMeta(null); }} className="text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1.5" style={{ color: t.text, border: `1px solid ${t.border}` }}><Trash2 className="w-3.5 h-3.5" /> Remove</button>}
            {err && <button type="button" onClick={pick} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: t.dangerText, border: `1px solid ${t.border}` }}>Retry</button>}
          </div>
          {busy && <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: t.border }}><div style={{ width: `${pct}%`, background: t.gold, height: "100%", transition: `width .2s ${ADMIN_EASE}` }} /></div>}
          {meta && !busy && <p className="text-[11px] mt-1.5 truncate" style={{ color: t.text2 }}>{meta.name} · {fmtSize(meta.size)}</p>}
          {err ? <p className="text-[11px] mt-1" style={{ color: t.dangerText }}>{err}</p> : <p className="text-[11px] mt-1" style={{ color: t.muted }}>{hint || recommend}</p>}
        </div>
      </div>
      {(kind === "video" || kind === "audio") && value && (kind === "video" ? <video src={value} controls className="mt-2 w-full max-h-40 rounded-lg" /> : <audio src={value} controls className="mt-2 w-full" />)}
      {kind === "image" && onAlt && <div className="mt-2"><Field value={alt} onChange={onAlt} placeholder="Alt text (accessibility)" /></div>}
    </div>
  );
}
function IconSelect({ value, onChange }) {
  const t = useT(); const Icon = getIcon(value);
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: t.elevated, border: `1px solid ${t.border}` }}><Icon className="w-4 h-4" style={{ color: t.text }} /></span>
      <select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">— icon —</option>{ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  );
}

/* ============================ main panel ============================ */
export default function AdminPanel() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("bd_admin_theme") || "dark");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("bd_admin_sidebar") === "1");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 768 : false));
  const [active, setActive] = useState("cms");
  const [tab, setTab] = useState("Homepage");
  const [openSection, setOpenSection] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [acctMenu, setAcctMenu] = useState(null); // 'top' | 'side' | null
  const [notifOpen, setNotifOpen] = useState(false);
  const [services, setServices] = useState([]);

  const t = ADMIN_THEMES[themeMode] || ADMIN_THEMES.dark;

  useEffect(() => { localStorage.setItem("bd_admin_theme", themeMode); }, [themeMode]);
  useEffect(() => { localStorage.setItem("bd_admin_sidebar", collapsed ? "1" : "0"); }, [collapsed]);
  useEffect(() => { const onR = () => setIsMobile(window.innerWidth < 768); window.addEventListener("resize", onR); return () => window.removeEventListener("resize", onR); }, []);
  useEffect(() => { const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => { if (data.role !== "admin") { setStoredToken(null); navigate("/admin/login"); return; } setMe(data); }).catch(() => navigate("/admin/login")).finally(() => setAuthChecked(true));
  }, [navigate]);

  const loadDraft = useCallback(() => {
    api.get("/admin/cms/homepage").then(({ data }) => setDraft(data)).catch(() => toast.error("Failed to load CMS content"));
    api.get("/admin/services").then(({ data }) => setServices(data.services || [])).catch(() => {});
  }, []);
  useEffect(() => { if (me) loadDraft(); }, [me, loadDraft]);

  const guardNav = (fn) => { if (dirty && !window.confirm("You have unsaved changes. Leave without saving the draft?")) return; fn(); };
  const logout = () => guardNav(() => { setStoredToken(null); navigate("/admin/login"); });

  const setSection = (sec, patch) => { setDirty(true); setDraft((d) => ({ ...d, settings: { ...d.settings, [sec]: { ...(d.settings?.[sec] || {}), ...patch } } })); };
  const setSectionMeta = (sec, patch) => { setDirty(true); setDraft((d) => ({ ...d, settings: { ...d.settings, [sec]: { ...(d.settings?.[sec] || {}), meta: { ...((d.settings?.[sec] || {}).meta || {}), ...patch } } } })); };
  const setItem = (sec, i, patch) => { setDirty(true); setDraft((d) => ({ ...d, items: { ...d.items, [sec]: d.items[sec].map((it, k) => k === i ? { ...it, ...patch } : it) } })); };
  const moveItem = (sec, i, dir) => { setDirty(true); setDraft((d) => { const arr = [...d.items[sec]]; const j = i + dir; if (j < 0 || j >= arr.length) return d; [arr[i], arr[j]] = [arr[j], arr[i]]; return { ...d, items: { ...d.items, [sec]: arr } }; }); };
  const setHero = (patch) => { setDirty(true); setDraft((d) => ({ ...d, hero: { ...d.hero, ...patch } })); };
  const setHeroState = (i, patch) => { setDirty(true); setDraft((d) => ({ ...d, hero: { ...d.hero, states: d.hero.states.map((s, k) => k === i ? { ...s, ...patch } : s) } })); };
  const setFooter = (patch) => { setDirty(true); setDraft((d) => ({ ...d, footer: { ...(d.footer || {}), ...patch } })); };

  const save = async () => {
    setSaving(true);
    try { const { data } = await api.put("/admin/cms/homepage", { settings: draft.settings, items: draft.items, hero: draft.hero, footer: draft.footer }); setDraft((d) => ({ ...d, meta: { ...d.meta, last_saved: data.last_saved, saved_by: data.saved_by } })); setDirty(false); toast.success("Draft saved"); }
    catch (e) { toast.error(e.response?.data?.detail || "Save failed"); } finally { setSaving(false); }
  };
  const preview = async () => { if (dirty) await save(); window.open("/?cms_preview=1", "_blank"); };
  const publish = async () => {
    if (dirty) await save(); setPublishing(true);
    try { const { data } = await api.post("/admin/cms/homepage/publish"); setDraft((d) => ({ ...d, meta: { ...d.meta, last_published: data.last_published, published_by: data.published_by } })); toast.success("Published — live site updated"); }
    catch (e) { toast.error(e.response?.data?.detail || "Publish failed"); } finally { setPublishing(false); }
  };
  const patchService = async (code, patch) => {
    setServices((prev) => prev.map((s) => s.code === code ? { ...s, ...patch } : s));
    try { await api.patch(`/admin/services/${code}`, patch); toast.success("Saved"); } catch (e) { toast.error(e.response?.data?.detail || "Save failed"); loadDraft(); }
  };
  const moveService = (code, dir) => {
    const sorted = [...services].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const i = sorted.findIndex((s) => s.code === code); const j = i + dir; if (j < 0 || j >= sorted.length) return;
    patchService(sorted[i].code, { sort_order: sorted[j].sort_order || 0 }); patchService(sorted[j].code, { sort_order: sorted[i].sort_order || 0 });
  };

  if (!authChecked) return <div className="min-h-screen grid place-items-center" style={{ background: t.canvas }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: t.gold }} /></div>;
  if (!me) return null;

  const sidebarW = collapsed ? 76 : 290;
  const leftOffset = isMobile ? 0 : sidebarW;
  const HEADER_H = 68;
  const showSidebarLabels = !collapsed || isMobile;
  const stateLine = dirty ? "Unsaved changes" : (draft?.meta?.last_saved ? `Draft saved · ${new Date(draft.meta.last_saved).toLocaleTimeString()}` : "No draft saved yet");

  const statusFor = (key, missingMedia) => {
    const s = draft?.settings?.[key];
    if (missingMedia) return { tone: "gold", label: "Missing media" };
    if (s?.enabled === false) return { tone: "muted", label: "Hidden" };
    if (dirty) return { tone: "gold", label: "Draft changes" };
    return { tone: "ok", label: "Published" };
  };

  const renderAccountMenu = (anchor) => (
    <div className="absolute z-[100] w-52 rounded-xl overflow-hidden shadow-xl" style={{ background: t.card, border: `1px solid ${t.border}`, ...(anchor === "side" ? { bottom: "100%", left: 0, marginBottom: 8 } : { top: "100%", right: 0, marginTop: 8 }) }} data-testid="admin-account-menu">
      {[{ icon: UserCircle2, label: "Profile Settings", fn: () => { setPwOpen("profile"); setAcctMenu(null); } }, { icon: KeyRound, label: "Change Password", fn: () => { setPwOpen(true); setAcctMenu(null); } }, { icon: LogOut, label: "Logout", fn: () => { setAcctMenu(null); logout(); } }].map((r) => (
        <button key={r.label} onClick={r.fn} data-testid={`admin-acct-${r.label.split(" ")[0].toLowerCase()}`} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-left transition" style={{ color: t.text2 }}><r.icon className="w-4 h-4" />{r.label}</button>
      ))}
    </div>
  );

  return (
    <TCtx.Provider value={t}>
      <AdminScrollbarStyle />
      <div data-admin-scope data-testid="admin-panel" className="min-h-screen" style={{ background: t.canvas, color: t.text, fontFamily: "Inter, system-ui, sans-serif" }} onClick={() => { setAcctMenu(null); setNotifOpen(false); }}>

        {/* ============ SIDEBAR ============ */}
        {isMobile && drawerOpen && <div className="fixed inset-0 z-40" style={{ background: t.scrim }} onClick={() => setDrawerOpen(false)} data-testid="admin-drawer-scrim" />}
        <aside data-testid="admin-sidebar" className="fixed top-0 bottom-0 left-0 z-50 flex flex-col" onClick={(e) => e.stopPropagation()}
          style={{ width: isMobile ? 290 : sidebarW, background: t.sidebar, borderRight: `1px solid ${t.border}`, transform: isMobile ? `translateX(${drawerOpen ? 0 : -310}px)` : "none", transition: `transform 280ms ${ADMIN_EASE}, width 280ms ${ADMIN_EASE}` }}>
          <div className="flex items-center gap-3 px-4" style={{ height: HEADER_H, borderBottom: `1px solid ${t.border}` }}>
            <span className="w-9 h-9 rounded-xl grid place-items-center text-base font-black shrink-0" style={{ background: t.gold, color: "#0B0B0B" }}>B</span>
            {showSidebarLabels && <div className="min-w-0"><p className="text-sm font-bold leading-tight" style={{ color: t.text }}>BDesigner</p><p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: t.gold }}>Construction ERP</p></div>}
          </div>
          <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
            {SIDEBAR.map((grp) => (
              <div key={grp.group}>
                {showSidebarLabels && <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: t.muted }}>{grp.group}</p>}
                {grp.items.map((it) => {
                  const Icon = it.icon; const on = active === it.key; const enabled = !!it.enabled;
                  return (
                    <button key={it.key} disabled={!enabled} title={collapsed && !isMobile ? it.label : (!enabled ? "Coming in a future phase" : "")}
                      onClick={() => { if (enabled) { setActive(it.key); if (isMobile) setDrawerOpen(false); } }} data-testid={`admin-nav-${it.key}`}
                      className="w-full flex items-center gap-3 px-2.5 py-2.5 mb-0.5 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed"
                      style={on ? { background: t.elevated, color: t.text, boxShadow: `inset 2px 0 0 ${t.text2}` } : { color: enabled ? t.text2 : t.muted, opacity: enabled ? 1 : 0.45 }}>
                      <Icon className="w-[18px] h-[18px] shrink-0" style={{ color: on ? t.text : "inherit" }} />
                      {showSidebarLabels && <span className="flex-1 text-left truncate">{it.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="p-2.5 space-y-2.5" style={{ borderTop: `1px solid ${t.border}` }}>
            {showSidebarLabels ? (
              <div><p className="px-1 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: t.muted }}>Appearance</p><AdminAppearanceToggle mode={themeMode} onMode={setThemeMode} /></div>
            ) : (
              <button onClick={() => setThemeMode((m) => m === "dark" ? "light" : "dark")} className="w-full grid place-items-center py-2.5 rounded-lg" style={{ background: t.elevated, color: t.text2 }} title="Toggle theme"><Palette className="w-4 h-4" /></button>
            )}
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setAcctMenu(acctMenu === "side" ? null : "side"); }} data-testid="admin-profile-block" className="w-full flex items-center gap-2.5 p-2 rounded-lg transition" style={{ background: t.elevated }}>
                <span className="w-9 h-9 rounded-lg grid place-items-center text-xs font-bold shrink-0" style={{ background: t.gold, color: "#0B0B0B" }}>{initials(me.name)}</span>
                {showSidebarLabels && <span className="min-w-0 flex-1 text-left"><span className="block text-sm font-semibold truncate" style={{ color: t.text }}>{me.name}</span><span className="block text-[11px] truncate" style={{ color: t.muted }}>Administrator</span></span>}
                {showSidebarLabels && <ChevronDown className="w-4 h-4 shrink-0" style={{ color: t.muted }} />}
              </button>
              {acctMenu === "side" && renderAccountMenu("side")}
            </div>
          </div>
        </aside>

        {pwOpen && <ChangePasswordModal me={me} showProfile={pwOpen === "profile"} onClose={() => setPwOpen(false)} />}

        {/* ============ FIXED TOP BAR ============ */}
        <header data-testid="admin-header" className="fixed top-0 right-0 z-30 flex items-center gap-3 px-4 sm:px-6" style={{ left: leftOffset, height: HEADER_H, background: t.overlay, borderBottom: `1px solid ${t.border}`, backdropFilter: "blur(10px)", transition: `left 280ms ${ADMIN_EASE}` }}>
          <button onClick={() => isMobile ? setDrawerOpen(true) : setCollapsed((c) => !c)} data-testid="admin-sidebar-toggle" className="w-9 h-9 grid place-items-center rounded-lg shrink-0" style={{ color: t.text, border: `1px solid ${t.border}` }}><Menu className="w-4 h-4" /></button>
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.muted }} />
            <input data-testid="admin-global-search" placeholder="Search projects, leads, clients..." className="w-full rounded-full pl-9 pr-3 py-2.5 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} />
          </div>
          <button onClick={() => setThemeMode((m) => m === "dark" ? "light" : "dark")} data-testid="admin-theme-toggle" className="w-9 h-9 grid place-items-center rounded-full shrink-0" style={{ border: `1px solid ${t.border}`, color: t.text }} title="Toggle theme">{themeMode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
          <div className="relative shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setNotifOpen((v) => !v); }} data-testid="admin-notif" className="w-9 h-9 grid place-items-center rounded-full" style={{ border: `1px solid ${t.border}`, color: t.text }}><Bell className="w-4 h-4" /></button>
            {notifOpen && <div className="absolute top-full right-0 mt-2 w-60 rounded-xl p-4 text-center z-[100] shadow-xl" style={{ background: t.card, border: `1px solid ${t.border}` }} onClick={(e) => e.stopPropagation()}><Bell className="w-5 h-5 mx-auto mb-2" style={{ color: t.muted }} /><p className="text-xs" style={{ color: t.muted }}>No notifications yet</p></div>}
          </div>
          <div className="relative shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setAcctMenu(acctMenu === "top" ? null : "top"); }} data-testid="admin-topbar-avatar" className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full" style={{ border: `1px solid ${t.border}` }}>
              <span className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold" style={{ background: t.gold, color: "#0B0B0B" }}>{initials(me.name)}</span>
              <span className="text-sm font-semibold hidden sm:block" style={{ color: t.text }}>{me.name}</span>
            </button>
            {acctMenu === "top" && renderAccountMenu("top")}
          </div>
        </header>

        {/* ============ CONTENT ============ */}
        <div style={{ marginLeft: leftOffset, paddingTop: HEADER_H, transition: `margin-left 280ms ${ADMIN_EASE}`, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <div className="flex-1">
            {active !== "cms" && (
              <div className="px-5 sm:px-8 py-8" style={{ maxWidth: 1400, margin: "0 auto" }}>
                <AdminWorkspaceHeader title={SIDEBAR.flatMap((g) => g.items).find((i) => i.key === active)?.label || "Module"} subtitle="This workspace is coming in a future phase. The current release focuses on the Website CMS." />
                <div className="mt-6"><AdminEmptyState icon={CheckCircle2} title="Nothing here yet" description="This module will use the same BDesigner operations workspace pattern once enabled." /></div>
              </div>
            )}
            {active === "cms" && (
              <>
                {/* sticky CMS chrome */}
                <div className="sticky z-20" style={{ top: HEADER_H, background: t.canvas, borderBottom: `1px solid ${t.border}` }}>
                  <div className="px-5 sm:px-8 pt-4 flex items-center justify-between gap-3 flex-wrap" style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <div className="min-w-0"><h1 className="text-lg font-bold" style={{ color: t.text }}>Website CMS</h1><p className="text-[11px] flex items-center gap-1" style={{ color: dirty ? t.warnText : t.muted }}><Clock className="w-3 h-3" /> {stateLine}</p></div>
                    <div className="flex items-center gap-2">
                      <AdminActionButton variant="secondary" icon={Eye} onClick={preview} data-testid="cms-preview"><span className="hidden sm:inline">Preview</span></AdminActionButton>
                      <AdminActionButton variant="secondary" icon={saving ? Loader2 : Save} onClick={save} disabled={saving} data-testid="cms-save"><span className="hidden sm:inline">Save Draft</span></AdminActionButton>
                      <AdminActionButton variant="primary" icon={publishing ? Loader2 : Send} onClick={publish} disabled={publishing} data-testid="cms-publish">Publish</AdminActionButton>
                    </div>
                  </div>
                  <div className="px-5 sm:px-8 pt-2" style={{ maxWidth: 1400, margin: "0 auto" }}>
                    {!openSection ? <AdminTabs tabs={CMS_TABS} value={tab} onChange={(x) => setTab(x)} testidPrefix="cms-tab" />
                      : <button onClick={() => setOpenSection(null)} data-testid="cms-ws-back" className="text-xs font-semibold inline-flex items-center gap-1 pb-2.5" style={{ color: t.muted }}>← Back to Homepage CMS</button>}
                  </div>
                </div>

                <div className="px-5 sm:px-8 py-6" style={{ maxWidth: 1400, margin: "0 auto" }}>
                  {tab !== "Homepage" && <TabShell tab={tab} />}
                  {tab === "Homepage" && !draft && <Loader2 className="w-6 h-6 animate-spin" style={{ color: t.gold }} />}
                  {tab === "Homepage" && draft && !openSection && (
                    <div className="grid sm:grid-cols-2 gap-3" data-testid="cms-homepage">
                      {HOMEPAGE_SECTIONS.map((cfg) => {
                        const itemsArr = draft.items?.[cfg.key] || [];
                        let summary = "", status = statusFor(cfg.key);
                        if (cfg.kind === "hero") { const has = !!draft.hero?.video_portrait; summary = `${has ? "Video" : "No video"} · ${toMMSS(draft.hero?.total_duration)}`; status = has ? statusFor(cfg.key) : { tone: "gold", label: "Missing media" }; }
                        else if (cfg.kind === "services") summary = `${services.filter((s) => s.active !== false).length} of ${services.length} services`;
                        else if (cfg.kind === "items") summary = `${itemsArr.length} items`;
                        else if (cfg.kind === "listSettings") summary = `Max ${draft.settings?.[cfg.key]?.meta?.max_items || 8} · auto`;
                        else if (cfg.kind === "footer") summary = "Company · contact · socials";
                        else if (cfg.kind === "about") summary = "Story · image · audio";
                        else if (cfg.kind === "cta") summary = draft.settings?.[cfg.key]?.heading || "Call to action";
                        const Icon = cfg.icon;
                        return (
                          <button key={cfg.key} data-testid={`cms-section-${cfg.key}`} onClick={() => setOpenSection(cfg.key)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                            <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: t.elevated }}><Icon className="w-4 h-4" style={{ color: t.gold }} /></span>
                            <span className="min-w-0 flex-1"><span className="block text-sm font-bold truncate" style={{ color: t.text }}>{cfg.label}</span><span className="block text-[11px] truncate" style={{ color: t.muted }}>{summary}</span></span>
                            <AdminStatusBadge tone={status.tone}>{status.label}</AdminStatusBadge>
                            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: t.muted }} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {tab === "Homepage" && draft && openSection && (() => {
                    const cfg = HOMEPAGE_SECTIONS.find((c) => c.key === openSection);
                    const has = !!draft.hero?.video_portrait;
                    const status = cfg.kind === "hero" && !has ? { tone: "gold", label: "Missing media" } : statusFor(cfg.key);
                    return (
                      <div data-testid={`cms-workspace-${cfg.key}`}>
                        <AdminWorkspaceHeader title={cfg.label} status={status} meta={draft?.meta?.last_saved ? `Last saved ${new Date(draft.meta.last_saved).toLocaleString()}` : "No draft saved yet"}
                          actions={<AdminActionButton variant="secondary" icon={Eye} onClick={preview}>Preview</AdminActionButton>} />
                        {cfg.kind === "hero" && <div className="grid sm:grid-cols-4 gap-3 mt-5"><AdminSummaryCard label="Video" value={has ? "Uploaded" : "Missing"} icon={Film} /><AdminSummaryCard label="Duration" value={toMMSS(draft.hero?.total_duration)} icon={Clock} /><AdminSummaryCard label="States" value={String((draft.hero?.states || []).length)} icon={ListChecks} /><AdminSummaryCard label="Default" value={draft.hero?.default_state || "—"} icon={BadgeCheck} /></div>}
                        {cfg.kind === "services" && <div className="grid sm:grid-cols-3 gap-3 mt-5"><AdminSummaryCard label="Services" value={String(services.length)} icon={DraftingCompass} /><AdminSummaryCard label="Visible" value={String(services.filter((s) => s.active !== false).length)} icon={Eye} /><AdminSummaryCard label="Pricing" value="Admin → Pricing" icon={Tag} hint="Not editable here" /></div>}
                        <div className="mt-6">
                          {cfg.kind === "hero" && <HeroEditor draft={draft} setHero={setHero} setHeroState={setHeroState} />}
                          {cfg.kind === "services" && <ServicesEditor draft={draft} services={services} setSection={setSection} setSectionMeta={setSectionMeta} patchService={patchService} moveService={moveService} />}
                          {cfg.kind === "items" && <ItemsEditor cfg={cfg} draft={draft} setSection={setSection} setSectionMeta={setSectionMeta} setItem={setItem} moveItem={moveItem} />}
                          {cfg.kind === "listSettings" && <ListSettingsEditor cfg={cfg} draft={draft} setSection={setSection} setSectionMeta={setSectionMeta} />}
                          {cfg.kind === "about" && <AboutEditor draft={draft} setSection={setSection} setSectionMeta={setSectionMeta} />}
                          {cfg.kind === "cta" && <CtaEditor draft={draft} setSection={setSection} setSectionMeta={setSectionMeta} />}
                          {cfg.kind === "footer" && <FooterEditor draft={draft} setFooter={setFooter} />}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
          <footer className="px-5 sm:px-8 py-3 flex items-center justify-between text-[11px]" style={{ borderTop: `1px solid ${t.border}`, color: t.muted }}>
            <span>© 2026 BDesigner Construction ERP</span><span>v1.0 · Foundation</span>
          </footer>
        </div>
      </div>
    </TCtx.Provider>
  );
}

/* ============================ editors ============================ */
function HeaderFields({ draft, sec, setSection, setSectionMeta }) {
  const s = draft.settings?.[sec] || {};
  return (
    <Group title="Content">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>Eyebrow</Label><Field testid={`cms-${sec}-eyebrow`} value={s.meta?.eyebrow} onChange={(v) => setSectionMeta(sec, { eyebrow: v })} /></div>
        <div><Label>Main Heading</Label><Field testid={`cms-${sec}-heading`} value={s.heading} onChange={(v) => setSection(sec, { heading: v })} /></div>
      </div>
      <div><Label>Description / Supporting Text</Label><Field rows={2} value={s.subtitle} onChange={(v) => setSection(sec, { subtitle: v })} /></div>
    </Group>
  );
}
function VisibilityRow({ draft, sec, setSection }) {
  return <Group title="Section Settings"><Toggle testid={`cms-${sec}-visible`} checked={draft.settings?.[sec]?.enabled !== false} onChange={(v) => setSection(sec, { enabled: v })} label="Section visible on homepage" /></Group>;
}
function HeroEditor({ draft, setHero, setHeroState }) {
  const t = useT(); const dur = draft.hero?.total_duration || 0;
  return (
    <>
      <Group title="Media">
        <div><Label>Hero Video</Label><MediaField kind="video" value={draft.hero?.video_portrait} onChange={(u) => setHero({ video_portrait: u, video_landscape: u })} hint="MP4/WebM · full-screen homepage hero" /></div>
        <div className="grid sm:grid-cols-2 gap-3"><div><Label>Fallback Image</Label><MediaField kind="image" value={draft.hero?.fallback_image} onChange={(u) => setHero({ fallback_image: u })} /></div><div><Label>Logo</Label><MediaField kind="image" value={draft.hero?.logo} onChange={(u) => setHero({ logo: u })} /></div></div>
      </Group>
      <Group title="Timeline & Hero States">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Total Duration (MM:SS)</Label><MMSSField seconds={dur} onSeconds={(n) => setHero({ total_duration: n })} /></div>
          <div><Label>Default State</Label><select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} value={draft.hero?.default_state || "construction"} onChange={(e) => setHero({ default_state: e.target.value })}>{(draft.hero?.states || []).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
        </div>
        {(draft.hero?.states || []).map((s, i) => { const bad = fromMMSS(toMMSS(s.timestamp)) > dur; return (
          <div key={s.key} className="rounded-lg p-2.5" style={{ background: t.inputBg, border: `1px solid ${t.border}` }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
              <div><Label>Label</Label><Field value={s.label} onChange={(v) => setHeroState(i, { label: v })} /></div>
              <div><Label>Icon</Label><IconSelect value={s.icon} onChange={(v) => setHeroState(i, { icon: v })} /></div>
              <div><Label>Time (MM:SS)</Label><MMSSField seconds={s.timestamp} onSeconds={(n) => setHeroState(i, { timestamp: n })} /></div>
              <div><Label>Theme</Label><select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} value={s.theme} onChange={(e) => setHeroState(i, { theme: e.target.value })}><option value="light">Light</option><option value="dark">Dark</option></select></div>
            </div>
            {bad && <p className="text-[11px] mt-1.5" style={{ color: t.warnText }}>Timestamp exceeds total duration.</p>}
          </div>
        ); })}
      </Group>
    </>
  );
}
function MMSSField({ seconds, onSeconds }) {
  const t = useT(); const [txt, setTxt] = useState(toMMSS(seconds));
  useEffect(() => { setTxt(toMMSS(seconds)); }, [seconds]);
  const commit = () => { const n = fromMMSS(txt); if (n == null) setTxt(toMMSS(seconds)); else onSeconds(n); };
  return <input value={txt} onChange={(e) => setTxt(e.target.value)} onBlur={commit} placeholder="00:00" className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} />;
}
function ItemsEditor({ cfg, draft, setSection, setSectionMeta, setItem, moveItem }) {
  const t = useT(); const sec = cfg.key; const items = draft.items?.[sec] || [];
  const withImage = ["guarantee", "service_area", "homeowner_review"].includes(sec);
  const withIcon = ["guarantee", "trust_indicator", "construction_step", "service_area", "faq"].includes(sec);
  return (
    <>
      <HeaderFields draft={draft} sec={sec} setSection={setSection} setSectionMeta={setSectionMeta} />
      {(cfg.carousel || cfg.maxItems) && <Group title="Homepage Settings"><div className="grid sm:grid-cols-2 gap-3"><div><Label>Maximum Visible</Label><Field type="number" value={draft.settings?.[sec]?.meta?.max_items ?? 6} onChange={(v) => setSectionMeta(sec, { max_items: Number(v) })} /></div>{cfg.carousel && <div className="flex items-end pb-1"><Toggle checked={draft.settings?.[sec]?.meta?.autoplay !== false} onChange={(v) => setSectionMeta(sec, { autoplay: v })} label="Auto-rotate (5s)" /></div>}</div></Group>}
      <VisibilityRow draft={draft} sec={sec} setSection={setSection} />
      <Group title="Items">
        {items.length === 0 && <p className="text-sm" style={{ color: t.muted }}>No items yet.</p>}
        {items.map((it, i) => (
          <div key={i} className="rounded-lg p-3" style={{ background: t.inputBg, border: `1px solid ${t.border}` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold" style={{ color: t.muted }}>{ITEM_LABEL[sec] || "Item"} {i + 1}</span>
              <div className="flex items-center gap-1"><button onClick={() => moveItem(sec, i, -1)} className="p-1 rounded" style={{ color: t.text2 }}><ArrowUp className="w-3.5 h-3.5" /></button><button onClick={() => moveItem(sec, i, 1)} className="p-1 rounded" style={{ color: t.text2 }}><ArrowDown className="w-3.5 h-3.5" /></button><span className="ml-2"><Toggle checked={!it.hidden} onChange={(v) => setItem(sec, i, { hidden: !v })} label="Active" /></span></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <Field value={it.title} onChange={(v) => setItem(sec, i, { title: v })} placeholder={sec === "comparison_feature" ? "Feature" : sec === "faq" ? "Question" : "Title"} />
              {sec === "comparison_feature" ? (
                <div className="grid grid-cols-2 gap-2">
                  <select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} value={it.meta?.bdesigner || "yes"} onChange={(e) => setItem(sec, i, { meta: { ...(it.meta || {}), bdesigner: e.target.value } })}><option value="yes">BDesigner: Yes</option><option value="partial">Partial</option><option value="no">No</option></select>
                  <select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} value={it.meta?.others || "partial"} onChange={(e) => setItem(sec, i, { meta: { ...(it.meta || {}), others: e.target.value } })}><option value="yes">Others: Yes</option><option value="partial">Partial</option><option value="no">No</option></select>
                </div>
              ) : <Field value={it.value || it.label} onChange={(v) => setItem(sec, i, { value: v })} placeholder="Value / Label" />}
            </div>
            {sec !== "comparison_feature" && <div className="mt-2"><Field rows={2} value={it.description} onChange={(v) => setItem(sec, i, { description: v })} placeholder={sec === "faq" ? "Answer" : "Description"} /></div>}
            {(withIcon || withImage) && <div className="grid sm:grid-cols-2 gap-2 mt-2 items-start">{withIcon && <div><Label>Icon</Label><IconSelect value={it.icon} onChange={(v) => setItem(sec, i, { icon: v })} /></div>}{withImage && <div><Label>Image</Label><MediaField kind="image" value={it.image_url} alt={it.alt} onChange={(u) => setItem(sec, i, { image_url: u })} onAlt={(v) => setItem(sec, i, { alt: v })} /></div>}</div>}
          </div>
        ))}
      </Group>
    </>
  );
}
function ServicesEditor({ draft, services, setSection, setSectionMeta, patchService, moveService }) {
  const t = useT(); const sec = "architectural_service";
  const sorted = [...services].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  return (
    <>
      <HeaderFields draft={draft} sec={sec} setSection={setSection} setSectionMeta={setSectionMeta} />
      <VisibilityRow draft={draft} sec={sec} setSection={setSection} />
      <Group title="Services">
        <p className="text-[11px] -mt-1 mb-1" style={{ color: t.muted }}>Content saves instantly. Pricing is managed in Admin → Pricing.</p>
        {sorted.map((s, i) => (
          <div key={s.code} data-testid={`cms-service-${s.code}`} className="rounded-lg p-3" style={{ background: t.inputBg, border: `1px solid ${t.border}` }}>
            <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold" style={{ color: t.muted }}>{s.name}</span><div className="flex items-center gap-1"><button onClick={() => moveService(s.code, -1)} disabled={i === 0} className="p-1 rounded disabled:opacity-30" style={{ color: t.text2 }}><ArrowUp className="w-3.5 h-3.5" /></button><button onClick={() => moveService(s.code, 1)} disabled={i === sorted.length - 1} className="p-1 rounded disabled:opacity-30" style={{ color: t.text2 }}><ArrowDown className="w-3.5 h-3.5" /></button><span className="ml-2"><Toggle testid={`cms-service-active-${s.code}`} checked={s.active !== false} onChange={(v) => patchService(s.code, { active: v })} label="Active" /></span></div></div>
            <div className="grid sm:grid-cols-2 gap-2"><div><Label>Title</Label><Field value={s.name} onChange={(v) => patchService(s.code, { name: v })} /></div><div><Label>Short Description</Label><Field value={s.description} onChange={(v) => patchService(s.code, { description: v })} /></div></div>
            <div className="mt-2"><Label>Image</Label><MediaField kind="image" value={s.image} alt={s.alt} onChange={(u) => patchService(s.code, { image: u })} onAlt={(v) => patchService(s.code, { alt: v })} /></div>
          </div>
        ))}
      </Group>
    </>
  );
}
function ListSettingsEditor({ cfg, draft, setSection, setSectionMeta }) {
  const t = useT(); const sec = cfg.key;
  return (<><HeaderFields draft={draft} sec={sec} setSection={setSection} setSectionMeta={setSectionMeta} /><Group title="Homepage Settings"><div className="grid sm:grid-cols-2 gap-3"><div><Label>Maximum Items</Label><Field type="number" value={draft.settings?.[sec]?.meta?.max_items ?? 8} onChange={(v) => setSectionMeta(sec, { max_items: Number(v) })} /></div></div><p className="text-[11px]" style={{ color: t.muted }}>Project records are managed under Website CMS → Projects.</p></Group><VisibilityRow draft={draft} sec={sec} setSection={setSection} /></>);
}
function AboutEditor({ draft, setSection, setSectionMeta }) {
  const s = draft.settings?.advisor_benefit || {};
  return (<><HeaderFields draft={draft} sec="advisor_benefit" setSection={setSection} setSectionMeta={setSectionMeta} /><Group title="Media"><div><Label>About Image</Label><MediaField kind="image" value={s.meta?.image_url} alt={s.meta?.alt} onChange={(u) => setSectionMeta("advisor_benefit", { image_url: u })} onAlt={(v) => setSectionMeta("advisor_benefit", { alt: v })} /></div><div><Label>About Audio</Label><MediaField kind="audio" value={s.meta?.audio_url} onChange={(u) => setSectionMeta("advisor_benefit", { audio_url: u })} hint="Optional narrated intro" /></div></Group><VisibilityRow draft={draft} sec="advisor_benefit" setSection={setSection} /></>);
}
function CtaEditor({ draft, setSection, setSectionMeta }) {
  const s = draft.settings?.cta_section || {};
  return (<><HeaderFields draft={draft} sec="cta_section" setSection={setSection} setSectionMeta={setSectionMeta} /><Group title="Action"><div className="grid sm:grid-cols-2 gap-3"><div><Label>Button Label</Label><Field value={s.meta?.button_text || "Plan Your Dream Home"} onChange={(v) => setSectionMeta("cta_section", { button_text: v })} /></div><div><Label>Target</Label><Field value={s.meta?.button_link || "plan-your-dream-home"} onChange={(v) => setSectionMeta("cta_section", { button_link: v })} /></div></div><div><Label>Background Image (optional)</Label><MediaField kind="image" value={s.meta?.bg_url} onChange={(u) => setSectionMeta("cta_section", { bg_url: u })} /></div></Group><VisibilityRow draft={draft} sec="cta_section" setSection={setSection} /></>);
}
function FooterEditor({ draft, setFooter }) {
  const t = useT(); const f = draft.footer || {}; const c = f.contact || {}; const socials = f.social || [];
  const setContact = (patch) => setFooter({ contact: { ...c, ...patch } });
  const setSocial = (i, patch) => setFooter({ social: socials.map((s, k) => k === i ? { ...s, ...patch } : s) });
  return (
    <>
      <Group title="Company"><div><Label>About Text</Label><Field rows={3} value={f.about_text} onChange={(v) => setFooter({ about_text: v })} /></div></Group>
      <Group title="Contact"><div className="grid sm:grid-cols-3 gap-3"><div><Label>Phone</Label><Field value={c.phone} onChange={(v) => setContact({ phone: v })} /></div><div><Label>Email</Label><Field value={c.email} onChange={(v) => setContact({ email: v })} /></div><div><Label>Address</Label><Field value={c.address} onChange={(v) => setContact({ address: v })} /></div></div></Group>
      <Group title="Social Links">
        {socials.map((s, i) => (<div key={i} className="grid grid-cols-[130px,1fr,auto] gap-2 items-center"><select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} value={s.platform} onChange={(e) => setSocial(i, { platform: e.target.value })}>{["instagram", "youtube", "facebook", "linkedin", "twitter", "x"].map((p) => <option key={p} value={p}>{p}</option>)}</select><Field value={s.url} onChange={(v) => setSocial(i, { url: v })} placeholder="https://..." /><button onClick={() => setFooter({ social: socials.filter((_, k) => k !== i) })} className="p-2 rounded-lg" style={{ color: t.text2, border: `1px solid ${t.border}` }}><Trash2 className="w-3.5 h-3.5" /></button></div>))}
        <button onClick={() => setFooter({ social: [...socials, { platform: "instagram", url: "", visible: true }] })} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ border: `1px solid ${t.border}`, color: t.text }}>+ Add Social Link</button>
      </Group>
      <Group title="Copyright"><Field value={f.copyright} onChange={(v) => setFooter({ copyright: v })} placeholder="© 2026 BDesigner" /></Group>
    </>
  );
}

function TabShell({ tab }) {
  const copy = {
    Projects: { title: "Public Projects", desc: "Manage the portfolio projects shown on the public website.", empty: "No public projects configured yet." },
    "Homeowner Stories": { title: "Homeowner Stories", desc: "Manage the client stories shown across the website.", empty: "No homeowner stories added yet." },
    FAQs: { title: "FAQs", desc: "Manage the public questions and answers.", empty: "No FAQs configured yet." },
    About: { title: "About", desc: "Manage About page content, imagery and narrated audio.", empty: "No About content configured yet." },
    "How It Works": { title: "How It Works", desc: "Manage the workflow content and steps.", empty: "No workflow steps configured yet." },
    Contact: { title: "Contact", desc: "Manage public contact details and office information.", empty: "No contact details configured yet." },
    Media: { title: "Media Library", desc: "Browse and manage images, video and audio used across the website.", empty: "No media uploaded yet." },
    SEO: { title: "SEO", desc: "Manage page titles, descriptions and social share previews.", empty: "No SEO settings configured yet." },
  }[tab] || { title: tab, desc: "", empty: "Nothing configured yet." };
  return (
    <div data-testid={`cms-shell-${tab.replace(/\s+/g, "-").toLowerCase()}`}>
      <AdminWorkspaceHeader title={copy.title} subtitle={copy.desc} />
      <div className="mt-6"><AdminEmptyState icon={LayoutTemplate} title={copy.empty} description="This workspace uses the same BDesigner operations pattern and will be enabled here." /></div>
    </div>
  );
}

function ChangePasswordModal({ me, showProfile, onClose }) {
  const t = useT();
  const [cur, setCur] = useState(""); const [next, setNext] = useState(""); const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const submit = async (e) => {
    e?.preventDefault(); setErr("");
    if (next.length < 6) return setErr("New password must be at least 6 characters.");
    if (next !== confirm) return setErr("Passwords do not match.");
    setBusy(true);
    try { await api.post("/auth/change-password", { current_password: cur, new_password: next }); toast.success("Password updated"); onClose?.(); }
    catch (e2) { setErr(e2.response?.data?.detail || "Could not update password."); } finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-[100000] grid place-items-center px-4" style={{ background: t.scrim }} data-testid="admin-change-password-modal">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl p-6" style={{ background: t.card, border: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold" style={{ color: t.text }}>{showProfile ? "Profile Settings" : "Change Password"}</h3><button type="button" onClick={onClose} data-testid="admin-pw-close" className="w-9 h-9 grid place-items-center rounded-full" style={{ color: t.text2 }}><X className="w-4 h-4" /></button></div>
        {showProfile && <div className="mb-4 rounded-xl p-3" style={{ background: t.inputBg, border: `1px solid ${t.border}` }}><p className="text-sm font-semibold" style={{ color: t.text }}>{me?.name}</p><p className="text-xs" style={{ color: t.muted }}>{me?.email}</p><p className="text-[11px] mt-1" style={{ color: t.gold }}>Role: {me?.role}</p></div>}
        {err && <div data-testid="admin-pw-error" className="mb-3 text-sm rounded-lg px-3 py-2" style={{ color: t.dangerText, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>{err}</div>}
        <label className="block text-[11px] font-semibold mb-1.5" style={{ color: t.text2 }}>Current Password</label>
        <PasswordInput variant={t.mode} testid="admin-pw-current" placeholder="Current password" value={cur} onChange={setCur} autoComplete="current-password" />
        <label className="block text-[11px] font-semibold mb-1.5 mt-3" style={{ color: t.text2 }}>New Password</label>
        <PasswordInput variant={t.mode} testid="admin-pw-new" placeholder="New password (min 6)" value={next} onChange={setNext} autoComplete="new-password" />
        <label className="block text-[11px] font-semibold mb-1.5 mt-3" style={{ color: t.text2 }}>Confirm New Password</label>
        <PasswordInput variant={t.mode} testid="admin-pw-confirm" placeholder="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <button type="submit" disabled={busy} data-testid="admin-pw-submit" className="w-full mt-5 py-3 rounded-full font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: t.primaryBg, color: t.primaryText }}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} {showProfile ? "Update Password" : "Update Password"}</button>
      </form>
    </div>
  );
}
