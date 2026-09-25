import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search as SearchIcon, ArrowLeft, X, Home, Layers, Sparkles,
  HardHat, Building2, ChevronRight,
} from "lucide-react";
import api from "@/lib/api";

// Popular searches — desktop variant uses icons + labels, mobile variant uses chips
const POPULAR = [
  { icon: Home,        label: "Modern House Design",   q: "modern house design" },
  { icon: Home,        label: "Duplex House Plan",     q: "duplex house plan" },
  { icon: Home,        label: "30x40 House Design",    q: "30x40 house" },
  { icon: HardHat,     label: "Turnkey Construction",  q: "turnkey construction" },
  { icon: Building2,   label: "Structural Consultant", q: "structural" },
  { icon: Layers,      label: "Floor Plans",           q: "floor plan" },
];

const MOBILE_CHIPS = [
  "House Designs", "Floor Plans",
  "Construction Packages", "Interior Designs",
];

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState({ projects: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const nav = useNavigate();

  // Lock body scroll while overlay is open + auto-focus input.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus after the slide-down transition so iOS keyboards pop properly.
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      document.body.style.overflow = original;
      clearTimeout(t);
    };
  }, [open]);

  // Reset query when closed.
  useEffect(() => {
    if (!open) {
      setQ("");
      setRes({ projects: [] });
    }
  }, [open]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounced live search.
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (!term) {
      setRes({ projects: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const t = setTimeout(() => {
      api
        .get(`/search?q=${encodeURIComponent(term)}&limit=6`)
        .then((r) => {
          if (cancelled) return;
          setRes({
            projects: r.data?.projects || [],
          });
        })
        .catch(() => {
          if (!cancelled) {
            setRes({ projects: [] });
          }
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 220);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, open]);

  const goTo = useCallback((path) => {
    onClose?.();
    // Small delay so the overlay close animation finishes before nav.
    setTimeout(() => nav(path), 50);
  }, [nav, onClose]);

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    goTo(`/search?q=${encodeURIComponent(term)}`);
  };

  const hasResults = useMemo(
    () => res.projects.length > 0,
    [res],
  );

  if (!open) return null;

  return (
    <div
      data-testid="search-overlay"
      className="fixed inset-0 z-[100] bg-white animate-search-down"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Top bar — sticky so the input stays accessible while scrolling */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            data-testid="search-overlay-back"
            className="w-10 h-10 grid place-items-center rounded-full hover:bg-slate-100 text-slate-700"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form onSubmit={submit} className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              data-testid="search-overlay-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Projects & Home Designs"
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-12 pr-12 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold/20 transition"
              autoComplete="off"
              enterKeyHint="search"
            />
            {q && (
              <button
                type="button"
                onClick={() => { setQ(""); inputRef.current?.focus(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full hover:bg-slate-100 text-slate-500"
                aria-label="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto h-[calc(100vh-64px)] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-full">
          {/* Empty state → popular searches */}
          {!q.trim() && (
            <>
              {/* Desktop / tablet rich popular list */}
              <section className="hidden sm:block">
                <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-4">
                  Popular Searches
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setQ(p.q)}
                        data-testid={`popular-${p.q.replace(/\s+/g, "-")}`}
                        className="group flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-gold-400 hover:bg-gold/5 text-left transition"
                      >
                        <span className="w-10 h-10 rounded-xl bg-gold/10 grid place-items-center text-gold-600 group-hover:bg-gold/15 transition">
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="text-sm font-medium text-slate-800">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Mobile compact chips */}
              <section className="sm:hidden">
                <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-3">
                  Popular Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {MOBILE_CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setQ(c)}
                      data-testid={`mobile-chip-${c.replace(/\s+/g, "-")}`}
                      className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm text-slate-700 hover:border-gold-400 hover:bg-gold/5 transition"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Results */}
          {q.trim() && (
            <div className="space-y-8">
              {/* Loading */}
              {loading && !hasResults && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Sparkles className="w-4 h-4 animate-pulse text-gold-500" />
                  Searching…
                </div>
              )}

              {/* Projects */}
              {res.projects.length > 0 && (
                <ResultGroup
                  title="Projects"
                  count={res.projects.length}
                  onViewAll={() => goTo(`/search?q=${encodeURIComponent(q)}`)}
                >
                  {res.projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => goTo(`/projects/${p.id}`)}
                      data-testid={`overlay-project-${p.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-gold-400 hover:bg-gold/5 text-left transition w-full"
                    >
                      <img
                        src={p.cover || p.thumbnail || (p.images && p.images[0]) || "/bdesigner-logo.png"}
                        alt={p.title}
                        className="w-14 h-14 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-slate-900 truncate">{p.title}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {[p.style, p.bhk && `${p.bhk} BHK`].filter(Boolean).join(" • ") || "Project"}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </button>
                  ))}
                </ResultGroup>
              )}

              {/* No results */}
              {!loading && !hasResults && q.trim() && (
                <div className="text-center py-16">
                  <div className="text-slate-400 text-sm">
                    No results for <span className="font-medium text-slate-700">&ldquo;{q}&rdquo;</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => goTo(`/search?q=${encodeURIComponent(q)}`)}
                    className="mt-4 text-sm text-gold-600 hover:text-gold-700 font-medium"
                  >
                    Try the full search page →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultGroup({ title, count, onViewAll, children }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          {title} <span className="text-slate-400 normal-case font-normal">({count})</span>
        </h3>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs text-gold-600 hover:text-gold-700 font-medium inline-flex items-center gap-1"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>
    </section>
  );
}
