import React, { createContext, useContext, useRef, useState, useCallback, useMemo } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";

/**
 * HeroModeContext — controls the Homepage hero video "modes"
 * (Construction / Morning / Night).
 *
 * The timeline is admin-configurable and comes from GET /api/settings → hero.
 * A future Website CMS "Homepage → Hero" tab can edit these values with no
 * frontend change. Selecting a mode:
 *   1. seeks the hero video to that mode's timestamp and continues playing,
 *   2. switches the site theme (Construction/Morning → light, Night → dark).
 */

// Fallback matches backend DEFAULT_SETTINGS.hero so the hero works even if
// /api/settings is briefly unavailable.
const FALLBACK_HERO = {
  video_landscape: "/hero-landscape.mp4",
  video_portrait: "/hero-portrait.mp4",
  logo: "/bdesigner-logo-white.png",
  total_duration: 23,
  default_state: "construction",
  states: [
    { key: "construction", label: "Construction", icon: "HardHat", timestamp: 0, theme: "light" },
    { key: "morning", label: "Morning", icon: "Sunrise", timestamp: 19, theme: "light" },
    { key: "night", label: "Night", icon: "Moon", timestamp: 22, theme: "dark" },
  ],
};

const HeroModeContext = createContext({
  hero: FALLBACK_HERO,
  mode: "construction",
  selectMode: () => {},
  registerVideo: () => {},
});

export function HeroModeProvider({ children }) {
  const { settings } = useSettings();
  const { setTheme } = useTheme();

  const hero = useMemo(() => {
    const h = settings?.hero;
    if (!h || !Array.isArray(h.states) || h.states.length === 0) return FALLBACK_HERO;
    return h;
  }, [settings]);

  const [mode, setMode] = useState(hero.default_state || "construction");
  const videoElRef = useRef(null);

  const registerVideo = useCallback((el) => {
    videoElRef.current = el;
  }, []);

  const seekVideo = useCallback((timestamp, totalDuration) => {
    const el = videoElRef.current;
    if (!el) return;
    const doSeek = () => {
      try {
        const dur = el.duration && isFinite(el.duration) ? el.duration : totalDuration;
        const safe = Math.max(0, Math.min(Number(timestamp) || 0, (dur || totalDuration) - 0.25));
        el.currentTime = safe;
        const p = el.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch {
        /* seek guard */
      }
    };
    if (el.readyState >= 1) doSeek();
    else el.addEventListener("loadedmetadata", doSeek, { once: true });
  }, []);

  const selectMode = useCallback((key) => {
    const cfg = (hero.states || []).find((s) => s.key === key) || hero.states[0];
    if (!cfg) return;
    setMode(cfg.key);
    setTheme(cfg.theme === "dark" ? "dark" : "light");
    seekVideo(cfg.timestamp, hero.total_duration || 23);
  }, [hero, setTheme, seekVideo]);

  const value = useMemo(
    () => ({ hero, mode, selectMode, registerVideo }),
    [hero, mode, selectMode, registerVideo]
  );

  return <HeroModeContext.Provider value={value}>{children}</HeroModeContext.Provider>;
}

export function useHeroMode() {
  return useContext(HeroModeContext);
}

export default HeroModeContext;
