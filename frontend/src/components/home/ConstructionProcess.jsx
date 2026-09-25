import React from "react";
import { ChevronRight } from "lucide-react";
import getIcon from "@/components/home/iconMap";

/**
 * ConstructionProcess — heading shows ONLY:
 *    HOW IT WORKS
 *    Construction Process
 * No descriptive paragraph. Section-level CTAs were removed — the single
 * approved "Plan Your Dream Home" CTA lives in the navbar.
 */
export default function ConstructionProcess({ items = [] }) {
  const visible = (items || []).filter((i) => !i.hidden);
  if (!visible.length) return null;

  return (
    <section
      data-testid="construction-process-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    >
      <div className="mb-4 sm:mb-6">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold bd-eyebrow">How It Works</p>
        <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">Construction Process</h2>
      </div>

      <div
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mx-1 px-1 hide-scrollbar"
        data-testid="construction-process-scroll"
      >
        {visible.map((it, idx) => {
          const Icon = getIcon(it.icon);
          return (
            <React.Fragment key={it.id}>
              <div
                data-testid={`process-card-${it.id}`}
                className="snap-start flex-shrink-0 w-[230px] sm:w-[260px] rounded-2xl bg-white border border-slate-200/80 p-4 hover:border-[#111111]/40 hover:shadow-[0_6px_22px_rgba(15,23,42,0.06)] transition flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl icon-chip grid place-items-center">
                    <Icon className="w-5 h-5 text-[#1f2937]" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">STEP {idx + 1}</span>
                </div>
                <h3 className="font-display font-bold text-slate-900 leading-tight">{it.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{it.description}</p>
              </div>
              {idx < visible.length - 1 ? (
                <div aria-hidden className="hidden md:flex flex-shrink-0 items-center text-slate-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
