import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Minimal, distraction-free fullscreen image viewer.
 *
 * Visible chrome (intentionally minimal):
 *   - Image (centered, max size, aspect-ratio preserved)
 *   - Previous / Next arrows  (semi-transparent white; on hover desktop, always mobile)
 *   - Single Close button     (white circle, top-right, always visible)
 *
 * Interactions kept:
 *   - Wheel zoom (desktop)
 *   - Pinch zoom (mobile)
 *   - Double-tap to zoom (mobile)
 *   - Pan when zoomed (mouse drag / touch drag)
 *   - Swipe left/right to navigate (mobile, when not zoomed)
 *   - Keyboard: Left / Right / Esc / +,- / 0
 *
 * Props:
 *   images       — string[] (URLs)
 *   startIndex   — initial image to display (default 0)
 *   onClose      — callback when the viewer closes
 *   testid       — optional test id prefix
 *   subtitle     — IGNORED (kept for backward-compat with existing callers; no header is rendered)
 */
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;
const DOUBLE_TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 300;
const SWIPE_THRESHOLD = 60;     // px
const SWIPE_VELOCITY = 0.3;     // px/ms

export default function FullscreenViewer({
  images,
  startIndex = 0,
  onClose,
  testid = "fullscreen-viewer",
  // `subtitle` is accepted but intentionally not rendered — minimal viewer.
  subtitle: _subtitle,
  ...rest
}) {
  void rest;
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [idx, setIdx] = useState(() => Math.min(Math.max(0, startIndex), Math.max(0, safeImages.length - 1)));
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  const touchRef = useRef({ startX: 0, startY: 0, startT: 0, pinchDist: 0, pinchZoomBase: 1, lastTapAt: 0 });
  const containerRef = useRef(null);

  const total = safeImages.length;
  const goNext = useCallback(() => {
    if (total <= 1) return;
    setIdx((i) => (i + 1) % total);
    setZoom(1);
    setTranslate({ x: 0, y: 0 });
  }, [total]);
  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setIdx((i) => (i - 1 + total) % total);
    setZoom(1);
    setTranslate({ x: 0, y: 0 });
  }, [total]);
  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2))), []);
  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const nz = Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2));
      if (nz === MIN_ZOOM) setTranslate({ x: 0, y: 0 });
      return nz;
    });
  }, []);
  const resetZoom = useCallback(() => { setZoom(1); setTranslate({ x: 0, y: 0 }); }, []);

  // Keyboard handling
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose && onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        resetZoom();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, zoomIn, zoomOut, resetZoom, onClose]);

  // Lock body scroll while the viewer is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Mouse-wheel zoom
  const onWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  // Mouse drag (panning when zoomed in)
  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: translate.x,
      baseY: translate.y,
    };
    setDragging(true);
  };
  const onMouseMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    setTranslate({
      x: d.baseX + (e.clientX - d.startX),
      y: d.baseY + (e.clientY - d.startY),
    });
  };
  const stopDrag = () => { dragRef.current.active = false; setDragging(false); };

  // Touch (swipe + pinch + double-tap)
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      touchRef.current.pinchDist = Math.hypot(dx, dy);
      touchRef.current.pinchZoomBase = zoom;
      return;
    }
    const t = e.touches[0];
    const now = Date.now();
    // Double-tap detection
    if (now - touchRef.current.lastTapAt < DOUBLE_TAP_MS) {
      if (zoom > 1) {
        resetZoom();
      } else {
        setZoom(DOUBLE_TAP_ZOOM);
      }
      touchRef.current.lastTapAt = 0;
    } else {
      touchRef.current.lastTapAt = now;
    }

    touchRef.current.startX = t.clientX;
    touchRef.current.startY = t.clientY;
    touchRef.current.startT = now;
    if (zoom > 1) {
      dragRef.current = {
        active: true,
        startX: t.clientX,
        startY: t.clientY,
        baseX: translate.x,
        baseY: translate.y,
      };
      setDragging(true);
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2 && touchRef.current.pinchDist > 0) {
      const [a, b] = e.touches;
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / touchRef.current.pinchDist;
      const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, touchRef.current.pinchZoomBase * ratio));
      setZoom(+nz.toFixed(2));
      return;
    }
    if (dragRef.current.active && zoom > 1) {
      const t = e.touches[0];
      setTranslate({
        x: dragRef.current.baseX + (t.clientX - dragRef.current.startX),
        y: dragRef.current.baseY + (t.clientY - dragRef.current.startY),
      });
    }
  };
  const onTouchEnd = (e) => {
    dragRef.current.active = false;
    setDragging(false);
    touchRef.current.pinchDist = 0;
    if (zoom > 1) return; // don't swipe-navigate while zoomed
    const dt = Date.now() - touchRef.current.startT;
    const tEnd = (e.changedTouches && e.changedTouches[0]) || null;
    if (!tEnd) return;
    const dx = tEnd.clientX - touchRef.current.startX;
    const dy = tEnd.clientY - touchRef.current.startY;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.4) {
      const velocity = Math.abs(dx) / Math.max(1, dt);
      if (velocity > SWIPE_VELOCITY || Math.abs(dx) > SWIPE_THRESHOLD * 2) {
        if (dx < 0) goNext();
        else goPrev();
      }
    }
  };

  // Backdrop click closes the viewer (only if click is on backdrop, not image/arrow/close).
  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose && onClose();
  };

  if (!safeImages.length) return null;

  return (
    <div
      ref={containerRef}
      data-testid={testid}
      onClick={onBackdropClick}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onWheel={onWheel}
      className="group fixed inset-0 z-[200] bg-black flex items-center justify-center"
      style={{ backgroundColor: "#000000" }}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Close button — top-right, white circle, always visible */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose && onClose(); }}
        data-testid={`${testid}-close`}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-11 h-11 sm:w-12 sm:h-12 grid place-items-center rounded-full bg-white text-black shadow-lg hover:bg-white/90 active:scale-95 transition"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.25} />
      </button>

      {/* Image stage */}
      <div
        className="w-full h-full grid place-items-center select-none touch-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={`${safeImages[idx]}-${idx}`}
          src={safeImages[idx]}
          alt={`Image ${idx + 1} of ${total}`}
          draggable={false}
          onMouseDown={onMouseDown}
          data-testid={`${testid}-image`}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})`,
            transition: dragging ? "none" : "transform 200ms ease-out",
            cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
          }}
          className="max-w-[100vw] max-h-[100vh] object-contain will-change-transform"
        />
      </div>

      {/* Prev / Next buttons — hover-only on desktop, always visible on mobile */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            data-testid={`${testid}-prev`}
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 grid place-items-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            data-testid={`${testid}-next`}
            aria-label="Next image"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 grid place-items-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </>
      )}
    </div>
  );
}
