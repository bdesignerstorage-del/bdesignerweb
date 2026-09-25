import React, { useEffect, useRef, useState } from "react";

/**
 * BDIntro — first-load multilingual brand introduction.
 *
 * FIX 18 — deterministic single-value sequence:
 *   • Exactly ONE value visible at any moment (opacity is driven directly on a
 *     single slot node via rAF — no keyed remounts, no competing CSS keyframes).
 *   • Each word fades fully OUT before the next word's text is swapped in, so
 *     two values can never appear together.
 *   • The counter updates via a ref (textContent) so the 60fps timeline does
 *     NOT re-render / restart the word animation.
 *   • Runs once (guarded by the caller via sessionStorage) and is slightly
 *     faster than before, then transitions straight into the page.
 */
const WORDS = [
  { t: "Hello" },
  { t: "Welcome" },
  { t: "to" },
  { t: "BDesigner", brand: true },
  { t: "\u0928\u092E\u0938\u094D\u0924\u0947" },       // नमस्ते (Hindi)
  { t: "\u0938\u094D\u0935\u093E\u0917\u0924" },       // स्वागत (Hindi)
  { t: "\u0CA8\u0CAE\u0CB8\u0CCD\u0C95\u0CBE\u0CB0" }, // ನಮಸ್ಕಾರ (Kannada)
  { t: "\u0CB8\u0CCD\u0CB5\u0CBE\u0C97\u0CA4" },       // ಸ್ವಾಗತ (Kannada)
  { t: "\u0928\u092E\u0938\u094D\u0915\u093E\u0930" }, // नमस्कार (Marathi)
  { t: "Home" },
];

export default function BDIntro({ onDone }) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const STEP = reduce ? 240 : 560;       // ms per word (slightly faster)
  const HOLD = reduce ? 160 : 420;       // hold after last word
  const REVEAL = reduce ? 340 : 820;     // curtain reveal duration
  const N = WORDS.length;
  const END = N * STEP;                  // last word finished showing
  const spanForCount = (N - 1) * STEP;   // counter hits 100 as "Home" appears

  const [idx, setIdx] = useState(0);
  const [revealing, setRevealing] = useState(false);

  const slotRef = useRef(null);
  const countRef = useRef(null);
  const idxRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    let raf;
    let elapsed = 0;
    let last = performance.now();
    const fade = STEP * 0.3; // fade in/out portion of each step

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone && onDone();
    };

    const loop = (now) => {
      const dt = now - last;
      last = now;
      if (!document.hidden) elapsed += dt; // pause while tab hidden

      const curIdx = Math.min(N - 1, Math.floor(elapsed / STEP));
      if (curIdx !== idxRef.current) {
        idxRef.current = curIdx;
        setIdx(curIdx); // text swaps only 10x, always while opacity ~0
      }

      // Opacity within the current step: fade in -> hold -> fade out.
      const inStep = elapsed - curIdx * STEP;
      let op;
      if (elapsed >= END) op = 1;                 // last word stays fully visible
      else if (inStep < fade) op = inStep / fade; // fade in
      else if (inStep > STEP - fade) op = Math.max(0, (STEP - inStep) / fade); // fade out
      else op = 1;
      if (slotRef.current) slotRef.current.style.opacity = String(op);

      if (countRef.current) {
        const c = Math.min(100, Math.round((elapsed / spanForCount) * 100));
        countRef.current.textContent = String(c).padStart(2, "0");
      }

      if (elapsed >= END + HOLD && !doneRef.current) setRevealing(true);
      if (elapsed >= END + HOLD + REVEAL) {
        finish();
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    const safety = setTimeout(finish, 13000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [STEP, HOLD, REVEAL, N, END, spanForCount, onDone]);

  const w = WORDS[idx] || WORDS[N - 1];

  return (
    <div className={`bd-intro ${revealing ? "is-revealing" : ""}`} data-testid="bd-intro">
      <div className="bd-intro__bg" aria-hidden="true">
        <picture>
          <source media="(max-width: 640px)" srcSet="/bg-mobile.webp" />
          <img src="/hero-main.webp" alt="" />
        </picture>
      </div>

      <div className="bd-intro__slot" ref={slotRef} style={{ opacity: 0 }}>
        {w.brand ? (
          <img className="bd-intro__brandimg" src="/bdesigner-logo-white.png" alt="BDesigner" />
        ) : (
          <span className="bd-intro__word" data-testid="bd-intro-word">{w.t}</span>
        )}
      </div>

      <div className="bd-intro__count" ref={countRef} aria-hidden="true">00</div>
    </div>
  );
}
