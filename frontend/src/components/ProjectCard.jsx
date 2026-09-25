import React from "react";
import { Link } from "react-router-dom";
import { Eye, Share2 } from "lucide-react";
import ShareMenu from "@/components/ShareMenu";

function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n || 0);
}

/**
 * ProjectCard — rebuilt Trending Projects card (Fix 1 v2), parity with MaterialCard.
 *
 *   • Fixed 200px mobile card so titles don't get compressed.
 *   • 1:1 square image, only TOP corners rounded via `overflow-hidden` +
 *     `rounded-2xl` on the wrapper.
 *   • Card body padding 16px, gap between cards 16px (via HorizontalScroll).
 *   • Title 18px / 600 / 1.4 line-height, max 2 lines with ellipsis.
 *   • Price (budget) on one line.
 *   • Bottom row: Views / Shares (left) + style chip (right, auto-width,
 *     whitespace-nowrap, never clipped).
 */
export default function ProjectCard({ project, compact }) {
  const [shares, setShares] = React.useState(project.shares || 0);
  const detailUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/projects/${project.id}`
      : `/projects/${project.id}`;

  return (
    <Link
      to={`/projects/${project.id}`}
      data-testid={`project-card-${project.id}`}
      className={`group flex-shrink-0 block snap-start bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.05)] hover:shadow-[0_10px_28px_rgba(15,23,42,0.10)] hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
        compact
          ? "w-[200px] sm:w-[240px] lg:w-[280px]"
          : "w-full"
      }`}
    >
      {/* IMAGE — 1:1 square, top-corners-only via parent overflow-hidden */}
      <div className="aspect-square w-full relative overflow-hidden bg-slate-50">
        <img
          src={project.cover}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {project.tag && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gold text-ink-900">
            {project.tag}
          </span>
        )}
        <span className="absolute top-3 right-3">
          <ShareMenu
            kind="project"
            id={project.id}
            url={detailUrl}
            shares={shares}
            onShared={(d) => setShares(d.shares ?? shares + 1)}
            testid={`project-share-${project.id}`}
          />
        </span>
      </div>

      {/* CONTENT — 16px padding, ordered per Fix 3 (2026-07-16):
           style chip → title → budget → stats */}
      <div className="p-4 flex flex-col gap-3">
        {/* Style chip — directly above title, auto-width, never clipped */}
        {project.style && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap shrink-0 self-start">
            {project.style}
          </span>
        )}

        {/* Title */}
        <h4
          className="font-display text-slate-900 group-hover:text-[#C9A24A] transition line-clamp-2"
          style={{ fontSize: "18px", fontWeight: 600, lineHeight: 1.4 }}
        >
          {project.title}
        </h4>

        {/* Estimated Price (budget) — one line */}
        <div className="whitespace-nowrap overflow-hidden">
          <span className="bd-price-accent text-[15px] truncate">
            {project.budget}
          </span>
        </div>

        {/* Views + Share count — bottom row */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 whitespace-nowrap">
          <span
            className="inline-flex items-center gap-1"
            data-testid={`project-views-${project.id}`}
          >
            <Eye className="w-3.5 h-3.5" />
            {fmt(project.views)}
          </span>
          <span
            className="inline-flex items-center gap-1"
            data-testid={`project-shares-${project.id}`}
          >
            <Share2 className="w-3.5 h-3.5" />
            {fmt(shares)}
          </span>
        </div>
      </div>
    </Link>
  );
}
