import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram, Youtube, Facebook, Linkedin, Twitter, Globe,
  Mail, Phone, MapPin,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

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
  const siteName = settings?.site_name || "BDesigner";
  const aboutText =
    settings?.footer?.about_text ||
    "India's trusted turnkey construction company — house construction, architectural design, planning, estimation and end-to-end project management, all in one place.";
  const contact = settings?.footer?.contact || {};
  const socials = (settings?.footer?.social || []).filter(
    (s) => s && s.url && (s.visible !== false)
  );

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
            { name: "About", to: "/about" },
            { name: "Contact", to: "/contact" },
          ]}
        />
        <FooterCol
          title="Explore"
          links={[
            { name: "Our Packages", to: "/packages" },
            { name: "Projects", to: "/projects" },
            { name: "Architectural Services", to: "/architecture-services" },
            { name: "How It Works", to: "/how-we-work" },
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            { name: "Help & Support", to: "/contact" },
            { name: "Cost Calculator", to: "/cost-calculator" },
            { name: "Testimonials", to: "/testimonials" },
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
          <li key={l.to}>
            <Link
              to={l.to}
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
