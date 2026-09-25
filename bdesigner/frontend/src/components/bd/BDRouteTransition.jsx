import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * BDRouteTransition — short page-specific word shown over a soft glass veil
 * on internal navigation (never the full multilingual intro). Uses the
 * existing background/glass system so there is no white flash.
 */
const WORD = {
  "/": "Home",
  "/projects": "Projects",
  "/materials": "Materials",
  "/brands": "Brands",
  "/packages": "Build",
  "/how-we-work": "Process",
  "/about": "Vision",
  "/contact": "Connect",
  "/testimonials": "Stories",
  "/news": "News",
  "/search": "Search",
  "/profile": "Account",
};

function wordFor(path) {
  if (WORD[path]) return WORD[path];
  if (path.startsWith("/projects/")) return "Project";
  if (path.startsWith("/materials/")) return "Material";
  if (path.startsWith("/brands/")) return "Brand";
  return "BDesigner";
}

export default function BDRouteTransition() {
  const loc = useLocation();
  const [state, setState] = useState("idle"); // idle | in | out
  const [word, setWord] = useState("");
  const first = useRef(true);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    // No route transition inside the ERP dashboard — interactions must feel instant.
    if (/^\/(admin|pm|engineer|client|brand)(\/|$)/.test(loc.pathname)) {
      setState("idle");
      return undefined;
    }
    setWord(wordFor(loc.pathname));
    setState("in");
    const t1 = setTimeout(() => setState("out"), reduce ? 160 : 420);
    const t2 = setTimeout(() => setState("idle"), reduce ? 340 : 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loc.pathname, reduce]);

  if (state === "idle") return null;

  return (
    <div
      className={`bd-transition ${state === "in" ? "is-in" : "is-out"}`}
      data-testid="bd-route-transition"
      aria-hidden="true"
    >
      <div className="bd-transition__word">{word}</div>
    </div>
  );
}
