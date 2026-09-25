import React from "react";

/**
 * BDVideoBackground — fixed full-viewport looping video canvas for the HOME
 * hero background (Fix 1).
 *
 * Behaviour (per spec):
 *  - Position: fixed, full viewport, behind ALL page content (z-index:-1).
 *  - Landscape video for landscape/desktop, portrait video for mobile/portrait.
 *  - autoplay + loop + muted + playsInline, no controls, no play/pause UI.
 *  - No fade / zoom / parallax / Ken Burns — the footage is shown exactly as-is.
 *  - object-fit:cover keeps aspect ratio (covers viewport without distortion).
 *
 * Only ONE video element is mounted at a time (the one matching the current
 * orientation) so mobile networks aren't asked to download the desktop clip.
 * A matching poster image paints instantly so the correct orientation is shown
 * from the first frame (never the wrong orientation first).
 */
const PORTRAIT_QUERY = "(orientation: portrait)";

function getIsPortrait() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(PORTRAIT_QUERY).matches;
}

export default function BDVideoBackground() {
  const [isPortrait, setIsPortrait] = React.useState(getIsPortrait);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mql = window.matchMedia(PORTRAIT_QUERY);
    const onChange = (e) => setIsPortrait(e.matches);
    // addEventListener is the modern API; addListener is the legacy fallback.
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  const src = isPortrait ? "/hero-portrait.mp4" : "/hero-landscape.mp4";
  // No poster/fallback image: a static image before the video causes a visible
  // "image → video" flash on load. The .bd-video-bg dark base (#141009) shows
  // cleanly until the first video frame paints instead.

  // Guarantee muted autoplay. React doesn't always reflect the `muted` prop to
  // the DOM attribute, which makes browsers block autoplay — so force it on the
  // element and kick off play() ourselves (re-runs when the source flips).
  React.useEffect(() => {
    const el = videoRef.current;
    if (!el) return undefined;
    el.muted = true;
    el.defaultMuted = true;
    const tryPlay = () => {
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => { /* autoplay guard */ });
    };
    tryPlay();
    el.addEventListener("canplay", tryPlay);
    el.addEventListener("loadeddata", tryPlay);
    return () => {
      el.removeEventListener("canplay", tryPlay);
      el.removeEventListener("loadeddata", tryPlay);
    };
  }, [src]);

  return (
    <div className="bd-video-bg" aria-hidden="true" data-testid="bd-video-bg">
      <video
        ref={videoRef}
        // key forces a fresh element (and correct source load) on orientation flip
        key={src}
        className="bd-video-bg__media"
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        tabIndex={-1}
      />
    </div>
  );
}
