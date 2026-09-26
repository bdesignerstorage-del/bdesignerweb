import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  X, Search as SearchIcon,
  Home, Compass, FolderOpen, Info, HelpCircle, Phone,
  UserCircle2, ClipboardList, Smartphone,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useLeadModal } from "@/context/LeadModalContext";
import { useRequirementForm } from "@/context/RequirementFormContext";
import { ThemeSegmented } from "@/components/ThemeToggle";

/**
 * MobileDrawer — left-side slide-in navigation.
 *
 * Visual design (preserved, do not restyle):
 *   • Slides in from the LEFT with a 300 ms ease.
 *   • Width: 90% of the viewport, max 420 px.
 *   • Backdrop: solid black at 45% opacity, tap or swipe left to close.
 *   • Header: large "Menu" title on the left, X close on the right.
 *   • Sticky search bar directly under the header.
 *   • Flat sections (no accordions) with rounded touch-friendly item cards.
 *
 * Content (frozen public IA, docs/rules.md §8):
 *   NAVIGATION  — Home / Projects / How It Works / About Us / FAQs / Contact Us
 *   GET STARTED — Plan Your Dream Home / Get BDesigner App / Login
 *   APPEARANCE  — Light | Dark
 */
export default function MobileDrawer({ open, onClose, onOpenSearch }) {
  const { user, logout, setAuthOpen, setAuthMode } = useAuth();
  const { openLeadModal } = useLeadModal();
  const { openRequirement } = useRequirementForm();
  const [entered, setEntered] = useState(false);
  const startXRef = useRef(null);
  const installPromptRef = useRef(null);
  const loc = useLocation();
  const navigate = useNavigate();

  // Capture the PWA install prompt (only fires when installable).
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); installPromptRef.current = e; };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Slide-in animation
  useEffect(() => {
    if (!open) { setEntered(false); return; }
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll AND hide floating elements while drawer is open
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("mobile-drawer-open");
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("mobile-drawer-open");
    };
  }, [open]);

  if (!open) return null;

  // Swipe-left to close
  const onTouchStart = (e) => { startXRef.current = e.touches[0].clientX; };
  const onTouchMove  = (e) => {
    if (startXRef.current == null) return;
    const dx = e.touches[0].clientX - startXRef.current;
    if (dx < -60) { startXRef.current = null; onClose?.(); }
  };
  const onTouchEnd = () => { startXRef.current = null; };

  const isLoggedIn = Boolean(user?.id);

  // Plan Your Dream Home → requirement entry point (existing enquiry modal
  // until the dedicated Requirement Form ships).
  const openRequirementCta = () => {
    onClose?.();
    setTimeout(() => openRequirement({ source: "mobile_drawer" }), 220);
  };
  const openLogin = () => {
    onClose?.();
    setTimeout(() => { setAuthMode("login"); setAuthOpen(true); }, 220);
  };

  // Get BDesigner App — real PWA install when supported, otherwise honest
  // Add-to-Home-Screen guidance. Never fake a store download.
  const getApp = () => {
    onClose?.();
    const promptEvent = installPromptRef.current;
    if (promptEvent) {
      setTimeout(async () => {
        promptEvent.prompt();
        try { await promptEvent.userChoice; } catch { /* dismissed */ }
        installPromptRef.current = null;
      }, 220);
    } else {
      setTimeout(() => toast.info(
        "To get the BDesigner App, open your browser menu and choose “Add to Home Screen”. The native app is coming soon."
      ), 240);
    }
  };

  // Projects → approved public project list currently lives on the Homepage
  // "Trending Projects" rail; scroll to it until the Projects page is built.
  const goProjects = () => {
    onClose?.();
    if (loc.pathname !== "/") navigate("/");
    let tries = 0;
    const t = setInterval(() => {
      const el = document.querySelector('[data-testid="recent-projects-section"]');
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        clearInterval(t);
      } else if (++tries > 25) {
        clearInterval(t);
      }
    }, 150);
  };

  // Pages not yet rebuilt — honest, non-breaking placeholder.
  const goSoon = (label) => () => {
    onClose?.();
    setTimeout(() => toast.info(`${label} page is coming soon.`), 240);
  };

  return createPortal(
    <div
      data-testid="mobile-drawer"
      className="lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        data-testid="mobile-drawer-backdrop"
        onClick={onClose}
        className={`fixed inset-0 transition-opacity duration-300 ease-out ${entered ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 100000 }}
      />

      {/* Panel */}
      <aside
        data-testid="mobile-drawer-panel"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`fixed top-0 left-0 bg-[#141009]/90 backdrop-blur-2xl flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${entered ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          height: "100dvh",
          maxHeight: "100vh",
          width: "90%",
          maxWidth: "420px",
          zIndex: 100001,
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <h2 className="font-display text-2xl font-bold text-slate-900">Menu</h2>
          <button
            type="button"
            onClick={onClose}
            data-testid="mobile-drawer-close"
            aria-label="Close menu"
            className="w-10 h-10 grid place-items-center rounded-full text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sticky search */}
        <div className="sticky top-0 z-[1] bg-transparent px-5 pt-3 pb-3 border-b border-white/10">
          <button
            type="button"
            data-testid="mobile-drawer-search"
            onClick={() => { onClose?.(); setTimeout(() => onOpenSearch?.(), 200); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/60 text-sm text-left transition"
          >
            <SearchIcon className="w-4 h-4 text-white/50" />
            <span>Search anything...</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div
          data-testid="mobile-drawer-body"
          className="flex-1 overflow-y-auto px-5 py-4"
          style={{ animation: "drawerFadeIn 340ms ease-out both" }}
        >
          {/* NAVIGATION */}
          <Section title="NAVIGATION">
            <MenuLink to="/" icon={Home} label="Home" onClose={onClose} testid="drawer-home" />
            <MenuAction onClick={goProjects} icon={FolderOpen} label="Projects" testid="drawer-projects" />
            <MenuAction onClick={goSoon("How It Works")} icon={Compass} label="How It Works" testid="drawer-how-it-works" />
            <MenuAction onClick={goSoon("About Us")} icon={Info} label="About Us" testid="drawer-about" />
            <MenuAction onClick={goSoon("FAQs")} icon={HelpCircle} label="FAQs" testid="drawer-faqs" />
            <MenuAction onClick={goSoon("Contact Us")} icon={Phone} label="Contact Us" testid="drawer-contact" />
          </Section>

          {/* GET STARTED */}
          <Section title="GET STARTED">
            <MenuAction onClick={openRequirementCta} icon={ClipboardList} label="Plan Your Dream Home" testid="drawer-plan-dream-home" tone="gold" />
            <MenuAction onClick={getApp} icon={Smartphone} label="Get BDesigner App" testid="drawer-get-app" />
            {isLoggedIn ? (
              <>
                <MenuLink to="/profile" icon={UserCircle2} label={user.name || "My Account"} onClose={onClose} testid="drawer-my-account" />
                <MenuAction onClick={() => { onClose?.(); setTimeout(logout, 200); }} icon={LogOut} label="Logout" testid="drawer-logout" tone="danger" />
              </>
            ) : (
              <MenuAction onClick={openLogin} icon={UserCircle2} label="Login" testid="drawer-login" />
            )}
          </Section>

          {/* APPEARANCE — Light / Dark theme */}
          <Section title="APPEARANCE">
            <ThemeSegmented />
          </Section>

          {/* BOTTOM */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[13px] font-semibold text-slate-800">BDesigner &copy; {new Date().getFullYear()}</p>
            <p className="text-[11px] text-slate-500 mt-1">Version 1.0</p>
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes drawerFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}

/* ---------- helpers ---------- */

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 px-1 mb-2">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function baseItemClasses(tone, disabled) {
  const toneMap = {
    default: "text-slate-800 hover:bg-slate-50 active:bg-slate-100",
    gold: "btn-gold-metallic text-white active:brightness-95",
    danger: "text-rose-600 hover:bg-rose-50 active:bg-rose-100",
  };
  const cls = toneMap[tone] || toneMap.default;
  return `w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl border ${
    tone === "gold" ? "border-transparent" : "border-slate-200/70"
  } text-sm font-semibold transition ${cls} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`;
}

// Neutral icon chip used for every non-active drawer item.
// Only "gold" tone (currently selected/highlighted) and "danger" keep
// their special appearance; everything else uses the premium neutral chip.
const chipClass = (tone) =>
  `w-9 h-9 rounded-xl grid place-items-center shrink-0 ${
    tone === "gold"
      ? "bg-white/20 text-white"
      : tone === "danger"
      ? "bg-rose-50 text-rose-500 border border-rose-100"
      : "icon-chip"
  }`;

function MenuLink({ to, icon: Icon, label, onClose, testid, tone = "default", disabled }) {
  if (disabled || !to) {
    return (
      <div className={baseItemClasses(tone, disabled)} data-testid={testid}>
        <span className={chipClass(tone)}>
          <Icon className="w-5 h-5" />
        </span>
        <span className="flex-1 truncate">{label}</span>
      </div>
    );
  }
  return (
    <Link
      to={to}
      onClick={onClose}
      data-testid={testid}
      className={baseItemClasses(tone, disabled)}
    >
      <span className={chipClass(tone)}>
        <Icon className="w-5 h-5" />
      </span>
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}

function MenuAction({ onClick, icon: Icon, label, testid, tone = "default" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testid}
      className={baseItemClasses(tone, false)}
    >
      <span className={chipClass(tone)}>
        <Icon className="w-5 h-5" />
      </span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
