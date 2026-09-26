import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { setStoredToken } from "@/lib/api";
import getIcon, { ICON_NAMES } from "@/components/home/iconMap";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, FolderKanban, UserSquare, MessagesSquare, Boxes,
  FileSignature, Wallet, FileText, Globe, Tag, LayoutTemplate, MapPin, Settings,
  LogOut, ChevronDown, ChevronRight, Upload, Trash2, Eye, Loader2, Save, Send,
  ArrowUp, ArrowDown, ImageIcon, Film, Music, X,
} from "lucide-react";

const SIDEBAR = [
  { group: "MAIN", items: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "leads", label: "Leads", icon: MessagesSquare },
    { key: "projects", label: "Projects", icon: FolderKanban },
    { key: "clients", label: "Clients", icon: UserSquare },
    { key: "team", label: "Team", icon: Users },
    { key: "chat", label: "Chat", icon: MessagesSquare },
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

const SECTION_LABELS = {
  hero: "Hero", trust_indicator: "Trust Indicators", construction_step: "How It Works",
  service_area: "Service Area / Availability", guarantee: "Guarantees You Deserve",
  comparison_feature: "Why Choose BDesigner", homeowner_review: "Homeowner Stories",
  faq: "FAQs", advisor_benefit: "About BDesigner", construction_package: "Packages",
  service_area_region: "Service Area Regions", shop_by_category: "Categories", cta_section: "Final CTA",
};
const ITEM_SECTIONS = ["trust_indicator", "construction_step", "service_area", "guarantee", "comparison_feature", "homeowner_review", "faq"];

/* ── Media upload field (image / video / audio) ── */
function MediaField({ kind = "image", value, alt, onChange, onAlt, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const accept = kind === "image" ? "image/jpeg,image/png,image/webp,image/svg+xml" : kind === "video" ? "video/mp4,video/webm" : "audio/mpeg,audio/wav,audio/mp4,audio/ogg";
  const pick = () => inputRef.current?.click();
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setPct(0);
    const fd = new FormData();
    fd.append("kind", kind); fd.append("file", file);
    try {
      const { data } = await api.post("/admin/media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => setPct(Math.round((p.loaded / (p.total || 1)) * 100)),
      });
      onChange?.(data.url);
      toast.success("Uploaded");
    } catch (e2) {
      toast.error(e2.response?.data?.detail || "Upload failed");
    } finally { setBusy(false); if (inputRef.current) inputRef.current.value = ""; }
  };
  const Icon = kind === "image" ? ImageIcon : kind === "video" ? Film : Music;
  return (
    <div className="rounded-xl p-3" style={{ background: "#0F0F0F", border: "1px solid #292929" }}>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg overflow-hidden grid place-items-center shrink-0" style={{ background: "#1A1A1A", border: "1px solid #292929" }}>
          {value ? (
            kind === "image" ? <img src={value} alt="" className="w-full h-full object-cover" />
            : kind === "video" ? <Film className="w-6 h-6" style={{ color: "#C9A24A" }} />
            : <Music className="w-6 h-6" style={{ color: "#C9A24A" }} />
          ) : <Icon className="w-6 h-6" style={{ color: "#555" }} />}
        </div>
        <div className="min-w-0 flex-1">
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={upload} />
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={pick} disabled={busy} data-testid={`media-upload-${kind}`}
              className="text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-60" style={{ background: "#F5F5F5", color: "#0B0B0B" }}>
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {value ? `Replace ${kind}` : `Upload ${kind}`}
            </button>
            {value && <button type="button" onClick={() => onChange?.("")} className="text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1.5" style={{ background: "transparent", color: "#F5F5F5", border: "1px solid #292929" }}><Trash2 className="w-3.5 h-3.5" /> Remove</button>}
          </div>
          {busy && <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "#292929" }}><div style={{ width: `${pct}%`, background: "#C9A24A", height: "100%" }} /></div>}
          {hint && <p className="text-[11px] mt-1.5" style={{ color: "#777" }}>{hint}</p>}
        </div>
      </div>
      {(kind === "video" || kind === "audio") && value && (
        kind === "video"
          ? <video src={value} controls className="mt-2 w-full max-h-40 rounded-lg" />
          : <audio src={value} controls className="mt-2 w-full" />
      )}
      {kind === "image" && onAlt && (
        <input value={alt || ""} onChange={(e) => onAlt(e.target.value)} placeholder="Alt text (accessibility)"
          className="mt-2 w-full text-xs rounded-lg px-3 py-2 outline-none" style={{ background: "#0B0B0B", border: "1px solid #292929", color: "#F5F5F5" }} />
      )}
    </div>
  );
}

const fieldCls = "w-full rounded-lg px-3 py-2.5 text-sm outline-none";
const fieldStyle = { background: "#0B0B0B", border: "1px solid #292929", color: "#F5F5F5" };
const Label = ({ children }) => <label className="block text-[11px] font-semibold mb-1.5" style={{ color: "#B5B5B5" }}>{children}</label>;

export default function AdminPanel() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [active, setActive] = useState("cms");
  const [tab, setTab] = useState("Homepage");
  const [draft, setDraft] = useState(null);
  const [open, setOpen] = useState({ hero: true, guarantee: true });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => {
      if (data.role !== "admin") { setStoredToken(null); navigate("/admin/login"); return; }
      setMe(data);
    }).catch(() => navigate("/admin/login")).finally(() => setAuthChecked(true));
  }, [navigate]);

  const loadDraft = useCallback(() => {
    api.get("/admin/cms/homepage").then(({ data }) => setDraft(data)).catch(() => toast.error("Failed to load CMS content"));
  }, []);
  useEffect(() => { if (me) loadDraft(); }, [me, loadDraft]);

  const logout = () => { setStoredToken(null); navigate("/admin/login"); };

  const setSection = (sec, patch) => { setDirty(true); setDraft((d) => ({ ...d, settings: { ...d.settings, [sec]: { ...(d.settings?.[sec] || {}), ...patch } } })); };
  const setSectionMeta = (sec, patch) => { setDirty(true); setDraft((d) => ({ ...d, settings: { ...d.settings, [sec]: { ...(d.settings?.[sec] || {}), meta: { ...((d.settings?.[sec] || {}).meta || {}), ...patch } } } })); };
  const setItem = (sec, i, patch) => { setDirty(true); setDraft((d) => ({ ...d, items: { ...d.items, [sec]: d.items[sec].map((it, k) => k === i ? { ...it, ...patch } : it) } })); };
  const moveItem = (sec, i, dir) => { setDirty(true); setDraft((d) => { const arr = [...d.items[sec]]; const j = i + dir; if (j < 0 || j >= arr.length) return d; [arr[i], arr[j]] = [arr[j], arr[i]]; return { ...d, items: { ...d.items, [sec]: arr } }; }); };
  const setHero = (patch) => { setDirty(true); setDraft((d) => ({ ...d, hero: { ...d.hero, ...patch } })); };
  const setHeroState = (i, patch) => { setDirty(true); setDraft((d) => ({ ...d, hero: { ...d.hero, states: d.hero.states.map((s, k) => k === i ? { ...s, ...patch } : s) } })); };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/admin/cms/homepage", { settings: draft.settings, items: draft.items, hero: draft.hero, footer: draft.footer });
      setDraft((d) => ({ ...d, meta: { ...d.meta, last_saved: data.last_saved, saved_by: data.saved_by } }));
      setDirty(false); toast.success("Draft saved");
    } catch (e) { toast.error(e.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };
  const preview = async () => {
    if (dirty) await save();
    window.open("/?cms_preview=1", "_blank");
  };
  const publish = async () => {
    if (dirty) await save();
    setPublishing(true);
    try {
      const { data } = await api.post("/admin/cms/homepage/publish");
      setDraft((d) => ({ ...d, meta: { ...d.meta, last_published: data.last_published, published_by: data.published_by } }));
      toast.success("Published — live site updated");
    } catch (e) { toast.error(e.response?.data?.detail || "Publish failed"); }
    finally { setPublishing(false); }
  };

  if (!authChecked) return <div className="min-h-screen grid place-items-center" style={{ background: "#0B0B0B" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "#C9A24A" }} /></div>;
  if (!me) return null;

  return (
    <div data-theme="dark" data-testid="admin-panel" className="min-h-screen flex" style={{ background: "#0B0B0B", color: "#F5F5F5", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 overflow-y-auto" style={{ background: "#111111", borderRight: "1px solid #292929" }}>
        <div className="px-5 py-5" style={{ borderBottom: "1px solid #292929" }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C9A24A" }}>BDesigner</p>
          <p className="text-sm font-semibold mt-0.5">Admin Console</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-5">
          {SIDEBAR.map((grp) => (
            <div key={grp.group}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#555" }}>{grp.group}</p>
              {grp.items.map((it) => {
                const Icon = it.icon; const on = active === it.key;
                return (
                  <button key={it.key} disabled={!it.enabled} onClick={() => it.enabled && setActive(it.key)}
                    data-testid={`admin-nav-${it.key}`}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed"
                    style={on ? { background: "#1A1A1A", color: "#F5F5F5" } : { color: it.enabled ? "#B5B5B5" : "#555" }}>
                    <Icon className="w-[18px] h-[18px]" />
                    <span className="flex-1 text-left">{it.label}</span>
                    {!it.enabled && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#1A1A1A", color: "#777" }}>Later</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <button onClick={logout} data-testid="admin-logout" className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: "#B5B5B5", border: "1px solid #292929" }}><LogOut className="w-4 h-4" /> Sign out</button>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-0 z-10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3" style={{ background: "rgba(11,11,11,0.9)", borderBottom: "1px solid #292929", backdropFilter: "blur(8px)" }}>
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">Website CMS</h1>
            <p className="text-[11px]" style={{ color: "#777" }}>
              {draft?.meta?.last_saved ? `Saved ${new Date(draft.meta.last_saved).toLocaleString()}` : "No draft saved yet"}
              {draft?.meta?.last_published ? ` · Published ${new Date(draft.meta.last_published).toLocaleString()}${draft.meta.published_by ? ` by ${draft.meta.published_by}` : ""}` : ""}
              {dirty ? " · Unsaved changes" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={preview} data-testid="cms-preview" className="text-xs font-semibold px-3 py-2 rounded-full inline-flex items-center gap-1.5" style={{ border: "1px solid #292929", color: "#F5F5F5" }}><Eye className="w-3.5 h-3.5" /> Preview</button>
            <button onClick={save} disabled={saving} data-testid="cms-save" className="text-xs font-semibold px-3 py-2 rounded-full inline-flex items-center gap-1.5 disabled:opacity-60" style={{ border: "1px solid #292929", color: "#F5F5F5" }}>{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Draft</button>
            <button onClick={publish} disabled={publishing} data-testid="cms-publish" className="text-xs font-bold px-4 py-2 rounded-full inline-flex items-center gap-1.5 disabled:opacity-60" style={{ background: "#C9A24A", color: "#0B0B0B" }}>{publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Publish</button>
          </div>
        </div>

        {/* CMS Tabs */}
        <div className="px-4 sm:px-6 pt-4 flex gap-2 overflow-x-auto" style={{ borderBottom: "1px solid #1A1A1A" }}>
          {CMS_TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} data-testid={`cms-tab-${t.replace(/\s+/g, "-").toLowerCase()}`}
              className="text-sm font-semibold px-3 pb-3 whitespace-nowrap" style={{ color: tab === t ? "#F5F5F5" : "#777", borderBottom: tab === t ? "2px solid #C9A24A" : "2px solid transparent" }}>{t}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {tab !== "Homepage" && (
            <div className="max-w-lg rounded-2xl p-6" style={{ background: "#111111", border: "1px solid #292929" }}>
              <p className="text-sm" style={{ color: "#B5B5B5" }}>The <b>{tab}</b> tab arrives in a later phase. Phase 1 delivers the <b>Homepage</b> CMS.</p>
            </div>
          )}
          {tab === "Homepage" && !draft && <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#C9A24A" }} />}
          {tab === "Homepage" && draft && (
            <div className="max-w-3xl space-y-3" data-testid="cms-homepage">
              {/* HERO */}
              <Collapsible label="Hero" k="hero" open={open} setOpen={setOpen}>
                <Label>Hero Video</Label>
                <MediaField kind="video" value={draft.hero?.video_portrait} onChange={(u) => setHero({ video_portrait: u, video_landscape: u })} hint="MP4/WebM. Used full-screen on the homepage hero." />
                <div className="mt-3"><Label>Fallback / Placeholder Image</Label>
                  <MediaField kind="image" value={draft.hero?.fallback_image} onChange={(u) => setHero({ fallback_image: u })} hint="Shown before the video loads. JPG/PNG/WEBP." /></div>
                <div className="mt-3"><Label>Logo (hero/header asset)</Label>
                  <MediaField kind="image" value={draft.hero?.logo} onChange={(u) => setHero({ logo: u })} hint="PNG/SVG preferred." /></div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><Label>Total Duration (sec)</Label><input type="number" className={fieldCls} style={fieldStyle} value={draft.hero?.total_duration || 0} onChange={(e) => setHero({ total_duration: Number(e.target.value) })} /></div>
                  <div><Label>Default State</Label>
                    <select className={fieldCls} style={fieldStyle} value={draft.hero?.default_state || "construction"} onChange={(e) => setHero({ default_state: e.target.value })}>
                      {(draft.hero?.states || []).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select></div>
                </div>
                <div className="mt-3 space-y-2">
                  {(draft.hero?.states || []).map((s, i) => (
                    <div key={s.key} className="grid grid-cols-[1fr,1fr,80px,90px] gap-2 items-end rounded-lg p-2" style={{ background: "#0F0F0F", border: "1px solid #292929" }}>
                      <div><Label>Label</Label><input className={fieldCls} style={fieldStyle} value={s.label} onChange={(e) => setHeroState(i, { label: e.target.value })} /></div>
                      <div><Label>Icon</Label><IconSelect value={s.icon} onChange={(v) => setHeroState(i, { icon: v })} /></div>
                      <div><Label>Time</Label><input type="number" className={fieldCls} style={fieldStyle} value={s.timestamp} onChange={(e) => setHeroState(i, { timestamp: Number(e.target.value) })} /></div>
                      <div><Label>Theme</Label><select className={fieldCls} style={fieldStyle} value={s.theme} onChange={(e) => setHeroState(i, { theme: e.target.value })}><option value="light">Light</option><option value="dark">Dark</option></select></div>
                    </div>
                  ))}
                </div>
              </Collapsible>

              {/* Content sections */}
              {Object.keys(draft.items || {}).filter((s) => SECTION_LABELS[s]).map((sec) => (
                <Collapsible key={sec} label={SECTION_LABELS[sec] || sec} k={sec} open={open} setOpen={setOpen}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label>Eyebrow</Label><input data-testid={`cms-${sec}-eyebrow`} className={fieldCls} style={fieldStyle} value={draft.settings?.[sec]?.meta?.eyebrow || ""} onChange={(e) => setSectionMeta(sec, { eyebrow: e.target.value })} /></div>
                    <div><Label>Main Heading</Label><input data-testid={`cms-${sec}-heading`} className={fieldCls} style={fieldStyle} value={draft.settings?.[sec]?.heading || ""} onChange={(e) => setSection(sec, { heading: e.target.value })} /></div>
                  </div>
                  <div className="mt-3"><Label>Description / Subtitle</Label><textarea className={fieldCls} style={fieldStyle} rows={2} value={draft.settings?.[sec]?.subtitle || ""} onChange={(e) => setSection(sec, { subtitle: e.target.value })} /></div>
                  <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer" style={{ color: "#B5B5B5" }}>
                    <input type="checkbox" checked={draft.settings?.[sec]?.enabled !== false} onChange={(e) => setSection(sec, { enabled: e.target.checked })} /> Section visible
                  </label>
                  {ITEM_SECTIONS.includes(sec) && (draft.items[sec] || []).map((it, i) => (
                    <div key={i} className="mt-3 rounded-lg p-3" style={{ background: "#0F0F0F", border: "1px solid #292929" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold" style={{ color: "#777" }}>Item {i + 1}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveItem(sec, i, -1)} className="p-1 rounded" style={{ color: "#B5B5B5" }}><ArrowUp className="w-3.5 h-3.5" /></button>
                          <button onClick={() => moveItem(sec, i, 1)} className="p-1 rounded" style={{ color: "#B5B5B5" }}><ArrowDown className="w-3.5 h-3.5" /></button>
                          <label className="flex items-center gap-1 text-[11px] ml-2" style={{ color: "#B5B5B5" }}><input type="checkbox" checked={!it.hidden} onChange={(e) => setItem(sec, i, { hidden: !e.target.checked })} /> Active</label>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <input className={fieldCls} style={fieldStyle} placeholder="Title / Feature" value={it.title || ""} onChange={(e) => setItem(sec, i, { title: e.target.value })} />
                        {sec === "comparison_feature" ? (
                          <div className="grid grid-cols-2 gap-2">
                            <select className={fieldCls} style={fieldStyle} value={it.meta?.bdesigner || "yes"} onChange={(e) => setItem(sec, i, { meta: { ...(it.meta || {}), bdesigner: e.target.value } })}><option value="yes">BDesigner: Yes</option><option value="partial">Partial</option><option value="no">No</option></select>
                            <select className={fieldCls} style={fieldStyle} value={it.meta?.others || "partial"} onChange={(e) => setItem(sec, i, { meta: { ...(it.meta || {}), others: e.target.value } })}><option value="yes">Others: Yes</option><option value="partial">Partial</option><option value="no">No</option></select>
                          </div>
                        ) : (
                          <input className={fieldCls} style={fieldStyle} placeholder="Value / Label" value={it.value || it.label || ""} onChange={(e) => setItem(sec, i, { value: e.target.value })} />
                        )}
                      </div>
                      {sec !== "comparison_feature" && <textarea className={`${fieldCls} mt-2`} style={fieldStyle} rows={2} placeholder="Description" value={it.description || ""} onChange={(e) => setItem(sec, i, { description: e.target.value })} />}
                      {["guarantee", "trust_indicator", "construction_step", "service_area", "faq"].includes(sec) && (
                        <div className="grid sm:grid-cols-2 gap-2 mt-2 items-start">
                          <div><Label>Icon</Label><IconSelect value={it.icon} onChange={(v) => setItem(sec, i, { icon: v })} /></div>
                          {["guarantee", "service_area", "homeowner_review"].includes(sec) && <div><Label>Image</Label><MediaField kind="image" value={it.image_url} onChange={(u) => setItem(sec, i, { image_url: u })} /></div>}
                        </div>
                      )}
                    </div>
                  ))}
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Collapsible({ label, k, open, setOpen, children }) {
  const isOpen = !!open[k];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid #292929" }}>
      <button onClick={() => setOpen((o) => ({ ...o, [k]: !o[k] }))} data-testid={`cms-section-${k}`} className="w-full flex items-center justify-between px-4 py-3.5">
        <span className="text-sm font-bold">{label}</span>
        {isOpen ? <ChevronDown className="w-4 h-4" style={{ color: "#777" }} /> : <ChevronRight className="w-4 h-4" style={{ color: "#777" }} />}
      </button>
      {isOpen && <div className="px-4 pb-4" style={{ borderTop: "1px solid #1A1A1A" }}><div className="pt-3">{children}</div></div>}
    </div>
  );
}

function IconSelect({ value, onChange }) {
  const Icon = getIcon(value);
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: "#1A1A1A", border: "1px solid #292929" }}><Icon className="w-4 h-4" style={{ color: "#F5F5F5" }} /></span>
      <select className={fieldCls} style={fieldStyle} value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">— icon —</option>
        {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  );
}
