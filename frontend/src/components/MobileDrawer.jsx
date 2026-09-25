import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  X, Search as SearchIcon,
  Home, Compass, BarChart3, FolderOpen,
  Package, Settings2, PhoneCall,
  UserCircle2, Star, Newspaper, Phone,
  Instagram, Facebook, Youtube, Linkedin,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLeadModal } from "@/context/LeadModalContext";
import { useSettings } from "@/context/SettingsContext";
import { ThemeSegmented } from "@/components/ThemeToggle";

/**
 * MobileDrawer — left-side slide-in navigation.
 *
 * Design (Aug-2025 spec, "Frido-style"):
 *   • Slides in from the LEFT with a 300 ms ease.
 *   • Width: 85% of the viewport, max 380 px.
 *   • Backdrop: solid black at 40% opacity, tap or swipe left to close.
 *   • Header: large "Menu" title on the left, X close on the right.
 *   • Sticky search bar directly under the header.
 *   • Flat sections (no accordions) with rounded touch-friendly item cards.
 *   • Gold accents (#B79232), BDesigner typography.
 */
export default function MobileDrawer({ open, onClose, onOpenSearch }) {
  const { user, logout, setAuthOpen, setAuthMode } = useAuth();
  const { openLeadModal } = useLeadModal();
  const { settings } = useSettings();
  const [entered, setEntered] = useState(false);
  const startXRef = useRef(null);

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

  const isCustomer = user?.id && user.role === "customer";

  const openConsultation = () => {
    onClose?.();
    setTimeout(() => openLeadModal({ source: "mobile_drawer" }), 220);
  };
  const openLogin = () => {
    onClose?.();
    setTimeout(() => { setAuthMode("login"); setAuthOpen(true); }, 220);
  };
  const openRegister = () => {
    onClose?.();
    setTimeout(() => { setAuthMode("register"); setAuthOpen(true); }, 220);
  };

  const socials = settings?.socials || {};

  return createPortal(
    <div
      data-testid="mobile-drawer"
      className="md:hidden"
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
          {/* SERVICES */}
          <Section title="SERVICES">
            <MenuLink to="/packages" icon={Home} label="House Construction" onClose={onClose} testid="drawer-house-construction" />
            <MenuLink to="/architecture-services" icon={Compass} label="Architectural Services" onClose={onClose} testid="drawer-architectural" />
            <MenuLink to="/cost-calculator" icon={BarChart3} label="Free Estimate" onClose={onClose} testid="drawer-estimator" />
            <MenuLink to="/projects" icon={FolderOpen} label="Project Gallery" onClose={onClose} testid="drawer-gallery" />
          </Section>

          {/* GET STARTED */}
          <Section title="GET STARTED">
            <MenuLink to="/packages" icon={Package} label="Our Packages" badge="Popular" onClose={onClose} testid="drawer-packages" />
            <MenuLink to="/how-we-work" icon={Settings2} label="How It Works" onClose={onClose} testid="drawer-how-it-works" />
            <MenuAction onClick={openConsultation} icon={PhoneCall} label="Book Free Consultation" testid="drawer-consultation" tone="gold" />
          </Section>

          {/* APPEARANCE — Light / Dark theme (mobile) */}
          <Section title="APPEARANCE">
            <ThemeSegmented />
          </Section>

          {/* COMPANY */}
          <Section title="COMPANY">
            <MenuLink to="/about" icon={UserCircle2} label="About Us" onClose={onClose} testid="drawer-about" />
            <MenuLink to="/testimonials" icon={Star} label="Testimonials" onClose={onClose} testid="drawer-testimonials" />
            <MenuLink to="/news" icon={Newspaper} label="News & Media" onClose={onClose} testid="drawer-news" />
            <MenuLink to="/contact" icon={Phone} label="Contact Us" onClose={onClose} testid="drawer-contact" />
          </Section>

          {/* ACCOUNT */}
          <Section title="ACCOUNT">
            {isCustomer ? (
              <>
                <MenuLink to="/homeowner" icon={UserCircle2} label={user.name || "My Account"} onClose={onClose} testid="drawer-my-account" />
                <MenuAction onClick={() => { onClose?.(); setTimeout(logout, 200); }} icon={LogOut} label="Logout" testid="drawer-logout" tone="danger" />
              </>
            ) : (
              <>
                <MenuAction onClick={openLogin} icon={UserCircle2} label="Login" testid="drawer-login" />
                <MenuAction onClick={openRegister} icon={UserCircle2} label="Create Account" testid="drawer-register" tone="gold" />
              </>
            )}
          </Section>

          {/* FOLLOW US */}
          <Section title="FOLLOW US">
            <div className="grid grid-cols-2 gap-2" data-testid="drawer-socials">
              <SocialLink href={socials.instagram} icon={Instagram} label="Instagram" testid="drawer-instagram" />
              <SocialLink href={socials.facebook}  icon={Facebook}  label="Facebook"  testid="drawer-facebook" />
              <SocialLink href={socials.youtube}   icon={Youtube}   label="YouTube"   testid="drawer-youtube" />
              <SocialLink href={socials.linkedin}  icon={Linkedin}  label="LinkedIn"  testid="drawer-linkedin" />
            </div>
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

// Small pill next to menu items. Gold pill for "Popular" / "Recommended" /
// "New" / "Hot" — otherwise a neutral grey pill. Keeps the drawer premium
// while highlighting the destinations we want to push.
const badgeClass = (label = "") => {
  const goldish = /popular|recommended|new|hot|beta/i.test(String(label));
  return goldish
    ? "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-br from-[#F8E9B8] to-[#C9982F] text-[#4A3410] whitespace-nowrap shadow-[0_2px_6px_rgba(172,136,51,0.24)]"
    : "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 whitespace-nowrap";
};

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

function MenuLink({ to, icon: Icon, label, badge, onClose, testid, tone = "default", disabled }) {
  if (disabled || !to) {
    return (
      <div className={baseItemClasses(tone, disabled)} data-testid={testid}>
        <span className={chipClass(tone)}>
          <Icon className="w-5 h-5" />
        </span>
        <span className="flex-1 truncate">{label}</span>
        {badge && (
          <span className={badgeClass(badge)}>
            {badge}
          </span>
        )}
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
      {badge && (
        <span className={badgeClass(badge)}>
          {badge}
        </span>
      )}
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

function SocialLink({ href, icon: Icon, label, testid }) {
  const disabled = !href;
  const cls = `flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-slate-200/70 text-sm font-medium text-slate-800 transition ${
    disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 active:bg-slate-100"
  }`;
  const content = (
    <>
      <span className="w-8 h-8 rounded-xl icon-chip grid place-items-center">
        <Icon className="w-5 h-5" />
      </span>
      <span className="truncate">{label}</span>
    </>
  );
  return disabled ? (
    <span className={cls} data-testid={testid}>{content}</span>
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className={cls} data-testid={testid}>
      {content}
    </a>
  );
}
