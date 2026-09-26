import React from "react";
import { useHeroMode } from "@/context/HeroModeContext";
import getIcon from "@/components/home/iconMap";

/**
 * Hero — premium editorial architectural cover.
 *
 * Background is the FIXED, full-viewport looping video (BDVideoBackground,
 * mounted on the home route in App.js) — this section stays transparent so the
 * clean video shows through untouched.
 *
 * Over it, a vertical stack of Construction / Morning / Night mode buttons
 * (right-centered, matching the approved reference). Selecting a mode seeks
 * the hero video to its timeline point and switches the site theme.
 */
export default function Hero() {
  const { hero, mode, selectMode } = useHeroMode();
  const states = hero?.states || [];

  return (
    <section
      data-testid="home-hero"
      aria-label="BDesigner — Design Your Dream Home"
      className="relative h-[100svh] min-h-[100svh] w-full overflow-hidden"
    >
      {/* Hero mode switcher — Construction / Morning / Night */}
      <div
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3"
        data-testid="hero-mode-switcher"
        role="group"
        aria-label="Hero view mode"
      >
        {states.map((s) => {
          const Icon = getIcon(s.icon);
          const active = mode === s.key;
          return (
            <button
              key={s.key}
              type="button"
              data-testid={`hero-mode-${s.key}`}
              aria-pressed={active}
              aria-label={s.label}
              title={s.label}
              onClick={() => selectMode(s.key)}
              className={`hero-mode-btn group relative grid place-items-center w-11 h-11 sm:w-12 sm:h-12 rounded-full backdrop-blur-md border transition-all duration-300 ${
                active
                  ? "bg-white text-[#111111] border-white shadow-[0_6px_20px_rgba(0,0,0,0.28)] scale-105"
                  : "bg-black/35 text-white border-white/40 hover:bg-black/50 hover:border-white/70"
              }`}
            >
              <Icon className="w-[20px] h-[20px]" strokeWidth={1.9} />
              <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                {s.label}
              </span>
            </button>
          );
        })}
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
