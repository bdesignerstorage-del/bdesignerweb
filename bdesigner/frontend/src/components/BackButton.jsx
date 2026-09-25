import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Premium glass-style back button. Goes to browser history if there is one,
 * otherwise to the provided fallback path ("/" by default).
 *
 * Usage:
 *   <BackButton />               // sticky-top-left default
 *   <BackButton fallback="/" />  // explicit fallback
 *   <BackButton inline />        // inline, non-sticky
 */
export default function BackButton({ fallback = "/", inline = false, className = "", label }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't render on the home page (nothing to go back to).
  if (location.pathname === "/") return null;

  const onClick = () => {
    // Use history if we have one in the SPA session, otherwise fall back
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

  const base =
    "inline-flex items-center gap-1.5 backdrop-blur-xl bg-white/90 hover:bg-white " +
    "text-slate-700 border border-slate-200 hover:border-gold/50 hover:text-gold-600 transition";
  const shape = label
    ? "px-3 py-2 rounded-full text-sm"
    : "w-10 h-10 rounded-full grid place-items-center";

  if (inline) {
    return (
      <button data-testid="back-btn" onClick={onClick} className={`${base} ${shape} ${className}`}>
        <ArrowLeft className="w-4 h-4" />
        {label && <span className="font-medium">{label}</span>}
      </button>
    );
  }

  return (
    <div className="sticky top-20 z-30 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          data-testid="back-btn"
          onClick={onClick}
          className={`pointer-events-auto ${base} ${shape} shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${className}`}
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
          {label && <span className="font-medium">{label}</span>}
        </button>
      </div>
    </div>
  );
}
