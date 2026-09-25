import React, { useEffect, useRef, useState } from "react";
import { Share2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

/**
 * Share component — native share only, no custom popup.
 *
 * Behaviour:
 *   • If the browser supports the Web Share API (`navigator.share`) — mobile
 *     AND desktop — the device/browser native share sheet opens directly.
 *   • If native share is NOT supported, the URL is automatically copied to
 *     the clipboard and a "Link copied successfully" toast is shown.
 *   • No custom share modal / channel buttons / overlay — ever.
 *
 * Every successful share is still reported to the backend so admins keep
 * per-entity share analytics ("native" or "copy_link" source).
 *
 * Props:
 *   kind     — "material" | "project" | "brand"  (backend share endpoint kind)
 *   id       — entity id
 *   url      — absolute URL of the page being shared (defaults to current)
 *   title    — title used for native share (optional)
 *   text     — short description used for native share (optional)
 *   variant  — "icon" (round 36px, default) or "pill" (with label)
 *   shares   — initial share count (used for optimistic UI only)
 *   onShared — callback({shares}) so the parent can update its local count
 *   className / testid — passthrough
 */

const KIND_PATH = {
  material: "materials",
  project: "projects",
  brand: "brands",
};

export function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Legacy fallback for older browsers
  return new Promise((resolve, reject) => {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      ok ? resolve() : reject(new Error("copy failed"));
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Reusable one-shot share utility (for non-component callers).
 * Native share when supported, otherwise copy link + toast.
 * Returns "native" | "copy_link" | null (cancelled/failed).
 */
export async function nativeShare({ title, text, url } = {}) {
  const fullUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title || (typeof document !== "undefined" ? document.title : "");
  const shareText = text || shareTitle;
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: fullUrl });
      return "native";
    } catch (err) {
      // User dismissed the native sheet — do nothing.
      if (err && err.name === "AbortError") return null;
      // Unexpected native failure → fall through to clipboard.
    }
  }
  try {
    await copyToClipboard(fullUrl);
    toast.success("Link copied successfully");
    return "copy_link";
  } catch {
    toast.error("Couldn't copy the link — long-press to copy manually.");
    return null;
  }
}

export default function ShareMenu({
  kind,
  id,
  url,
  title,
  text,
  variant = "icon",
  shares,
  onShared,
  className = "",
  testid,
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const sharesRef = useRef(shares || 0);
  useEffect(() => { sharesRef.current = shares || 0; }, [shares]);

  // Tracks the share on the backend + bumps the local count optimistically.
  // Failures never block UX.
  const recordShare = async (source) => {
    const path = KIND_PATH[kind] || "projects";
    try {
      const r = await api.post(`/${path}/${id}/share`, { source });
      if (onShared) onShared(r.data || { shares: sharesRef.current + 1 });
    } catch {
      if (onShared) onShared({ shares: sharesRef.current + 1 });
    }
  };

  const handleTrigger = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const result = await nativeShare({ title, text, url });
    if (result) {
      if (result === "copy_link") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      recordShare(result);
    }
    setBusy(false);
  };

  const triggerClasses = variant === "pill"
    ? `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gold text-ink-900 transition disabled:opacity-50 ${className}`
    : `w-9 h-9 rounded-full grid place-items-center backdrop-blur-md border border-white/40 bg-black/35 text-white hover:bg-black/55 transition disabled:opacity-50 ${className}`;

  const triggerIcon = busy
    ? <Loader2 className={variant === "pill" ? "w-3.5 h-3.5 animate-spin" : "w-4 h-4 animate-spin"} />
    : copied
      ? <Check className={variant === "pill" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      : <Share2 className={variant === "pill" ? "w-3.5 h-3.5" : "w-4 h-4"} />;

  return (
    <button
      type="button"
      data-testid={testid || `share-trigger-${kind}-${id}`}
      onClick={handleTrigger}
      disabled={busy}
      aria-label="Share"
      className={triggerClasses}
    >
      {triggerIcon}
      {variant === "pill" && (copied ? "Copied!" : "Share")}
    </button>
  );
}
