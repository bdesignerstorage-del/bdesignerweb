import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top on every route change.
 * Drop this once inside <BrowserRouter>.
 *
 * Notes:
 *  - Uses `behavior: "auto"` (the spec name for instant) so users never see a
 *    half-loaded page or a smooth bottom-to-top crawl.
 *  - Disables the browser's automatic scroll restoration so back/forward also
 *    open at the top instead of the previous scroll position.
 *  - Re-applies after the next animation frame to beat any layout that mounts
 *    a hair late (avoids the "lands at mid-page" bug on heavy routes).
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      try { window.history.scrollRestoration = "manual"; } catch (_) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const jumpTop = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch (_) {
        window.scrollTo(0, 0);
      }
      // Also reset the document element / body in case a layout uses them as the scroller.
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };
    jumpTop();
    const raf = requestAnimationFrame(jumpTop);
    return () => cancelAnimationFrame(raf);
  }, [pathname, search]);

  return null;
}
