import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ShieldCheck, CalendarCheck } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

/**
 * LeadForm — the ONE shared consultation form (fields + validation +
 * submission logic + success state). Rendered in two places:
 *   • inside LeadModal (variant="modal") — the popup opened by CTAs
 *   • inline inside the homepage consultation card (variant="inline")
 * so there is a single source of truth and NO duplicate forms.
 *
 * Submits to POST /erp/enquiries (creates an enquiry + a Lead in the Admin
 * dashboard). Field order + labels + wording are unchanged.
 */
export default function LeadForm({
  source = "unknown",
  title,
  subtitle,
  regions = [],
  mainAreas = [],
  prefill = null,
  estimate = null,
  compact = false,
  autoFocus = false,
  variant = "modal",
  onClose,
}) {
  const regionsSafe = useMemo(() => {
    if (regions?.length) return regions;
    return [{ id: "bengaluru", title: "Bengaluru", label: "Bengaluru" }];
  }, [regions]);

  const [form, setForm] = useState(() => ({
    full_name: "", mobile: "", email: "",
    service_area: regionsSafe[0]?.id || "",
    main_area: "",
    plot_size: prefill?.plot_size || "",
    budget: prefill?.budget || "",
    start_date: "",
    project_type: prefill?.project_type || "",
    city: prefill?.city || "",
    message: "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const nameRef = useRef(null);

  const mainAreasForRegion = useMemo(() => {
    if (!form.service_area) return [];
    const tagged = mainAreas.filter((a) => a.meta?.region_id);
    if (!tagged.length) return mainAreas;
    return tagged.filter((a) => a.meta?.region_id === form.service_area);
  }, [mainAreas, form.service_area]);

  // Default the service area once regions arrive (the inline form loads the
  // CMS regions asynchronously, after this component has already mounted).
  useEffect(() => {
    if (!form.service_area && regionsSafe[0]?.id) {
      setForm((s) => ({ ...s, service_area: regionsSafe[0].id }));
    }
  }, [regionsSafe, form.service_area]);

  useEffect(() => {
    if (autoFocus) setTimeout(() => nameRef.current?.focus(), 40);
  }, [autoFocus]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // Tolerant of both the raw engine result and the saved snapshot shape.
  const estCostMin = estimate ? (estimate?.cost_range?.min ?? estimate.cost_min ?? 0) : 0;
  const estCostMax = estimate ? (estimate?.cost_range?.max ?? estimate.cost_max ?? 0) : 0;
  const estPkgName = estimate ? (estimate.package_name || estimate?.package?.name || "") : "";
  const estBuiltUp = estimate ? (estimate.built_up_area || estimate.total_built_up || 0) : 0;

  const submit = async (e) => {
    e.preventDefault();
    const name = form.full_name.trim();
    if (!name) return toast.error("Please enter your full name.");
    const digits = form.mobile.replace(/\D/g, "");
    if (digits.length < 10) return toast.error("Please enter a valid 10-digit mobile number.");

    // Compact mode (Project Cost Calculator): only Name, Mobile, Email, City,
    // Requirement — the rest of the context comes from the estimate snapshot.
    if (compact) {
      if (!form.city.trim()) return toast.error("Please enter your city.");
      setSubmitting(true);
      try {
        await api.post("/erp/enquiries", {
          full_name: name,
          mobile: digits,
          email: form.email?.trim() || null,
          location: form.city.trim(),
          service_area: form.city.trim(),
          plot_size: prefill?.plot_size || null,
          budget: prefill?.budget || null,
          project_type: prefill?.project_type || null,
          message: form.message?.trim() || null,
          source: source || "homepage_calculator",
          estimate: estimate || null,
        });
        try { window.dispatchEvent(new CustomEvent("bde:lead-submitted", { detail: { source } })); } catch (_) { /* */ }
        setDone(true);
      } catch (err) {
        toast.error(err?.response?.data?.detail || "Could not submit your enquiry. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!form.service_area) return toast.error("Please choose a service area.");
    if (mainAreasForRegion.length && !form.main_area) return toast.error("Please choose your main area.");
    if (!form.plot_size.trim()) return toast.error("Please enter your plot size.");
    if (!form.budget.trim()) return toast.error("Please enter your construction budget.");
    if (!form.start_date) return toast.error("Please pick an expected start date.");

    const region = regionsSafe.find((r) => r.id === form.service_area);
    const area = mainAreasForRegion.find((a) => a.id === form.main_area);
    const regionLabel = region?.label || region?.title || form.service_area;
    const mainAreaLabel = area?.label || area?.title || form.main_area || regionLabel;

    setSubmitting(true);
    try {
      await api.post("/erp/enquiries", {
        full_name: name,
        mobile: digits,
        email: form.email?.trim() || null,
        service_area: regionLabel,
        main_area: mainAreaLabel,
        location: mainAreaLabel || regionLabel,
        plot_size: form.plot_size.trim(),
        budget: form.budget.trim(),
        project_type: form.project_type?.trim() || null,
        message: form.message?.trim() || null,
        start_date: form.start_date,
        source: source || "website",
        estimate: estimate || null,
      });
      try {
        window.dispatchEvent(new CustomEvent("bde:lead-submitted", { detail: { source } }));
      } catch (_) { /* SSR/edge safety */ }
      setDone(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not submit your enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={`px-5 sm:px-6 pt-5 pb-3 bg-transparent border-b border-white/10 shrink-0 ${variant === "modal" ? "pr-14" : ""}`}>
        <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-white/[0.04] ring-1 ring-[#C9A24A]/40 mb-3">
          <CalendarCheck className="w-5 h-5 text-[#C9A24A]" />
        </span>
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold bd-eyebrow">BDesigner</p>
        <h3 className="font-display text-lg sm:text-xl font-bold text-white mt-1 leading-tight">
          {done ? "Enquiry received" : (title || "Book Free Consultation")}
        </h3>
        {subtitle && !done ? (<p className="text-[13px] text-white/60 mt-1">{subtitle}</p>) : null}
      </div>

      {estimate && !done ? (
        <div className="px-5 sm:px-6 pt-3 shrink-0">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#C9A24A]">Your Estimate</p>
            <p className="text-[15px] font-bold text-white mt-0.5">
              ₹{Number(estCostMin).toLocaleString("en-IN")} – ₹{Number(estCostMax).toLocaleString("en-IN")}
            </p>
            <p className="text-[12px] font-medium text-white/60 mt-0.5">
              {estPkgName ? `${estPkgName} · ` : ""}
              {estBuiltUp ? `${Number(estBuiltUp).toLocaleString("en-IN")} sq.ft. ` : ""}
              {estimate.timeline_months ? `· ~${estimate.timeline_months} months` : ""}
            </p>
          </div>
        </div>
      ) : null}

      {done ? (
        <div className="px-5 sm:px-6 py-10 text-center overflow-y-auto" data-testid="registration-modal-success">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 grid place-items-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-sm text-white/80 mt-4 leading-relaxed max-w-sm mx-auto">
            Thank you! Our team has received your enquiry. We will contact you shortly.
          </p>
          {variant === "modal" && onClose ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="registration-modal-close-success"
              className="mt-6 w-full inline-flex items-center justify-center px-4 py-3 rounded-full btn-gold-metallic text-white font-semibold text-sm transition shadow-[0_6px_18px_rgba(172,136,51,0.32)]"
            >
              Close
            </button>
          ) : null}
        </div>
      ) : (
        <form onSubmit={submit} className="px-5 sm:px-6 py-5 space-y-3 overflow-y-auto">
          {compact ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full Name" required>
              <input
                ref={nameRef}
                data-testid="registration-name"
                type="text"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="Your full name"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </Field>
            <Field label="Mobile Number" required>
              <input
                data-testid="registration-mobile"
                type="tel"
                inputMode="numeric"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value.replace(/[^\d+\s-]/g, ""))}
                placeholder="10-digit mobile"
                maxLength={15}
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </Field>
            <Field label="City" required>
              <input
                data-testid="registration-city"
                type="text"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </Field>
            <Field label="Email">
              <input
                data-testid="registration-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com (optional)"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Requirement">
                <textarea
                  data-testid="registration-message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Tell us about your project (optional)"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35 resize-none"
                />
              </Field>
            </div>
          </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full Name" required>
              <input
                ref={nameRef}
                data-testid="registration-name"
                type="text"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="Your full name"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </Field>
            <Field label="Mobile Number" required>
              <input
                data-testid="registration-mobile"
                type="tel"
                inputMode="numeric"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value.replace(/[^\d+\s-]/g, ""))}
                placeholder="10-digit mobile"
                maxLength={15}
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </Field>

            <SelectField label="Service Area" required>
              <select
                data-testid="registration-service-area"
                value={form.service_area}
                onChange={(e) => { set("service_area", e.target.value); set("main_area", ""); }}
                className="w-full bg-transparent outline-none text-sm text-white"
              >
                {regionsSafe.map((r) => (
                  <option key={r.id} value={r.id}>{r.label || r.title}</option>
                ))}
              </select>
            </SelectField>
            <SelectField label="Main Area" required={mainAreasForRegion.length > 0}>
              <select
                data-testid="registration-main-area"
                value={form.main_area}
                onChange={(e) => set("main_area", e.target.value)}
                disabled={!mainAreasForRegion.length}
                className="w-full bg-transparent outline-none text-sm text-white disabled:text-white/40"
              >
                <option value="">{mainAreasForRegion.length ? "Select main area" : "No areas yet"}</option>
                {mainAreasForRegion.map((a) => (
                  <option key={a.id} value={a.id}>{a.label || a.title}</option>
                ))}
              </select>
            </SelectField>

            <Field label="Plot Size" required>
              <input
                data-testid="registration-plot"
                type="text"
                value={form.plot_size}
                onChange={(e) => set("plot_size", e.target.value)}
                placeholder="e.g. 30x40"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </Field>
            <Field label="Construction Budget" required>
              <input
                data-testid="registration-budget"
                type="text"
                value={form.budget}
                onChange={(e) => set("budget", e.target.value)}
                placeholder="e.g. ₹40L - ₹60L"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Expected Start Date" required>
                <input
                  data-testid="registration-start-date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => set("start_date", e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
                />
              </Field>
            </div>

            <Field label="Email">
              <input
                data-testid="registration-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com (optional)"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </Field>
            <SelectField label="Project Type">
              <select
                data-testid="registration-project-type"
                value={form.project_type}
                onChange={(e) => set("project_type", e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-white"
              >
                <option value="">Select (optional)</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Renovation">Renovation</option>
                <option value="Interior">Interior</option>
                <option value="Other">Other</option>
              </select>
            </SelectField>
            <div className="sm:col-span-2">
              <Field label="Tell us about your requirement">
                <textarea
                  data-testid="registration-message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Anything specific we should know? (optional)"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35 resize-none"
                />
              </Field>
            </div>
          </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            data-testid="registration-submit"
            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-full bg-[#f5f5f5] text-[#0d0d0f] font-semibold text-sm transition hover:bg-[#e6e6e6] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Get Free Consultation"}
          </button>

          <p className="text-[11px] text-white/50 flex items-center gap-1.5 justify-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24A]" />
            We respect your privacy. No spam, ever.
          </p>
          <input type="hidden" value={source} readOnly />
        </form>
      )}
    </>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-white/70 mb-1">
        {label} {required ? <span className="text-[#C9A24A]">*</span> : null}
      </span>
      <div className="lead-field flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 focus-within:border-[#C9A24A] transition text-white">
        {children}
      </div>
    </label>
  );
}

function SelectField({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-white/70 mb-1">
        {label} {required ? <span className="text-[#C9A24A]">*</span> : null}
      </span>
      <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] focus-within:bg-white/[0.06] focus-within:border-[#C9A24A] transition text-white">
        {children}
      </div>
    </label>
  );
}
