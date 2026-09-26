import React, { useState, useEffect, useRef } from "react";
import getIcon from "@/components/home/iconMap";
import { useLeadModal } from "@/context/LeadModalContext";
import { ArrowRight } from "lucide-react";

/**
 * GuaranteesYouDeserve (Fix 5) — Brick & Bolt style vertical selector.
 *
 * Layout (SAME on mobile & desktop, matches the reference screenshot):
 *   ┌──────────┬───────────────────────────┐
 *   │  ○ icon  │                           │
 *   │  Label   │      Portrait image       │
 *   │  ○ icon  │      (aspect-[3/4])       │
 *   │  Label   │      Title (white)        │
 *   │   ...    │      Description          │
 *   └──────────┴───────────────────────────┘
 *
 * Interactions:
 *   • Tap any left-side item → right panel fades to new content.
 *   • Auto-rotates every 6 s (pauses on user interaction).
 *   • Portrait image only — never landscape.
 *   • Data still admin-editable via /admin/homepage → guarantee.
 */
export default function GuaranteesYouDeserve({ items = [], settings = {} }) {
  const { openLeadModal } = useLeadModal();
  const cms = settings || {};
  const eyebrow = cms.meta?.eyebrow || "Built on Trust";
  const heading = cms.heading || "Guarantees You Deserve";
  const visible = (items || []).filter((i) => !i.hidden);
  const [activeId, setActiveId] = useState(() => visible[0]?.id || null);
  const [userInteracted, setUserInteracted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!activeId && visible[0]) setActiveId(visible[0].id);
  }, [visible, activeId]);

  // Auto-rotate every 6s until the user taps a tab.
  useEffect(() => {
    if (userInteracted || visible.length < 2) return undefined;
    timerRef.current = setInterval(() => {
      setActiveId((cur) => {
        const idx = visible.findIndex((v) => v.id === cur);
        const next = visible[(idx + 1) % visible.length];
        return next ? next.id : cur;
      });
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [visible, userInteracted]);

  if (!visible.length) return null;

  const active = visible.find((i) => i.id === activeId) || visible[0];
  const ActiveIcon = getIcon(active.icon);
  const buttonLabel = active.meta?.button_label || "Get Your Quote";

  const pickTab = (id) => {
    setUserInteracted(true);
    setActiveId(id);
  };

  return (
    <section
      data-testid="guarantees-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
    >
      {/* Heading — same left-aligned pattern as the rest of the homepage */}
      <div className="mb-6 sm:mb-8">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold bd-eyebrow">{eyebrow}</p>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-1">
          {heading}
        </h2>
      </div>

      {/* 2-column layout — LEFT vertical tab list, RIGHT portrait card.
          `minmax(0, 1fr)` on the right column is critical: without it the
          grid item can grow beyond the viewport and clip the section. */}
      <div className="grid grid-cols-[76px,minmax(0,1fr)] sm:grid-cols-[100px,minmax(0,1fr)] lg:grid-cols-[220px,minmax(0,1fr)] gap-3 sm:gap-4 lg:gap-6 items-stretch">
        {/* LEFT — icon-on-top tab list */}
        <div
          data-testid="guarantees-menu"
          className="flex flex-col gap-2 sm:gap-3 min-w-0"
        >
          {visible.map((it) => {
            const Icon = getIcon(it.icon);
            const isActive = it.id === active.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => pickTab(it.id)}
                data-testid={`guarantee-tab-${it.id}`}
                className={`group text-center flex flex-col items-center gap-1.5 pt-1 pb-2 rounded-2xl transition-all duration-300 w-full min-w-0 ${
                  isActive ? "" : "opacity-70 hover:opacity-100"
                }`}
              >
                <span className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full grid place-items-center shrink-0 transition-all duration-300 ${
                  isActive
                    ? "bg-white/[0.16] text-[#ffffff] ring-2 ring-[#C9A24A]/70 scale-105"
                    : "bg-white/10 text-white/70 ring-1 ring-white/15 group-hover:bg-white/[0.16] group-hover:text-white"
                }`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide leading-tight px-0.5 text-center break-words line-clamp-2 ${
                  isActive ? "text-[#ffffff]" : "text-white/55"
                }`}>
                  {it.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT — portrait image card. `min-w-0` prevents this cell from
            growing wider than the grid track. */}
        <div
          key={active.id}
          data-testid="guarantee-panel"
          className="relative w-full min-w-0 overflow-hidden rounded-[18px] bg-white border border-slate-200 aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] max-h-[560px] animate-in fade-in duration-500"
        >
          {active.image_url ? (
            <>
              <img
                src={active.image_url}
                alt={active.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/45 to-slate-900/10" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-slate-800 to-slate-700" />
          )}

          <div className="relative h-full p-4 sm:p-6 lg:p-8 flex flex-col justify-end min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur text-white grid place-items-center mb-3 ring-1 ring-white/20 shrink-0">
              <ActiveIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-tight break-words">{active.title}</h3>
            <p className="text-xs sm:text-sm lg:text-base text-white/90 mt-1.5 max-w-xl leading-relaxed line-clamp-4 break-words">{active.description}</p>
            <div className="mt-3 sm:mt-4">
              <button
                type="button"
                onClick={() => openLeadModal({ source: "guarantee_cta", title: "Get Your Quote", subtitle: "Lock these guarantees into a written contract." })}
                data-testid="guarantee-cta"
                className="inline-flex items-center justify-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-[11px] sm:text-sm transition"
              >
                {buttonLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
