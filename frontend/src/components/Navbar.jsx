import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User, LogOut,
  Menu,
  Search as SearchIcon,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
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

// Frozen public navigation (docs/rules.md §8). Pages not yet rebuilt use an
// honest "coming soon" toast instead of silently redirecting home.
const NAV = [
  { name: "Home", to: "/" },
  { name: "Projects", to: "/projects", projects: true },
  { name: "How It Works", to: "/how-it-works", soon: true },
  { name: "About Us", to: "/about", soon: true },
  { name: "FAQs", to: "/faqs", soon: true },
  { name: "Contact Us", to: "/contact", soon: true },
];

export default function Navbar() {
  const { user, logout, setAuthOpen, setAuthMode } = useAuth();
  const { settings } = useSettings();
  const { openLeadModal } = useLeadModal();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const isHome = loc.pathname === "/";
  const overHero = isHome && !scrolled;
  const iconBtn = "w-10 h-10 grid place-items-center rounded-full text-white hover:bg-white/15 transition";

  // Smooth shadow appears after scrolling 10px (Apple/Airbnb/Linear pattern)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Plan Your Dream Home → BDesigner requirement entry point. Until the
  // dedicated Requirement Form ships, route through the existing enquiry
  // modal (no new consultation workflow).
  const openRequirement = () =>
    openLeadModal({
      source: "navbar-cta",
      title: "Plan Your Dream Home",
      subtitle: "Tell us about your plot and requirements — our team will take it from there.",
    });

  // Projects → the approved public project list currently lives on the
  // Homepage "Trending Projects" rail; scroll to it (navigating home first
  // when needed) until the standalone Projects page is built.
  const goProjects = (e) => {
    e?.preventDefault?.();
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

  const goSoon = (label) => (e) => {
    e.preventDefault();
    toast.info(`${label} page is coming soon.`);
  };

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
        {/* LEFT — hamburger (mobile/tablet) + logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            data-testid="mobile-menu-toggle"
            className={`lg:hidden ${iconBtn} shrink-0`}
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

        {/* Center nav — desktop only (full 6-item frozen public navigation).
            Below lg there is not enough horizontal room, so navigation falls
            back to the drawer instead of shrinking. */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.name.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              onClick={n.projects ? goProjects : n.soon ? goSoon(n.name) : undefined}
              className={`nav-link relative whitespace-nowrap ${loc.pathname === n.to ? "active" : ""}`}
            >
              {n.name}
            </Link>
          ))}
        </nav>

        {/* Right (desktop) */}
        <div className="hidden lg:flex items-center gap-1.5">
          {/* Primary CTA — "Plan Your Dream Home" (requirement entry point) */}
          <button
            type="button"
            data-testid="nav-plan-dream-home-btn"
            onClick={openRequirement}
            className={`${overHero ? "btn-outline-white" : "btn-gold-metallic"} inline-flex items-center gap-2 h-10 px-4 rounded-full font-semibold text-sm mr-1 border border-white/40`}
          >
            <ClipboardList className="w-[20px] h-[20px]" strokeWidth={1.75} />
            <span>Plan Your Dream Home</span>
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

        {/* Mobile/tablet right-side icons — Search + Profile only
            (hamburger is on the LEFT). The primary CTA lives in the drawer. */}
        <div className="lg:hidden flex items-center gap-1">
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
