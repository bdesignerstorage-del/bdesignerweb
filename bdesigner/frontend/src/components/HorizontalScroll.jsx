import React, { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Horizontal scrolling section with:
 *   • Mouse-wheel translates to horizontal scroll (desktop / trackpad).
 *   • Native touch swipe on mobile.
 *   • Snap-mandatory + hide-scrollbar.
 *   • Cards aligned to section heading (no edge-bleed).
 *
 * Spacing:
 *   mobile  : 16px outer padding  (px-4)
 *   tablet  : 24px outer padding  (sm:px-6)
 *   desktop : 32px outer padding  (lg:px-8)
 *   card gap: 12px → 16px         (gap-3 sm:gap-4)
 */
export default function HorizontalScroll({
  title,
  subtitle,
  eyebrow,
  children,
  link,
  linkLabel = "View All",
  testid,
}) {
  const trackRef = useRef(null);

  // Convert vertical wheel to horizontal scroll when the rail can scroll.
  const onWheel = useCallback((e) => {
    const el = trackRef.current;
    if (!el) return;
    // Only intercept when the rail is actually horizontally scrollable
    // and the user's intent is vertical (predominantly deltaY).
    const canScrollX = el.scrollWidth > el.clientWidth;
    if (!canScrollX) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // passive:false so we can preventDefault and capture the wheel.
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  return (
    <section
      data-testid={testid}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8"
    >
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] bd-eyebrow mb-1">
                {eyebrow}
              </p>
            )}
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-balance text-slate-900">
              {title}
            </h2>
          </div>
          {link && (
            <Link
              to={link}
              data-testid={`${testid}-view-all`}
              className="text-xs sm:text-sm text-gold-600 hover:text-gold-500 font-medium whitespace-nowrap shrink-0"
            >
              {linkLabel}
            </Link>
          )}
        </div>
        {subtitle && (
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">{subtitle}</p>
        )}
      </div>
      <div
        ref={trackRef}
        className="hide-scrollbar overflow-x-auto scroll-smooth snap-x snap-mandatory overscroll-x-contain"
      >
        <div className="flex gap-4 sm:gap-4 pb-2 pr-4 sm:pr-6">
          {children}
        </div>
      </div>
    </section>
  );
}
