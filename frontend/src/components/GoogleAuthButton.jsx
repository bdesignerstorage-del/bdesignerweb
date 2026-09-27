import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { GoogleIcon } from "@/components/requirement/primitives";

/**
 * GoogleAuthButton — official multicolor Google "G" on a white/light surface
 * (dark text, subtle border, premium pill radius) in BOTH themes.
 *
 * Google login becomes functional ONLY when real OAuth credentials are
 * configured (GET /api/auth/providers → google_enabled). When it is NOT
 * configured we show an HONEST "not connected yet" state — we never fake a
 * login (docs/rules.md §19).
 */
export default function GoogleAuthButton({ label = "Continue with Google", testid = "google-auth-btn", onStart }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/auth/providers")
      .then(({ data }) => { if (active) setEnabled(!!data?.google_enabled); })
      .catch(() => { if (active) setEnabled(false); });
    return () => { active = false; };
  }, []);

  const handleClick = () => {
    if (!enabled) {
      toast.info("Google sign-in isn't connected yet — please continue with email below.");
      return;
    }
    // Preserve any pending flow (e.g. requirement draft) before redirect.
    onStart?.();
    window.location.href = `${api.defaults.baseURL}/auth/google/login`;
  };

  return (
    <button
      type="button"
      data-testid={testid}
      onClick={handleClick}
      aria-disabled={!enabled}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-[15px] transition active:scale-[0.99]"
      style={{ background: "#FFFFFF", color: "#111111", border: "1px solid #DADCE0", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
    >
      <GoogleIcon className="w-5 h-5" />
      <span style={{ color: "#111111", WebkitTextFillColor: "#111111" }}>{label}</span>
    </button>
  );
}
