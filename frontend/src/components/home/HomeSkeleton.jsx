import React from "react";

/**
 * Lightweight skeleton primitives used across the home page while the
 * initial API payload loads.  Pure CSS / Tailwind — no external deps.
 *
 * The shimmer animation re-uses the existing `shimmer` utility class
 * available on the project (see App.css). If unavailable, this falls
 * back gracefully to a static slate-200 placeholder.
 */
export function SkelBox({ className = "" }) {
  return <div className={`shimmer rounded-xl bg-slate-200/70 ${className}`} />;
}

/** Hero banner placeholder */
export function HeroSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <SkelBox className="w-full h-[180px] sm:h-[280px] lg:h-[380px] rounded-3xl" />
    </section>
  );
}

/** Trust indicator strip placeholder (horizontal row of small pill cards) */
export function TrustStripSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 sm:mt-4">
      <div className="flex gap-3 sm:gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkelBox key={i} className="flex-shrink-0 w-[200px] h-[64px]" />
        ))}
      </div>
    </section>
  );
}

/** Section title + grid placeholder used by Shop by Category, Projects, etc. */
export function CategoryGridSkeleton({ title = true, count = 6 }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[30px] py-5 sm:py-8">
      {title ? (
        <div className="flex items-end justify-between mb-3 sm:mb-4 gap-4">
          <SkelBox className="h-7 w-40 rounded" />
          <SkelBox className="h-4 w-16 rounded" />
        </div>
      ) : null}
      <div className="grid gap-4 sm:gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        {Array.from({ length: count }).map((_, i) => (
          <SkelBox key={i} className="aspect-square" />
        ))}
      </div>
    </section>
  );
}

/** Horizontal card scroller skeleton — used by Construction Process & similar */
export function HorizontalScrollSkeleton({ title = true, cardClass = "w-[230px] sm:w-[260px] h-[170px]" }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {title ? (
        <div className="mb-4 sm:mb-6">
          <SkelBox className="h-3 w-24 mb-2 rounded" />
          <SkelBox className="h-7 w-52 rounded" />
          <SkelBox className="h-4 w-72 mt-2 rounded" />
        </div>
      ) : null}
      <div className="flex gap-3 sm:gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkelBox key={i} className={`flex-shrink-0 ${cardClass}`} />
        ))}
      </div>
    </section>
  );
}

/** Packages section placeholder */
export function PackagesSkeleton() {
  return (
    <section className="py-10 sm:py-14 bg-gradient-to-br from-slate-50 via-white to-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <SkelBox className="h-3 w-32 mb-2 rounded" />
          <SkelBox className="h-8 w-72 rounded" />
          <SkelBox className="h-4 w-2/3 max-w-md mt-2 rounded" />
        </div>
        <div className="flex gap-4 sm:gap-5 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkelBox key={i} className="flex-shrink-0 w-[88vw] md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] h-[420px] rounded-3xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Reviews placeholder (homeowner reviews carousel) */
export function ReviewsSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <SkelBox className="h-3 w-32 mb-2 rounded" />
      <SkelBox className="h-8 w-60 mb-6 rounded" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkelBox key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

/** Why Choose comparison table placeholder */
export function WhyChooseSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <SkelBox className="h-3 w-44 mb-2 rounded" />
      <SkelBox className="h-8 w-60 mb-6 rounded" />
      <SkelBox className="h-[280px] w-full rounded-3xl" />
    </section>
  );
}

/** Guarantees placeholder */
export function GuaranteesSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <SkelBox className="h-3 w-28 mb-2 rounded" />
      <SkelBox className="h-8 w-72 mb-6 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-4 lg:gap-6">
        <div className="flex lg:flex-col gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkelBox key={i} className="flex-shrink-0 lg:w-full lg:h-14 w-40 h-14 rounded-2xl" />
          ))}
        </div>
        <SkelBox className="h-[320px] sm:h-[400px] rounded-3xl" />
      </div>
    </section>
  );
}

/** Footer skeleton placeholder */
export function FooterSkeleton() {
  return (
    <div className="border-t border-slate-200 bg-slate-50 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <SkelBox className="h-4 w-24 rounded" />
            <SkelBox className="h-3 w-32 rounded" />
            <SkelBox className="h-3 w-28 rounded" />
            <SkelBox className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full homepage skeleton — composed from the smaller helpers above. */
export default function HomeSkeleton() {
  return (
    <div data-testid="home-skeleton">
      <HeroSkeleton />
      <TrustStripSkeleton />
      <CategoryGridSkeleton />
      <HorizontalScrollSkeleton />
      <GuaranteesSkeleton />
      <PackagesSkeleton />
      <WhyChooseSkeleton />
      <CategoryGridSkeleton count={4} />
      <ReviewsSkeleton />
      <FooterSkeleton />
    </div>
  );
}
