import React, { useEffect } from "react";
import { X } from "lucide-react";
import LeadForm from "@/components/home/LeadForm";

/**
 * Public Consultation Enquiry Modal.
 *
 * Thin chrome wrapper (backdrop + panel + close button) around the shared
 * <LeadForm/>. Every homepage "Get Free Consultation / Book Free Consultation"
 * CTA opens this modal; the SAME LeadForm is also rendered inline in the
 * homepage consultation card — one source of truth, no duplicate forms.
 */
export default function LeadModal({
  open,
  onClose,
  source = "unknown",
  title,
  subtitle,
  regions = [],
  mainAreas = [],
  prefill = null,
  estimate = null,
  compact = false,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-testid="registration-modal"
      className="fixed inset-0 z-[100000] flex items-end sm:items-start justify-center px-4 sm:px-6 pt-0 sm:pt-20"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-[#0d0d0f]/95 backdrop-blur-xl border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[calc(100vh-4rem)] sm:max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 mt-16 sm:mt-0">
        {/* Close button — docked to the modal so the fixed header can't hide it. */}
        <button
          data-testid="lead-close-btn"
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-[10] w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/10 text-white border border-white/15 hover:bg-white/20 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <LeadForm
          variant="modal"
          autoFocus
          source={source}
          title={title}
          subtitle={subtitle}
          regions={regions}
          mainAreas={mainAreas}
          prefill={prefill}
          estimate={estimate}
          compact={compact}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
