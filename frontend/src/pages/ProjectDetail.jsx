import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api, { API } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import ShareMenu from "@/components/ShareMenu";
import CategoryGallery from "@/components/CategoryGallery";
import { useAuth } from "@/context/AuthContext";
import {
  Share2, Download, Eye, MessageSquare, Send,
  ChevronLeft, ChevronRight, MapPin, Layers, Wallet, Clock, Lock,
  FileText, ArrowRight, Compass,
} from "lucide-react";
import { track } from "@/lib/track";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "floor-plan", label: "2D Floor Plan" },
  { id: "elevation", label: "3D Elevation" },
  { id: "comments", label: "Comments" },
  { id: "downloads", label: "Download Files" },
];

function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n || 0);
}

function formatBytes(b) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Adapter: turn a project document into the ``groups`` shape that
 * <CategoryGallery /> expects. If the backend already returned enriched
 * groups (the common path) we pass them straight through. Otherwise we
 * synthesise a single "Uncategorized" group from the legacy flat list.
 */
function normaliseGroups(project, groupField, legacyField) {
  const enriched = project?.[groupField];
  if (Array.isArray(enriched) && enriched.length) return enriched;
  const flat = project?.[legacyField] || [];
  if (!flat.length) return [];
  return [
    {
      category_id: "uncategorized",
      images: flat,
      category: {
        id: "uncategorized",
        name: "Uncategorized",
        slug: "uncategorized",
        kind: groupField === "floor_plan_groups" ? "2d" : "3d",
        order: 999,
      },
    },
  ];
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user, requireAuth } = useAuth();
  const { settings } = useSettings();
  const [p, setP] = useState(null);
  const [tab, setTab] = useState("overview");
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [shares, setShares] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    let cancelled = false;
    api.get(`/projects/${id}`).then((r) => {
      if (cancelled) return;
      setP(r.data);
      setShares(r.data.shares || 0);
    });
    api.get(`/projects/${id}/comments`).then((r) => {
      if (!cancelled) setComments(r.data);
    });
    return () => { cancelled = true; };
  }, [id]);

  if (!p) {
    return (
      <div data-testid="project-detail-skeleton" className="max-w-7xl mx-auto px-4 py-10 sm:py-16">
        {/* hero */}
        <div className="mx-auto w-full max-w-[min(80vh,100vw)] aspect-square rounded-3xl shimmer" />
        {/* title + meta */}
        <div className="mt-8 space-y-4 max-w-3xl">
          <div className="h-9 w-2/3 rounded-lg shimmer" />
          <div className="h-4 w-40 rounded shimmer" />
          <div className="h-4 w-full rounded shimmer" />
          <div className="h-4 w-5/6 rounded shimmer" />
        </div>
        {/* spec grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const submitComment = async (e) => {
    e.preventDefault();
    if (!requireAuth("login")) return;
    if (!commentText.trim()) return;
    const { data } = await api.post(`/projects/${p.id}/comments`, { text: commentText, rating });
    setComments([data, ...comments]);
    setCommentText("");
  };

  const gallery = p.gallery && p.gallery.length ? p.gallery : [p.cover];

  return (
    <div data-testid="project-detail-page" className="pb-20">
      {/* HERO */}
      <section className="relative">
        <div className="relative w-full h-[52vh] sm:h-[62vh] overflow-hidden">
          <img src={gallery[galleryIdx]} alt={p.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-ink-900/30" />

          {/* Gallery controls */}
          {gallery.length > 1 && (
            <>
              <button
                data-testid="hero-prev"
                onClick={() => setGalleryIdx((i) => (i - 1 + gallery.length) % gallery.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur grid place-items-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                data-testid="hero-next"
                onClick={() => setGalleryIdx((i) => (i + 1) % gallery.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur grid place-items-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-44 relative z-10">
          <div className="glass-strong rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.tag && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gold text-ink-900">
                      {p.tag}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                    {p.style}
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">{p.title}</h1>
                <p className="text-slate-700 mt-2 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" /> {p.location}
                </p>

                <div className="flex flex-wrap gap-4 mt-5 text-sm text-slate-700">
                  <Stat icon={<Eye className="w-4 h-4" />} v={fmt(p.views)} l="views" testid="project-stat-views" />
                  <Stat icon={<Share2 className="w-4 h-4" />} v={fmt(shares)} l="shares" testid="project-stat-shares" />
                  <Stat icon={<MessageSquare className="w-4 h-4" />} v={fmt(p.comments)} l="comments" testid="project-stat-comments" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="relative inline-flex">
                  <ShareMenu
                    kind="project"
                    id={p.id}
                    url={typeof window !== "undefined" ? window.location.href : ""}
                    title={p.title}
                    variant="pill"
                    shares={shares}
                    onShared={(d) => setShares(d.shares ?? shares + 1)}
                    testid="project-share-action"
                    className="!px-5 !py-2.5 !text-sm shadow-[0_8px_24px_rgba(212,176,106,0.45)]"
                  />
                </span>
              </div>
            </div>

            {/* Quick specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100">
              <SpecBadge icon={<Layers className="w-4 h-4" />} label="Plot Size" value={p.plot_size} />
              <SpecBadge icon={<Layers className="w-4 h-4" />} label="Floors" value={p.floors} />
              <SpecBadge icon={<Wallet className="w-4 h-4" />} label="Budget" value={p.budget} />
              <SpecBadge icon={<Clock className="w-4 h-4" />} label="Timeline" value={p.timeline} />
              <SpecBadge icon={<MapPin className="w-4 h-4" />} label="Location" value={p.location_type} />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div data-testid="project-tabs" className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hide-scrollbar overflow-x-auto -mx-1">
            <div className="flex gap-1 py-2 min-w-max">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  data-testid={`tab-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    tab === t.id ? "bg-gold text-ink-900" : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {tab === "overview" && (
          <div data-testid="tab-content-overview" className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h3 className="font-display text-xl font-bold mb-3">About this project</h3>
                <p className="text-slate-700 leading-relaxed">{p.description}</p>
              </Card>
              <Card>
                <h3 className="font-display text-xl font-bold mb-3">Key Highlights</h3>
                <ul className="space-y-2">
                  {(p.highlights || []).map((h, i) => (
                    <li key={`hl-${i}-${String(h).slice(0, 24)}`} className="flex items-start gap-3 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </Card>
              {p.videos && p.videos.length > 0 && (
                <Card>
                  <h3 className="font-display text-xl font-bold mb-4">More Videos</h3>
                  <div className="hide-scrollbar overflow-x-auto snap-x snap-mandatory -mx-2 px-2">
                    <div className="flex gap-4">
                      {p.videos.map((v, i) => (
                        <div key={`vid-${i}-${v}`} className="flex-shrink-0 w-[320px] sm:w-[480px] aspect-video rounded-2xl overflow-hidden border border-slate-100 snap-start">
                          <iframe src={v} className="w-full h-full" allow="accelerometer; autoplay; encrypted-media" title={`Video ${i + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
            <aside className="space-y-4">
              <ArchitectChatCard project={p} settings={settings} />
            </aside>
          </div>
        )}

        {tab === "floor-plan" && (
          <TabSection title="2D Floor Plans" data-testid="tab-content-floor-plan">
            <CategoryGallery
              groups={normaliseGroups(p, "floor_plan_groups", "floor_plans")}
              kindLabel="2D Floor Plan"
              emptyLabel="No floor plans uploaded yet."
              testid="floor-plan-gallery"
            />
          </TabSection>
        )}

        {tab === "elevation" && (
          <TabSection title="3D Elevation Renders" data-testid="tab-content-elevation">
            <CategoryGallery
              groups={normaliseGroups(p, "elevation_groups", "elevations")}
              kindLabel="3D Elevation"
              emptyLabel="No elevation renders uploaded yet."
              testid="elevation-gallery"
            />
          </TabSection>
        )}

        {tab === "comments" && (
          <TabSection title="Comments & Reviews" data-testid="tab-content-comments">
            <Card>
              {user?.id ? (
                <form onSubmit={submitComment} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-700">Your rating:</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`text-2xl leading-none ${s <= rating ? "text-gold" : "text-slate-400"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    data-testid="comment-input"
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts on this project…"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/60 placeholder:text-slate-500"
                  />
                  <button
                    data-testid="comment-submit-btn"
                    type="submit"
                    className="btn-gold-metallic text-white font-bold rounded-xl px-5 py-2.5 transition inline-flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Post Comment
                  </button>
                </form>
              ) : (
                <LoginPrompt onClick={() => requireAuth("login")} message="Login to comment & review" />
              )}
            </Card>

            <div className="mt-6 space-y-3">
              {comments.length === 0 && <Empty label="No comments yet. Be the first to review!" />}
              {comments.map((c) => (
                <div key={c.id} className="glass rounded-2xl p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <img src={c.avatar} alt={c.user_name} className="w-10 h-10 rounded-full bg-slate-50" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-semibold text-sm">{c.user_name}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        {c.rating && (
                          <span className="text-xs text-gold">{"★".repeat(c.rating)}</span>
                        )}
                      </div>
                      <p className="text-slate-700 text-sm mt-1.5 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabSection>
        )}

        {tab === "downloads" && (
          <TabSection title="Download Project Files" data-testid="tab-content-downloads">
            <div className="grid lg:grid-cols-2 gap-4">
              <SectionPdfCard project={p} />
              <ReferenceFilesCard project={p} />
            </div>
          </TabSection>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, v, l, testid }) {
  return (
    <span data-testid={testid} className="inline-flex items-center gap-1.5">
      {icon}
      <span className="font-semibold text-slate-900">{v}</span>
      <span className="text-slate-500">{l}</span>
    </span>
  );
}
function SpecBadge({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="w-9 h-9 rounded-lg bg-gold/15 text-gold grid place-items-center">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
function Card({ children }) {
  return <div className="glass rounded-2xl p-5 sm:p-6">{children}</div>;
}

// ────────────────────────────────────────────────────────────────────────────
// Need Similar Design? — premium BDesigner-styled CTA that routes to the
// Architectural Design Services calculator (Fix 10).
// ────────────────────────────────────────────────────────────────────────────
function ArchitectChatCard() {
  return (
    <div
      data-testid="need-similar-design-card"
      className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_12px_36px_rgba(15,23,42,0.10)]"
    >
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl icon-chip grid place-items-center shrink-0">
          <Compass className="w-5 h-5" />
        </span>
        <h4 className="font-display font-bold text-slate-900 text-lg">Need Similar Design?</h4>
      </div>
      <p className="text-sm text-slate-600 mt-2.5 mb-4 leading-relaxed">
        Get an instant, itemised architectural design quotation tailored to your plot — 2D floor plan, 3D elevation, structural &amp; MEP.
      </p>
      <Link
        to="/architecture-services"
        data-testid="need-similar-design-cta"
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full btn-gold-metallic text-white font-semibold text-sm transition shadow-[0_6px_18px_rgba(172,136,51,0.32)]"
      >
        Get Free Quote
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function TabSection({ title, children, ...props }) {
  return (
    <section {...props} className="space-y-6 pb-16">
      <h2 className="font-display text-2xl sm:text-3xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
function Empty({ label }) {
  return <div className="text-center py-16 text-slate-500 text-sm">{label}</div>;
}
function LoginPrompt({ onClick, message }) {
  return (
    <div className="text-center py-6">
      <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold grid place-items-center mx-auto mb-3">
        <Lock className="w-5 h-5" />
      </div>
      <p className="text-slate-700 mb-3">{message}</p>
      <button
        data-testid="login-prompt-btn"
        onClick={onClick}
        className="px-5 py-2.5 rounded-full btn-gold-metallic text-white font-bold transition"
      >
        Login to continue
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SectionPdfCard — section-specific PDF downloads. Each button hits the
// existing /projects/{id}/report.pdf endpoint with a `section` query param
// to produce a focused PDF containing only that image section (A4 portrait,
// one image per page).
// ────────────────────────────────────────────────────────────────────────────
function SectionPdfCard({ project }) {
  const [busy, setBusy] = useState(null); // "floor-plan" | "elevation" | null

  const downloadSection = async (section, label) => {
    if (busy) return;
    setBusy(section);
    track("project", project.id, `download_${section}`, null);
    try {
      const url = `${API}/projects/${project.id}/report.pdf?section=${encodeURIComponent(section)}`;
      const res = await fetch(url, { credentials: "omit" });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      let filename = `${(project.title || "project").replace(/[^a-z0-9-_]+/gi, "_")}-${section}.pdf`;
      const cd = res.headers.get("content-disposition") || "";
      const m = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      if (m && m[1]) filename = decodeURIComponent(m[1]);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    } catch (err) {
      console.error(`${label} download failed`, err);
      alert(`Sorry — we couldn't prepare the ${label} PDF just now. Please try again.`);
    } finally {
      setBusy(null);
    }
  };

  const floorCount = (project.floor_plan_groups || []).reduce(
    (n, g) => n + ((g.images || []).length || 0), 0,
  ) || (project.floor_plans || []).length;
  const elevCount = (project.elevation_groups || []).reduce(
    (n, g) => n + ((g.images || []).length || 0), 0,
  ) || (project.elevations || []).length;

  return (
    <div className="glass rounded-2xl p-5 sm:p-6" data-testid="project-section-pdfs">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 grid place-items-center flex-shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h4 className="font-display font-bold text-slate-900">Section PDFs</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            A4 portrait · one image per page · proportional fit
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <SectionPdfButton
          testid="download-floor-plan-pdf"
          label="2D Floor Plan PDF"
          count={floorCount}
          disabled={busy !== null || !floorCount}
          busy={busy === "floor-plan"}
          onClick={() => downloadSection("floor-plan", "2D Floor Plan")}
        />
        <SectionPdfButton
          testid="download-elevation-pdf"
          label="3D Elevation PDF"
          count={elevCount}
          disabled={busy !== null || !elevCount}
          busy={busy === "elevation"}
          onClick={() => downloadSection("elevation", "3D Elevation")}
        />
      </div>
    </div>
  );
}

function SectionPdfButton({ label, count, busy, disabled, onClick, testid }) {
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-gold/40 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-left"
    >
      <span className="w-9 h-9 rounded-lg bg-gold/15 text-gold-700 grid place-items-center flex-shrink-0">
        <FileText className="w-4 h-4" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-slate-900 truncate">{label}</span>
        <span className="block text-[11px] text-slate-500">
          {count ? `${count} image${count === 1 ? "" : "s"} · A4 portrait` : "No images attached"}
        </span>
      </span>
      <span className="text-xs font-semibold inline-flex items-center gap-1 text-slate-700">
        {busy ? (
          <span className="text-gold-700">Preparing…</span>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            PDF
          </>
        )}
      </span>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ReferenceFilesCard — surfaces any additional reference files attached to
// the project (admin-uploaded). Falls back to a friendly empty state.
// ────────────────────────────────────────────────────────────────────────────
function ReferenceFilesCard({ project }) {
  const refs = Array.isArray(project?.reference_files) ? project.reference_files : [];
  return (
    <div className="glass rounded-2xl p-5 sm:p-6" data-testid="project-reference-files">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 grid place-items-center flex-shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h4 className="font-display font-bold text-slate-900">Reference Files</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Drawings, specs and supporting documents
          </p>
        </div>
      </div>
      {refs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-xs text-slate-500">
          No additional reference files have been attached yet.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {refs.map((f, i) => (
            <li key={`ref-${i}-${f.url || f.filename}`} className="py-3 flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-gold/10 text-gold-700 grid place-items-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {f.filename || f.title || `File ${i + 1}`}
                </div>
                <div className="text-[11px] text-slate-500">
                  {f.content_type || "Document"}
                  {f.size ? ` · ${formatBytes(f.size)}` : ""}
                </div>
              </div>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                data-testid={`reference-file-${i}`}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
