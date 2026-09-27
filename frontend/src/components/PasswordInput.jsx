import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

/**
 * PasswordInput — the ONE reusable password field with show/hide control.
 * Reused by Login, Create Account and the Requirement Form registration.
 *
 * variant="auth"  → white modal style (bg-slate-50 / slate border)
 * variant="req"   → theme-aware BDesigner requirement-form field style
 *
 * The Eye/EyeOff toggle sits inside the right edge, is a 44px touch target,
 * keyboard-accessible, theme-aware and never shifts layout. Toggling
 * visibility never resets the typed value (controlled input).
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  testid,
  toggleTestid,
  variant = "auth",
  autoComplete = "current-password",
  className = "",
  showLeftIcon = true,
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  if (variant === "dark") {
    return (
      <div className="relative">
        <input
          data-testid={testid}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg pl-3 pr-12 py-2.5 text-sm outline-none ${className}`}
          style={{ background: "#0B0B0B", border: "1px solid #292929", color: "#F5F5F5" }}
          {...rest}
        />
        <button
          type="button"
          data-testid={toggleTestid || (testid ? `${testid}-toggle` : "password-toggle")}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-lg"
          style={{ color: "#B5B5B5" }}
        >
          {visible ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
        </button>
      </div>
    );
  }

  if (variant === "req") {
    return (
      <div className="bd-req-field relative flex items-center gap-2 rounded-xl pl-4 pr-1 py-3.5">
        {showLeftIcon && <Lock className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
        <input
          data-testid={testid}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-[15px] font-medium"
          {...rest}
        />
        <button
          type="button"
          data-testid={toggleTestid || (testid ? `${testid}-toggle` : "password-toggle")}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="shrink-0 w-11 h-11 grid place-items-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
        >
          {visible ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
        </button>
      </div>
    );
  }

  // variant="auth" — white modal field
  return (
    <div className="relative">
      {showLeftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Lock className="w-4 h-4" />
        </span>
      )}
      <input
        data-testid={testid}
        type={visible ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl ${showLeftIcon ? "pl-10" : "pl-3"} pr-12 py-3 text-sm focus:outline-none focus:border-gold/60 placeholder:text-slate-500 ${className}`}
        {...rest}
      />
      <button
        type="button"
        data-testid={toggleTestid || (testid ? `${testid}-toggle` : "password-toggle")}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-lg text-slate-500 hover:text-slate-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
      >
        {visible ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
      </button>
    </div>
  );
}
