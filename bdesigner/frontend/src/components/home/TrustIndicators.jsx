import React from "react";

/**
 * TrustIndicators — Premium 4-metric statistics strip.
 *
 * Design (Fix 1 — minimal, typography-focused refresh):
 *   • 2 × 2 grid on mobile, single row of 4 on tablet+.
 *   • NO icon containers, cards, borders or decorative chrome.
 *   • Large bold number, smaller supporting label underneath.
 *   • Premium dark BDesigner visual language (light text on dark glass).
 *   • Generous spacing for readability.
 */
export default function TrustIndicators({ items = [] }) {
  const visible = (items || []).filter((i) => !i.hidden).slice(0, 4);
  if (!visible.length) return null;
  return (
    <section
      data-testid="trust-indicators-section"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 py-4 sm:py-6"
    >
      <div
        className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-6 sm:px-8 sm:py-7 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 sm:gap-x-6"
        data-testid="trust-indicators-grid"
      >
        {visible.map((it) => {
          const hasValue = !!(it.value && String(it.value).trim());
          return (
            <div
              key={it.id}
              data-testid={`trust-card-${it.id}`}
              className="min-w-0 flex flex-col items-center text-center"
            >
              {hasValue ? (
                <>
                  <p className="font-display font-bold tracking-tight leading-none text-white text-[20px] sm:text-[26px] lg:text-[30px]">
                    {it.value}
                  </p>
                  <p className="mt-2 text-[9.5px] sm:text-[11px] uppercase tracking-[0.14em] font-medium leading-snug text-white/55 max-w-[16ch]">
                    {it.label || it.title}
                  </p>
                </>
              ) : (
                <p className="text-[12px] sm:text-sm font-semibold leading-snug text-white/90 max-w-[16ch]">
                  {it.label || it.title}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
