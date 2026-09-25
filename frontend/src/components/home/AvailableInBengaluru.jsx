import React from "react";
import { MapPin } from "lucide-react";

/**
 * Available in Bengaluru — left illustration / right service area chips.
 * The "Check Availability" CTA was removed — serviceability will be handled
 * inside the Requirement Form.
 */
export default function AvailableInBengaluru({ items = [] }) {
  const visible = (items || []).filter((i) => !i.hidden);
  if (!visible.length) return null;

  return (
    <section
      data-testid="available-bengaluru-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        {/* Left — illustration (strict 1:1 square per Fix 4) */}
        <div className="relative aspect-square max-w-md mx-auto lg:mx-0 w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#F5F5F5] to-[#F5F5F5] border border-[#E5E7EB]">
          <img
            src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=70"
            alt="Bengaluru skyline"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold bd-eyebrow">Now Serving</p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold mt-1 text-[#ffffff]">Bengaluru</h3>
            <p className="text-xs sm:text-sm text-[#ffffff] mt-1">12+ neighbourhoods — from Whitefield to JP Nagar.</p>
          </div>
          {/* Floating pin */}
          <div className="hidden sm:flex absolute top-5 right-5 items-center gap-1.5 bg-white/95 backdrop-blur text-slate-900 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border border-white/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Live
          </div>
        </div>

        {/* Right — area chips */}
        <div>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold bd-eyebrow">Service Areas</p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-1 leading-tight">
            Available in <span className="text-[#111111]">Bengaluru</span>
          </h2>

          <div className="mt-5 flex flex-wrap gap-2" data-testid="service-area-chips">
            {visible.map((it) => (
              <span
                key={it.id}
                data-testid={`service-area-${it.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-700 hover:border-[#111111]/40 hover:text-[#111111] transition"
              >
                <MapPin className="w-3.5 h-3.5 text-[#111111]" />
                {it.label || it.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
