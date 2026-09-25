import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User, LogOut,
  Menu,
  Search as SearchIcon,
  CalendarCheck2,
  ChevronDown,
  Package,
  Compass,
  Smartphone,
  Info,
  PhoneCall,
  Star,
  Newspaper,
  Ruler,
  ClipboardCheck,
  Home,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useLeadModal } from "@/context/LeadModalContext";
import SearchOverlay from "@/components/SearchOverlay";
import MobileDrawer from "@/components/MobileDrawer";
import { ThemeToggleButton } from "@/components/ThemeToggle";
import { profileMenuForRole, displayRoleLabel } from "@/lib/roleMenu";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { name: "Home", to: "/" },
  { name: "Projects", to: "/projects" },
  { name: "Packages", to: "/packages" },
];

export default function Navbar() {
  const { user, logout, setAuthOpen, setAuthMode } = useAuth();
  const { settings } = useSettings();
  const { openLeadModal } = useLeadModal();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  const isHome = loc.pathname === "/";
  const overHero = isHome && !scrolled;
  const iconBtn = "w-10 h-10 grid place-items-center rounded-full text-white hover:bg-white/15 transition";

  // Fix 5 — smooth shadow appears after scrolling 10px (Apple/Airbnb/Linear pattern)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openConsultation = () =>
    openLeadModal({
      source: "navbar-cta",
      title: "Book Free Consultation",
      subtitle: "Share your details — our advisor will call you back in 30 minutes.",
    });

  return (
    <>
      <header
        data-testid="main-navbar"
        className={`fixed top-0 left-0 right-0 w-full z-[99999] transition-all duration-300 will-change-[background-color,box-shadow] ${
          overHero
            ? "nav-hero bg-[#141009]/30 backdrop-blur-xl border-b border-white/15"
            : `nav-hero bg-[#141009]/85 backdrop-blur-xl border-b border-white/10 ${scrolled ? "shadow-[0_6px_24px_rgba(0,0,0,0.35)]" : "shadow-none"}`
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* LEFT — hamburger (mobile) + logo (always visible, sits right after the menu icon) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            data-testid="mobile-menu-toggle"
            className={`md:hidden ${iconBtn} shrink-0`}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            to="/"
            data-testid="logo-link"
            className="flex items-center gap-2 group min-w-0 shrink"
          >
            <img
              src="/bdesigner-logo-white.png"
              alt={settings?.site_name || "BDesigner"}
              className="h-8 sm:h-10 w-auto max-w-[130px] sm:max-w-none object-contain select-none"
              draggable="false"
              data-testid="navbar-logo-img"
            />
          </Link>
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-sm font-medium">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.name.toLowerCase()}`}
              className={`nav-link relative ${loc.pathname === n.to ? "active" : ""}`}
            >
              <span className="inline-flex items-center gap-1.5">
                {n.name}
                {n.badge ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-br from-[#F5F5F5] to-[#111111] text-[#111111] shadow-[0_2px_6px_rgba(172,136,51,0.24)]">
                    {n.badge}
                  </span>
                ) : null}
              </span>
            </Link>
          ))}
          <MoreMegaMenu />
        </nav>

        {/* Right (desktop) */}
        <div className="hidden md:flex items-center gap-1.5">
          {/* Fix 5 — primary "Book Free Consultation" CTA (premium metallic gold) */}
          <button
            type="button"
            data-testid="nav-book-consultation-btn"
            onClick={openConsultation}
            className={`${overHero ? "btn-outline-white" : "btn-gold-metallic"} inline-flex items-center gap-2 h-10 px-4 rounded-full font-semibold text-sm mr-1 border border-white/40`}
          >
            <CalendarCheck2 className="w-[20px] h-[20px]" strokeWidth={1.75} />
            <span>Book Free Consultation</span>
          </button>
          <button
            type="button"
            data-testid="nav-search-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className={iconBtn}
          >
            <SearchIcon className="w-[22px] h-[22px]" />
          </button>

          {/* Light / Dark theme toggle (desktop, top-right) */}
          <ThemeToggleButton />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid="nav-profile-btn"
                className={iconBtn}
              >
                {user && user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-[22px] h-[22px]" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="z-[100000] bg-white border-slate-200 text-slate-800 min-w-[220px] shadow-lg"
            >
              {user && user.id ? (
                <>
                  <DropdownMenuLabel className="font-display">
                    <div className="text-sm text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500 font-normal">{user.email}</div>
                    <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-gold/15 text-gold text-[9px] font-bold uppercase tracking-wider">
                      {displayRoleLabel(user.role)}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200" />
                  {profileMenuForRole(user.role).map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.to} asChild>
                        <Link
                          to={item.to}
                          data-testid={item.testid}
                          className={`cursor-pointer ${item.highlight ? "text-gold-600" : ""}`}
                        >
                          <Icon className="w-4 h-4 mr-2" /> {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem
                    data-testid="menu-logout"
                    onClick={logout}
                    className="cursor-pointer text-red-600 focus:text-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    data-testid="menu-login"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-testid="menu-register"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthOpen(true);
                    }}
                    className="cursor-pointer text-gold-600"
                  >
                    Create Account
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile right-side icons — Search + Profile only (hamburger is on the LEFT).
            "Book Free Consultation" is intentionally hidden on mobile (< 768px)
            per Aug-2025 header refinement — desktop/tablet still show it. */}
        <div className="md:hidden flex items-center gap-1">
          <button
            type="button"
            data-testid="mobile-search-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className={iconBtn}
          >
            <SearchIcon className="w-5 h-5" />
          </button>
          {user && user.id ? (
            <Link
              to="/profile"
              data-testid="mobile-profile-btn"
              className={`${iconBtn} overflow-hidden`}
              aria-label="Profile"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </Link>
          ) : (
            <button
              type="button"
              data-testid="mobile-login-btn"
              onClick={() => {
                setAuthMode("login");
                setAuthOpen(true);
              }}
              className={iconBtn}
              aria-label="Sign in"
            >
              <User className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>

      {/* Spacer — reserves the fixed-header height on inner pages so content
          starts below the navbar. On the homepage the fixed full-viewport
          hero sits behind the transparent navbar, so no spacer is rendered. */}
      {!isHome ? (
        <div aria-hidden data-testid="nav-spacer" className="h-16" />
      ) : null}
    </>
  );
}


/* ─────────────────────────────────────────────────────────────────
   MoreMegaMenu — desktop mega-menu, 2-column premium layout.
   Left column  "GET STARTED"                    (product / brand)
   Right column "SERVICES / TOOLS / COMPANY"     (mirrors mobile drawer)
   Opens on hover with a 180ms fade+slide down. Cards use the
   neutral icon-chip + gold hover accent, matching the BDesigner
   design system. Highlights "Our Packages" with a gold Popular pill.
   ───────────────────────────────────────────────────────────────── */
const GET_STARTED = [
  { title: "Our Packages",     desc: "Explore construction packages tailored for every budget.", icon: Package,   to: "/packages", badge: "Popular" },
  { title: "How It Works",     desc: "Learn the complete construction process.",                 icon: Compass,   to: "/how-we-work" },
  { title: "Our App",          desc: "Track projects, payments and updates.",                    icon: Smartphone,to: "/how-we-work" },
  { title: "About Us",         desc: "Company story and vision.",                                icon: Info,      to: "/about"    },
  { title: "Contact Us",       desc: "Talk to our experts.",                                     icon: PhoneCall, to: "/contact"  },
];

// Right column now mirrors the Mobile drawer structure: SERVICES, TOOLS,
// COMPANY. Free Estimator / Construction Guide / Refer & Earn / Design
// Inspiration / FAQs / Warranty have been removed per spec.
const SERVICES_ITEMS = [
  { title: "House Construction",   desc: "Turnkey home construction packages.",         icon: Home,        to: "/packages" },
  { title: "Architectural Services", desc: "Design, planning and 3D visualisation.",    icon: Compass,     to: "/architecture-services" },
  { title: "Project Gallery",      desc: "Explore beautifully built homes.",            icon: FolderOpen,  to: "/projects" },
];

const TOOLS_ITEMS = [
  { title: "Construction Checklist", desc: "Nothing gets missed on your build.",        icon: ClipboardCheck, to: "/how-we-work" },
  { title: "Material Calculator",    desc: "Estimate exact material quantities.",       icon: Ruler,          to: "/cost-calculator" },
];

const COMPANY_ITEMS = [
  { title: "Testimonials", desc: "Hear from satisfied homeowners.", icon: Star,      to: "/testimonials" },
  { title: "News & Media", desc: "Industry updates and press.",     icon: Newspaper, to: "/news" },
];

function MegaBadge({ label }) {
  const goldish = /popular|recommended|new|hot|beta|free/i.test(String(label));
  const cls = goldish
    ? "bg-gradient-to-br from-[#F5F5F5] to-[#111111] text-[#111111] shadow-[0_2px_6px_rgba(172,136,51,0.24)]"
    : "bg-slate-100 text-slate-500";
  return (
    <span className={`ml-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

function MegaCard({ item }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      role="menuitem"
      data-testid={`mega-card-${item.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
      className="group flex items-start gap-3 p-3 rounded-2xl border border-transparent hover:border-[#E5E7EB] hover:bg-[#F5F5F5] focus:outline-none focus-visible:border-[#E5E7EB] focus-visible:bg-[#F5F5F5] focus-visible:ring-2 focus-visible:ring-gold/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,23,42,0.05)]"
    >
      <span className="icon-chip w-11 h-11 rounded-xl grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
        <Icon className="w-[22px] h-[22px]" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#111827] flex items-center">
          <span className="truncate">{item.title}</span>
          {item.badge ? <MegaBadge label={item.badge} /> : null}
        </div>
        <div className="text-[12px] text-[#6B7280] leading-snug mt-0.5">
          {item.desc}
        </div>
      </div>
    </Link>
  );
}

function MoreMegaMenu() {
  const [open, setOpen] = useState(false);
  // Small open-delay to avoid flicker on quick pointer movement
  const [closeTimer, setCloseTimer] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const enter = () => {
    if (closeTimer) { clearTimeout(closeTimer); setCloseTimer(null); }
    setOpen(true);
  };
  const leave = () => {
    const t = setTimeout(() => setOpen(false), 120);
    setCloseTimer(t);
  };

  // Focus the first card inside the panel (used when opened via keyboard).
  const focusFirstCard = () => {
    // Defer until the panel is in the DOM.
    requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector('[data-testid^="mega-card-"]');
      if (first) first.focus();
    });
  };

  // Trigger keyboard: ArrowDown / Enter / Space opens + moves focus into panel.
  const onTriggerKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      focusFirstCard();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Panel keyboard:
  //   Escape          → close + return focus to trigger
  //   ArrowDown / Up  → move focus between cards
  //   Home / End      → jump to first / last card
  //   Tab (last card) → close menu naturally (browser handles tab-out)
  const onPanelKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
      const cards = Array.from(
        panelRef.current?.querySelectorAll('[data-testid^="mega-card-"]') || []
      );
      if (!cards.length) return;
      const currentIdx = cards.indexOf(document.activeElement);
      let nextIdx = currentIdx;
      if (e.key === "ArrowDown") nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % cards.length;
      else if (e.key === "ArrowUp") nextIdx = currentIdx < 0 ? cards.length - 1 : (currentIdx - 1 + cards.length) % cards.length;
      else if (e.key === "Home") nextIdx = 0;
      else if (e.key === "End") nextIdx = cards.length - 1;
      e.preventDefault();
      cards[nextIdx]?.focus();
    }
  };

  // Close when focus leaves the entire container (keyboard tab-out).
  const onContainerBlur = (e) => {
    // relatedTarget is the element receiving focus. If it's still inside
    // this component we ignore; otherwise, close.
    const container = e.currentTarget;
    if (container && !container.contains(e.relatedTarget)) {
      setOpen(false);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onBlur={onContainerBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        data-testid="nav-more-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="nav-more-mega-panel"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={`nav-link inline-flex items-center gap-1 ${open ? "active" : ""}`}
      >
        More
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <>
          {/* Invisible hover bridge so the menu doesn't close between
              the trigger and the panel */}
          <div className="absolute left-0 right-0 -bottom-3 h-3" />
          <div
            id="nav-more-mega-panel"
            ref={panelRef}
            data-testid="nav-more-mega"
            role="menu"
            aria-label="More navigation"
            onKeyDown={onPanelKeyDown}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[min(1100px,calc(100vw-32px))] bg-[#141009] backdrop-blur-2xl rounded-[20px] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 lg:p-8 z-[999]"
            style={{ animation: "megaFadeSlide 180ms ease-out" }}
          >
            <div className="grid lg:grid-cols-[minmax(0,340px)_1fr] gap-6 lg:gap-8">
              {/* Left column — GET STARTED */}
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#6B7280] mb-3">
                  Get Started
                </div>
                <div className="grid gap-1.5">
                  {GET_STARTED.map((it) => (
                    <MegaCard key={it.title} item={it} />
                  ))}
                </div>
              </div>

              {/* Right column — SERVICES / TOOLS / COMPANY (mirrors mobile) */}
              <div className="space-y-5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#6B7280] mb-3">
                    Services
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {SERVICES_ITEMS.map((it) => (
                      <MegaCard key={it.title} item={it} />
                    ))}
                  </div>
                </div>

                <div
                  data-testid="mega-tools-section"
                  className="relative rounded-2xl border border-gold/25 bg-gradient-to-br from-[#F5F5F5] via-[#F5F5F5] to-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(172,136,51,0.06)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] font-bold text-gold flex items-center gap-1.5">
                      <span className="w-4 h-px bg-gradient-to-r from-transparent to-gold/60" />
                      Tools
                      <span className="w-4 h-px bg-gradient-to-l from-transparent to-gold/60" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gold/80 bg-gold/10 px-1.5 py-0.5 rounded-full">
                      Free
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {TOOLS_ITEMS.map((it) => (
                      <MegaCard key={it.title} item={it} />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#6B7280] mb-3">
                    Company
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {COMPANY_ITEMS.map((it) => (
                      <MegaCard key={it.title} item={it} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom trust strip */}
            <div className="mt-6 pt-5 border-t border-[#F3F4F6] flex items-center justify-between gap-4 flex-wrap">
              <div className="text-[12px] text-[#6B7280]">
                Building dream homes across India — trusted by thousands of homeowners.
              </div>
              <Link
                to="/packages"
                className="btn-gold-metallic inline-flex items-center gap-2 h-9 px-4 rounded-full text-white font-bold text-xs"
              >
                <Package className="w-4 h-4" />
                Explore Packages
              </Link>
            </div>
          </div>
        </>
      ) : null}

      {/* Local keyframes */}
      <style>{`
        @keyframes megaFadeSlide {
          from { opacity: 0; transform: translate(-50%, -6px); }
          to   { opacity: 1; transform: translate(-50%, 0);    }
        }
      `}</style>
    </div>
  );
}
