import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

/**
 * Compact icon toggle for the DESKTOP top bar (right side).
 * Shows a Sun when in dark mode (tap → light) and a Moon when in light mode.
 */
export function ThemeToggleButton({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-testid="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-10 h-10 grid place-items-center rounded-full text-[color:var(--text-primary)] hover:bg-[color:var(--bd-surface-hover)] transition ${className}`}
    >
      {isDark ? (
        <Sun className="w-[20px] h-[20px]" strokeWidth={1.75} />
      ) : (
        <Moon className="w-[20px] h-[20px]" strokeWidth={1.75} />
      )}
    </button>
  );
}

/**
 * Two-option "Appearance" selector for MOBILE menus / sidebars.
 * Uses the centralized theme tokens so it looks native in every panel.
 */
function ThemeOption({ value, icon: Icon, label, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      data-testid={`theme-opt-${value}`}
      aria-pressed={active}
      className={`flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition ${
        active
          ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-sm"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      <Icon className="w-4 h-4" strokeWidth={1.9} /> {label}
    </button>
  );
}

export function ThemeSegmented({ className = "" }) {
  const { theme, setTheme } = useTheme();
  return (
    <div
      data-testid="theme-appearance"
      className={`flex items-center gap-1 p-1 rounded-2xl border border-[var(--border-primary)] bg-[var(--bd-surface)] ${className}`}
    >
      <ThemeOption value="light" icon={Sun} label="Light" active={theme === "light"} onSelect={setTheme} />
      <ThemeOption value="dark" icon={Moon} label="Dark" active={theme === "dark"} onSelect={setTheme} />
    </div>
  );
}

export default ThemeToggleButton;
