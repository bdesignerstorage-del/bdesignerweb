import React from "react";

/**
 * BDBackground — the permanent fixed architectural canvas.
 * Desktop uses /hero-main.webp, mobile (<=640px) uses /bg-mobile.webp.
 * A soft warm overlay keeps the photography visible while ensuring
 * white text stays readable. Sits at z-index:-1 behind all content.
 */
export default function BDBackground() {
  return (
    <div className="bd-fixed-bg" aria-hidden="true" data-testid="bd-fixed-bg">
      <picture>
        <source media="(max-width: 640px)" srcSet="/bg-mobile.webp" />
        <img src="/hero-main.webp" alt="" decoding="async" />
      </picture>
      <div className="bd-bg-overlay" />
    </div>
  );
}
