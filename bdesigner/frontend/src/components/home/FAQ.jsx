import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * FAQ (Fix 8) — left-aligned heading + accordion directly below.
 * Section width matches other homepage sections (max-w-7xl).
 */
export default function FAQ({ items = [] }) {
  const visible = (items || []).filter((i) => !i.hidden);
  const [openId, setOpenId] = useState(visible[0]?.id || null);
  if (!visible.length) return null;
  return (
    <section
      data-testid="faq-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
    >
      <div className="mb-6 sm:mb-8">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold bd-eyebrow">FAQ</p>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-1">
          Frequently Asked <span className="text-[#111111]">Questions</span>
        </h2>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-white/10 max-w-3xl">
        {visible.map((f) => {
          const open = openId === f.id;
          return (
            <div key={f.id} data-testid={`faq-${f.id}`} className="border-white/10">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : f.id)}
                className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left"
                aria-expanded={open}
              >
                <span className="font-display font-semibold text-slate-900 text-sm sm:text-base">{f.title}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
              </button>
              {open ? (
                <div className="px-4 sm:px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                  {f.meta?.answer || f.description || ""}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
