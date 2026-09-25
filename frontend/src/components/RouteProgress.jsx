import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Top-of-page route progress bar (YouTube / NProgress / Vercel style).
 *
 * Behaviour:
 *   - Triggers on every react-router pathname or search-string change.
 *   - Animates 0 → 30 → 60 → 80 → 95 % while the next route mounts.
 *   - Snaps to 100 % a tick after the route renders, then fades out.
 *   - Never blocks pointer events (pointer-events:none).
 *
 * Visual:
 *   - Track: cream (#F5F1E8)
 *   - Bar:   brand gold (#C9A24A) with a soft glow
 */
const TICKS = [30, 60, 80, 95];
const TICK_INTERVAL = 140;        // ms between trickles
const FINISH_DELAY = 220;         // hold time before fade
const FADE_DURATION = 360;        // matches CSS transition

export default function RouteProgress() {
  const { pathname, search } = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const isFirstRender = useRef(true);
  const timers = useRef([]);

  useEffect(() => {
    // Skip the very first render so we don't flash on initial load.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Reset any in-flight animation
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // Start: instantly visible at 0, then jump to first tick on next frame.
    setVisible(true);
    setProgress(0);

    const raf = requestAnimationFrame(() => {
      TICKS.forEach((p, idx) => {
        const t = setTimeout(() => setProgress(p), idx * TICK_INTERVAL + 30);
        timers.current.push(t);
      });

      // Finish: 100 % a bit after the last trickle, then fade out.
      const finishAt = TICKS.length * TICK_INTERVAL + FINISH_DELAY;
      const tFinish = setTimeout(() => setProgress(100), finishAt);
      const tHide = setTimeout(() => {
        setVisible(false);
        // After fade-out completes, snap back to 0 for next run.
        const tReset = setTimeout(() => setProgress(0), FADE_DURATION);
        timers.current.push(tReset);
      }, finishAt + FADE_DURATION);

      timers.current.push(tFinish, tHide);
    });

    return () => {
      cancelAnimationFrame(raf);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [pathname, search]);

  return (
    <div
      aria-hidden="true"
      data-testid="route-progress"
      className="route-progress"
      data-visible={visible ? "true" : "false"}
    >
      <div
        className="route-progress__bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
