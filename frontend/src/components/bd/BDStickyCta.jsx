import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useLeadModal } from "@/context/LeadModalContext";
import { useRequirementForm } from "@/context/RequirementFormContext";

/**
 * BDStickyCta — mobile-only fixed "Plan Your Dream Home" bar.
 * Opens the existing lead modal (no duplicate lead logic). Hidden on
 * desktop and on material-detail pages (those have their own product CTA).
 *
 * Fix 16 — when the footer scrolls into view the bar smoothly slides down out
 * of the way so it never covers footer links/logo/contact/social; it slides
 * back when the user scrolls away from the footer.
 */
export default function BDStickyCta() {
  const { openLeadModal } = useLeadModal();
  const { openRequirement } = useRequirementForm();
  const loc = useLocation();
  const hide = /^\/materials\/[^/]+$/.test(loc.pathname);
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("bd-has-sticky", !hide);
    return () => document.body.classList.remove("bd-has-sticky");
  }, [hide]);

  useEffect(() => {
    if (hide) return undefined;
    setAtFooter(false);
    if (typeof IntersectionObserver === "undefined") return undefined;
    // The footer may not be mounted on the very first paint of a route change,
    // so retry briefly until we find it.
    let io;
    let tries = 0;
    const attach = () => {
      const footer = document.querySelector('[data-testid="main-footer"]');
      if (!footer) {
        if (tries++ < 10) setTimeout(attach, 120);
        return;
      }
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => setAtFooter(e.isIntersecting)),
        { root: null, threshold: 0, rootMargin: "0px 0px 0px 0px" }
      );
      io.observe(footer);
    };
    attach();
    return () => { if (io) io.disconnect(); };
  }, [hide, loc.pathname]);

  if (hide) return null;

  return (
    <div
      className={`bd-sticky-cta sm:hidden${atFooter ? " bd-sticky-cta--hidden" : ""}`}
      data-testid="bd-sticky-cta"
      data-at-footer={atFooter ? "1" : "0"}
    >
      <button
        type="button"
        className="bd-sticky-cta__btn"
        data-testid="bd-sticky-cta-btn"
        onClick={() => openRequirement({ source: "mobile_sticky_cta" })}
      >
        <ClipboardList className="w-[18px] h-[18px]" />
        Plan Your Dream Home
      </button>
    </div>
  );
}
