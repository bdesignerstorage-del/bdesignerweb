import React, { useMemo, useState } from "react";
import { Maximize2, Image as ImageIcon } from "lucide-react";
import FullscreenViewer from "@/components/FullscreenViewer";

/**
 * Categorised image gallery used on the public Project Detail page.
 *
 * Renders:
 *   - A pill row of category tabs (one per non-empty group), with image
 *     counts. The first group is selected by default.
 *   - A VERTICAL stack of A4-portrait cards (210:297 ratio) — one image
 *     per card. No horizontal scrolling. Tap to open the fullscreen
 *     viewer (zoom enabled).
 *
 * Props:
 *   groups      — array of {category_id, category: {id, name, slug, kind, order}, images: string[]}
 *                 (as returned by the enriched GET /api/projects/{id})
 *   kindLabel   — string used as the viewer subtitle context (e.g. "2D Floor Plan")
 *   emptyLabel  — text shown when no group has images
 *   testid      — base data-testid prefix
 */
export default function CategoryGallery({
  groups,
  kindLabel = "Gallery",
  emptyLabel = "No images available yet.",
  testid = "category-gallery",
}) {
  // Normalise + drop empty groups so the tab strip always reflects real content.
  const nonEmpty = useMemo(
    () => (Array.isArray(groups) ? groups : []).filter((g) => (g.images || []).length > 0),
    [groups],
  );
  const [activeRaw, setActive] = useState(0);
  const active = activeRaw < nonEmpty.length ? activeRaw : 0;
  const [viewer, setViewer] = useState({ open: false, startIndex: 0 });

  if (!nonEmpty.length) {
    return (
      <div
        data-testid={`${testid}-empty`}
        className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center"
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-white border border-slate-200 grid place-items-center mb-3">
          <ImageIcon className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-600">{emptyLabel}</p>
      </div>
    );
  }

  const activeGroup = nonEmpty[active];
  const images = activeGroup.images || [];
  const catName = activeGroup.category?.name || "Uncategorized";

  return (
    <div data-testid={testid}>
      {/* Category tabs */}
      <div
        data-testid={`${testid}-tabs`}
        className="flex flex-wrap gap-2 sm:gap-2.5 mb-5"
        role="tablist"
        aria-label={`${kindLabel} categories`}
      >
        {nonEmpty.map((g, i) => {
          const isActive = i === active;
          return (
            <button
              key={g.category_id || `cat-${i}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`${testid}-tab-${i}`}
              onClick={() => setActive(i)}
              className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition border ${
                isActive
                  ? "bg-gold text-ink-900 border-gold shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-gold/40 hover:text-slate-900"
              }`}
            >
              <span>{g.category?.name || "Uncategorized"}</span>
              <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-ink-900/15 text-ink-900" : "bg-slate-100 text-slate-600"
              }`}>
                {(g.images || []).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Vertical A4-portrait stack — full-width mobile, capped width on desktop */}
      <div
        data-testid={`${testid}-stack`}
        className="flex flex-col items-center gap-5 sm:gap-6"
      >
        {images.map((src, i) => (
          <button
            key={`${activeGroup.category_id}-${src}-${i}`}
            type="button"
            data-testid={`${testid}-image-${i}`}
            onClick={() => setViewer({ open: true, startIndex: i })}
            className="group relative w-full max-w-[560px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
            style={{ aspectRatio: "210 / 297" }}
          >
            <img
              src={src}
              alt={`${catName} — image ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-contain bg-slate-50"
            />
            <span className="absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center bg-black/45 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition">
              <Maximize2 className="w-4 h-4" />
            </span>
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide">
              {i + 1} / {images.length}
            </span>
          </button>
        ))}
      </div>

      {/* Fullscreen viewer */}
      {viewer.open && (
        <FullscreenViewer
          images={images}
          startIndex={viewer.startIndex}
          subtitle={`${kindLabel} · ${catName}`}
          testid={`${testid}-viewer`}
          onClose={() => setViewer({ open: false, startIndex: 0 })}
        />
      )}
    </div>
  );
}
