import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * BDESIGNER — GLOBAL THEME CONTEXT
 * Single source of truth for Light / Dark across the ENTIRE app
 * (public website + Admin / Client / PM / Civil Engineer / Brand panels).
 *
 * - Applies `data-theme="dark|light"` on <html>; all colors come from the
 *   centralized CSS design tokens in index.css.
 * - Default = Dark (system default) until the user picks a theme.
 * - Persisted in localStorage so it survives navigation, logout & re-login.
 */
const STORAGE_KEY = "bd-theme";

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

function readStoredTheme() {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    if (t === "light" || t === "dark") return t;
  } catch (e) {
    /* localStorage unavailable — fall through to default */
  }
  // First visit (no stored choice) — follow the device's colour-scheme.
  try {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch (e) {
    /* matchMedia unavailable — fall through to default */
  }
  return "dark"; // BDesigner system default
}

let animTimer = null;

function applyThemeToDom(next, animate) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-anim");
    if (animTimer) window.clearTimeout(animTimer);
    animTimer = window.setTimeout(() => root.classList.remove("theme-anim"), 360);
  }
  root.setAttribute("data-theme", next);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  // Ensure the DOM reflects the initial theme (no animation on first paint).
  useEffect(() => {
    applyThemeToDom(theme, false);
  }, [theme]);

  const setTheme = useCallback((next) => {
    const val = next === "light" ? "light" : "dark";
    setThemeState(val);
    try {
      localStorage.setItem(STORAGE_KEY, val);
    } catch (e) {
      /* ignore persistence failure */
    }
    applyThemeToDom(val, true);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const val = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, val);
      } catch (e) {
        /* ignore */
      }
      applyThemeToDom(val, true);
      return val;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
