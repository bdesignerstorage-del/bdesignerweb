import React from "react";
import { Check, X } from "lucide-react";

function Cell({ kind }) {
  if (kind === "yes") return <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></span>;
  if (kind === "no") return <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/25"><X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></span>;
  if (kind === "partial") return <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25 text-[9px] sm:text-[10px] font-bold">PARTIAL</span>;
  return <span className="text-white/40 text-sm">{kind || "\u2014"}</span>;
}

/**
 * WhyChooseBDesigner (FIX 4) — premium DARK comparison component.
 * Rounded outer container, subtle thin borders, dark translucent surface,
 * understated header, quiet row separators (no bright grey blocks). Always
 * fits 3 columns (table-fixed) so there is NO page-level horizontal scroll.
 *
 * Rows / values / icons are admin-editable via /admin/homepage.
 */
export default function WhyChooseBDesigner({ items = [] }) {
  const visible = (items || []).filter((i) => !i.hidden);
  if (!visible.length) return null;
  return (
    <section
      data-testid="why-choose-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
    >
      <div className="mb-6 sm:mb-8">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold bd-eyebrow">The BDesigner Difference</p>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1">
          Why Choose <span className="text-[#C9A24A]">BDesigner</span>
        </h2>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0d0d0f] overflow-hidden">
        <table className="w-full text-[12px] sm:text-sm table-fixed">
          <colgroup>
            <col className="w-[54%] sm:w-[60%]" />
            <col className="w-[23%] sm:w-[20%]" />
            <col className="w-[23%] sm:w-[20%]" />
          </colgroup>
          <thead>
            <tr className="text-left bg-white/[0.03]">
              <th className="py-3.5 px-3 sm:px-5 text-white/45 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wide">
                Feature
              </th>
              <th className="py-3.5 px-2 sm:px-5 text-center text-white font-bold whitespace-nowrap text-[12px] sm:text-sm">
                BDesigner
              </th>
              <th className="py-3.5 px-2 sm:px-5 text-center text-white/45 font-semibold whitespace-nowrap text-[12px] sm:text-sm">
                Others
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} data-testid={`compare-row-${row.id}`} className="border-t border-white/[0.06] hover:bg-white/[0.03] transition">
                <td className="py-3.5 px-3 sm:px-5 font-semibold text-white/85 leading-snug">
                  {row.title || row.label}
                </td>
                <td className="py-3.5 px-2 sm:px-5 text-center"><Cell kind={row.meta?.bdesigner || "yes"} /></td>
                <td className="py-3.5 px-2 sm:px-5 text-center"><Cell kind={row.meta?.others || "no"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
