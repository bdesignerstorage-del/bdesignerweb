import React from "react";

/**
 * Hero — premium editorial architectural cover.
 *
 * Background is the FIXED, full-viewport looping video (see BDVideoBackground,
 * mounted on the home route in App.js) — this section stays transparent so the
 * clean video shows through untouched (no wash / gradient / blur / overlay on
 * the footage). Over it we place, vertically & horizontally centered: the
 * BDesigner logo and a small tagline. White text carries its own soft
 * drop-shadow for legibility (shadow on the text, never an overlay on the video).
 */
export default function Hero() {
  return (
    <section
      data-testid="home-hero"
      aria-label="BDesigner — Design Your Dream Home"
      className="relative h-[100svh] min-h-[100svh] w-full overflow-hidden"
    >
      {/* Logo & tagline removed per request — hero video/image stays clean. */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 bottom-8 hidden sm:flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[10px] uppercase tracking-[0.28em] text-white/70">Scroll</span>
        <span className="block w-px h-10 bg-white/45 hero-scroll-line" />
      </div>
    </section>
  );
}
