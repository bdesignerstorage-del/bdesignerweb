import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Instagram, Youtube, Facebook, Linkedin, Twitter, Globe,
  Mail, Phone, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/context/SettingsContext";
import { useLeadModal } from "@/context/LeadModalContext";
import { useAuth } from "@/context/AuthContext";

const PLATFORM_META = {
  instagram: { Icon: Instagram, label: "Instagram" },
  youtube: { Icon: Youtube, label: "YouTube" },
  facebook: { Icon: Facebook, label: "Facebook" },
  linkedin: { Icon: Linkedin, label: "LinkedIn" },
  twitter: { Icon: Twitter, label: "Twitter" },
  x: { Icon: Twitter, label: "X" },
};

export default function Footer() {
  const { settings } = useSettings();
  const { openLeadModal } = useLeadModal();
  const { user, setAuthOpen, setAuthMode } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const installPromptRef = useRef(null);

  // Capture the PWA install prompt (only fires when installable).
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); installPromptRef.current = e; };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const siteName = settings?.site_name || "BDesigner";
  const aboutText =
    settings?.footer?.about_text ||
    "India's trusted turnkey construction company — house construction, architectural design, planning, estimation and end-to-end project management, all in one place.";
  const contact = settings?.footer?.contact || {};
  const socials = (settings?.footer?.social || []).filter(
    (s) => s && s.url && (s.visible !== false)
  );

  // Frozen public navigation behavior — mirrors Navbar / MobileDrawer.
  const goSoon = (label) => (e) => {
    e.preventDefault();
    toast.info(`${label} page is coming soon.`);
  };

  const goProjects = (e) => {
    e.preventDefault();
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

  const openRequirement = (e) => {
    e.preventDefault();
    openLeadModal({
      source: "footer-cta",
      title: "Plan Your Dream Home",
      subtitle: "Tell us about your plot and requirements — our team will take it from there.",
    });
  };

  const getApp = (e) => {
    e.preventDefault();
    const promptEvent = installPromptRef.current;
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice?.catch?.(() => {});
      installPromptRef.current = null;
    } else {
      toast.info(
        "To get the BDesigner App, open your browser menu and choose “Add to Home Screen”. The native app is coming soon."
      );
    }
  };

  const openLogin = (e) => {
    e.preventDefault();
    setAuthMode("login");
    setAuthOpen(true);
  };

  const isLoggedIn = Boolean(user?.id);

  return (
    <footer data-testid="main-footer" className="relative z-10 border-t border-white/10 bg-[#0D0B08] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2" data-testid="footer-logo">
            <img
              src="/bdesigner-logo-white.png"
              alt={siteName}
              className="bd-logo-dark h-10 sm:h-11 w-auto object-contain select-none"
              draggable="false"
              data-testid="footer-logo-img"
            />
            <img
              src="/bdesigner-logo-red.png"
              alt={siteName}
              className="bd-logo-light h-10 sm:h-11 w-auto object-contain select-none"
              draggable="false"
              data-testid="footer-logo-img-light"
            />
          </Link>
          <p
            className="text-white/60 text-sm mt-5 max-w-xs leading-relaxed whitespace-pre-line"
            data-testid="footer-about-text"
          >
            {aboutText}
          </p>

          {(contact.email || contact.phone || contact.address) && (
            <ul className="mt-6 space-y-2.5 text-sm text-white/60">
              {contact.email && (
                <li className="flex items-start gap-2" data-testid="footer-contact-email">
                  <Mail className="w-4 h-4 mt-0.5 text-white/40 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-white transition">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-start gap-2" data-testid="footer-contact-phone">
                  <Phone className="w-4 h-4 mt-0.5 text-white/40 shrink-0" />
                  <a href={`tel:${String(contact.phone).replace(/\s+/g, "")}`} className="hover:text-white transition">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-2" data-testid="footer-contact-address">
                  <MapPin className="w-4 h-4 mt-0.5 text-white/40 shrink-0" />
                  <span>{contact.address}</span>
                </li>
              )}
            </ul>
          )}

          {socials.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-7" data-testid="footer-socials">
              {socials.map((s, i) => {
                const key = (s.platform || "").toLowerCase();
                const meta = PLATFORM_META[key] || { Icon: Globe, label: s.platform || "link" };
                const Icon = meta.Icon;
                return (
                  <a
                    key={`${key}-${i}`}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={meta.label}
                    title={meta.label}
                    data-testid={`footer-social-${key || "link"}`}
                    className="w-9 h-9 grid place-items-center rounded-full border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <FooterCol
          title="Company"
          links={[
            { name: "About Us", to: "/about", onClick: goSoon("About Us") },
            { name: "Contact Us", to: "/contact", onClick: goSoon("Contact Us") },
          ]}
        />
        <FooterCol
          title="Explore"
          links={[
            { name: "Projects", to: "/projects", onClick: goProjects },
            { name: "How It Works", to: "/how-it-works", onClick: goSoon("How It Works") },
            { name: "FAQs", to: "/faqs", onClick: goSoon("FAQs") },
          ]}
        />
        <FooterCol
          title="Get Started"
          links={[
            { name: "Plan Your Dream Home", to: "/plan", onClick: openRequirement },
            { name: "Get BDesigner App", to: "/app", onClick: getApp },
            ...(!isLoggedIn ? [{ name: "Login", to: "/login", onClick: openLogin }] : []),
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            { name: "Privacy Policy", to: "/privacy" },
            { name: "Terms", to: "/terms" },
            { name: "Refund", to: "/refund" },
          ]}
        />
      </div>
      <div
        className="border-t border-white/10 py-6 text-center text-white/40 text-xs"
        data-testid="footer-copyright"
      >
        Built for Smart Construction & Modern Home Building • © {new Date().getFullYear()} {siteName}
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="font-display font-semibold mb-4 text-sm tracking-wider uppercase text-white">
        {title}
      </h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.name}>
            <Link
              to={l.to}
              onClick={l.onClick}
              data-testid={`footer-link-${l.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-white/60 hover:text-white transition"
            >
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
