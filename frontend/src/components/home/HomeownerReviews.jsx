import React, { useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

/**
 * Homeowner Reviews — horizontal slider. NO customer photos (per spec).
 */
export default function HomeownerReviews({ items = [] }) {
  const visible = (items || []).filter((i) => !i.hidden);
  const scrollerRef = useRef(null);

  if (!visible.length) return null;

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section
      data-testid="homeowner-reviews-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
    >
      <div className="flex items-end justify-between gap-3 mb-5 sm:mb-7">
        <div>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold bd-eyebrow">Homeowner Stories</p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-1">
            Loved by <span className="text-[#111111]">Bengaluru Homeowners</span>
          </h2>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scrollBy(-1)} aria-label="Previous" className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-[#111111]/40 grid place-items-center text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => scrollBy(1)} aria-label="Next" className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-[#111111]/40 grid place-items-center text-slate-600"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        data-testid="reviews-scroller"
        className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1 hide-scrollbar"
      >
        {visible.map((r) => {
          const rating = Math.max(1, Math.min(5, Number(r.meta?.rating || 5)));
          return (
            <div
              key={r.id}
              data-testid={`review-card-${r.id}`}
              className="snap-start flex-shrink-0 w-[290px] sm:w-[340px] rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 flex flex-col"
            >
              <Quote className="w-6 h-6 text-[#111111]/30" />
              <div className="mt-3 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-[#C9A24A] text-[#C9A24A]" : "text-slate-200"}`} />
                ))}
              </div>
              <p className="text-sm text-slate-700 mt-3 leading-relaxed line-clamp-6">{r.description}</p>
              <div className="mt-auto pt-4">
                <p className="font-semibold text-slate-900 text-sm">{r.title}</p>
                {r.meta?.city ? <p className="text-xs text-slate-500">{r.meta.city}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
