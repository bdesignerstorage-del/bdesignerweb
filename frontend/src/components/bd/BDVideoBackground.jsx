import React from "react";
import { useHeroMode } from "@/context/HeroModeContext";

/**
 * BDVideoBackground — fixed full-viewport looping video canvas for the HOME
 * hero background.
 *
 *  - Position: fixed, full viewport, behind ALL page content.
 *  - Landscape video for landscape/desktop, portrait video for mobile/portrait.
 *  - autoplay + loop + muted + playsInline, no controls, no play/pause UI.
 *  - No fade / zoom / parallax — the footage is shown exactly as-is.
 *  - object-fit:cover keeps aspect ratio.
 *
 * The video element is registered with HeroModeContext so the hero
 * Construction / Morning / Night buttons can seek it to the admin-configured
 * timeline points. Sources come from admin-configurable settings.hero.
 */
const PORTRAIT_QUERY = "(orientation: portrait)";

function getIsPortrait() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(PORTRAIT_QUERY).matches;
}

export default function BDVideoBackground() {
  const { hero, registerVideo } = useHeroMode();
  const [isPortrait, setIsPortrait] = React.useState(getIsPortrait);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mql = window.matchMedia(PORTRAIT_QUERY);
    const onChange = (e) => setIsPortrait(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  const src = isPortrait
    ? (hero.video_portrait || "/hero-portrait.mp4")
    : (hero.video_landscape || "/hero-landscape.mp4");

  // Guarantee muted autoplay and register the element for hero seeking.
  React.useEffect(() => {
    const el = videoRef.current;
    if (!el) return undefined;
    el.muted = true;
    el.defaultMuted = true;
    registerVideo(el);
    const tryPlay = () => {
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
    el.addEventListener("canplay", tryPlay);
    el.addEventListener("loadeddata", tryPlay);
    return () => {
      el.removeEventListener("canplay", tryPlay);
      el.removeEventListener("loadeddata", tryPlay);
    };
  }, [src, registerVideo]);

  return (
    <div className="bd-video-bg" aria-hidden="true" data-testid="bd-video-bg">
      <video
        ref={videoRef}
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
