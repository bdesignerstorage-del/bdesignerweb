import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2, Mail, Lock, Loader2, KeyRound, CheckCircle2, User, Phone, X,
} from "lucide-react";

/**
 * AuthModal — public authentication UI.
 *
 * Public signup path: House Owner (client) only. Every self-registration
 * is provisioned as role="client" — the user never sees or picks a role.
 * All other roles (Project Manager, Civil Engineer, Architect, Contractor,
 * Brand Partner, Admin) are ADMIN-PROVISIONED and log in via the same modal
 * once the admin issues credentials.
 *
 * UI-fix highlights (2025-07-23):
 *   1. Close button is always visible above the sticky modal header — uses
 *      a custom `hideClose` DialogContent + a fixed close button at z-[70].
 *   2. Role selection removed — role is silently set to "client".
 *   3. Confirm-password field with inline mismatch validation.
 */
const ROLE_TARGETS = {
  admin: "/admin",
  project_manager: "/pm/dashboard",
  civil_engineer: "/engineer/dashboard",
  client: "/client",
  customer: "/client",
  brand_partner: "/brand/dashboard",
};

export default function AuthModal() {
  const {
    user, authOpen, setAuthOpen, authMode, setAuthMode,
    login, register, formatApiErrorDetail,
  } = useAuth();

  const [view, setView] = useState(null);
  const effectiveView = view || authMode || "login";

  const location = useLocation();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "", remember: false });
  // Public signup always creates a House Owner (client). The role field is
  // NEVER exposed to the user.
  const [regForm, setRegForm] = useState({
    name: "", mobile: "", email: "", password: "", confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authOpen && user && user.id) {
      // Flow D: login was launched from the Requirement Form to resume a
      // pending draft — suppress the hard redirect so the form can continue.
      if (sessionStorage.getItem("bd_suppress_auth_redirect") === "1") {
        sessionStorage.removeItem("bd_suppress_auth_redirect");
        setAuthOpen(false);
        return;
      }
      setAuthOpen(false);
      // Honor an explicit intended destination first (Flow C — return to
      // the page/flow the user was trying to reach), else role home.
      let target = null;
      try { target = sessionStorage.getItem("bd_post_login_redirect"); } catch { /* ignore */ }
      if (target) { try { sessionStorage.removeItem("bd_post_login_redirect"); } catch { /* ignore */ } }
      const dest = target || ROLE_TARGETS[user.role] || "/client";
      if (dest.startsWith("/client")) navigate(dest);
      else window.location.href = dest;
    }
  }, [authOpen, user, setAuthOpen, navigate]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || "");
      const auth = params.get("auth");
      if (auth === "login" || auth === "register") {
        setAuthMode(auth);
        setView(auth);
        setAuthOpen(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("auth");
        window.history.replaceState({}, "", url.toString());
      }
    } catch { /* ignore */ }
  }, [location.search]);

  const resetState = () => {
    setLoginForm({ email: "", password: "", remember: false });
    setRegForm({ name: "", mobile: "", email: "", password: "", confirmPassword: "" });
    setForgotEmail("");
    setErr("");
    setInfo("");
    setView(null);
  };

  const handleClose = (open) => {
    setAuthOpen(open);
    if (!open) resetState();
  };

  const switchView = (v) => {
    setView(v);
    setAuthMode(v === "forgot" || v === "forgot-success" ? "login" : v);
    setErr("");
    setInfo("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const data = await login(loginForm.email, loginForm.password, { remember_me: loginForm.remember });
      toast.success("Welcome back");
      handleClose(false);
      redirectAfterAuth(data);
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setLoading(false); }
  };

  // Central post-auth redirect (used by both login and register handlers).
  // Honors the Flow-D suppression flag and an optional intended destination.
  const redirectAfterAuth = (data) => {
    try {
      if (sessionStorage.getItem("bd_suppress_auth_redirect") === "1") {
        sessionStorage.removeItem("bd_suppress_auth_redirect");
        return;
      }
    } catch { /* ignore */ }
    let target = null;
    try {
      target = sessionStorage.getItem("bd_post_login_redirect");
      if (target) sessionStorage.removeItem("bd_post_login_redirect");
    } catch { /* ignore */ }
    const dest = target || ROLE_TARGETS[data?.role] || "/client";
    if (dest.startsWith("/client")) navigate(dest);
    else window.location.href = dest;
  };

  // Passwords match when both are non-empty and identical.
  const passwordsMatch =
    regForm.password.length > 0
    && regForm.confirmPassword.length > 0
    && regForm.password === regForm.confirmPassword;
  const showMismatchInline =
    regForm.confirmPassword.length > 0 && !passwordsMatch;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    const name = regForm.name.trim();
    const mobile = regForm.mobile.replace(/\D/g, "");
    const email = regForm.email.trim();
    if (!name) { setErr("Please enter your full name."); setLoading(false); return; }
    if (mobile.length < 10) { setErr("Please enter a valid 10-digit mobile number."); setLoading(false); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("Please enter a valid email address."); setLoading(false); return; }
    if (regForm.password.length < 6) { setErr("Password must be at least 6 characters."); setLoading(false); return; }
    if (regForm.password !== regForm.confirmPassword) {
      setErr("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      // Public signups are ALWAYS created as House Owner (client).
      const data = await register(name, email, regForm.password, mobile, "client");
      toast.success("Account created — welcome to BDesigner");
      handleClose(false);
      redirectAfterAuth(data);
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setLoading(false); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot", { email: forgotEmail });
      setInfo(data.message || "If the email exists, a password reset link has been sent.");
      switchView("forgot-success");
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setLoading(false); }
  };

  const title = {
    login: "Welcome Back",
    register: "Create your account",
    forgot: "Reset your password",
    "forgot-success": "Check your inbox",
  }[effectiveView];

  const subtitle = {
    login: "Sign in to continue to your dashboard.",
    register: "Join BDesigner — track your project, manage tasks and stay in the loop.",
    forgot: "Enter your email — we'll send you a reset link.",
    "forgot-success": "If an account exists for that email, the reset link is on its way.",
  }[effectiveView];

  const icon = effectiveView === "forgot" || effectiveView === "forgot-success"
    ? <KeyRound className="w-6 h-6 text-gold" />
    : <Building2 className="w-6 h-6 text-gold" />;

  return (
    <Dialog open={authOpen} onOpenChange={handleClose}>
      <DialogContent
        hideClose
        data-testid="auth-modal"
        className="bg-white border border-[#EAEAEA] text-slate-900 p-0 overflow-hidden max-w-md rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.15)] flex flex-col max-h-[calc(100dvh-1rem)]"
      >
        {/* Shared modal close button — one component/style for Login and
            Create Account. Always-on-top, 44px touch target, 20px X icon.
            The modal surface is always white, so the icon uses a fixed
            near-black (#111111) that stays visible in Light AND Dark mode
            (theme tokens would flip it to white on white). */}
        <button
          type="button"
          aria-label="Close"
          data-testid="auth-modal-close"
          onClick={() => handleClose(false)}
          className="absolute grid place-items-center w-11 h-11 rounded-full bg-white border border-slate-200 text-[#111111] shadow-[0_4px_14px_rgba(0,0,0,0.14)] hover:bg-slate-100 active:scale-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 z-[70]"
          style={{
            top: "max(0.75rem, env(safe-area-inset-top))",
            right: "max(0.75rem, env(safe-area-inset-right))",
          }}
        >
          <X className="h-5 w-5" strokeWidth={2.25} />
        </button>

        {/* Sticky header — stays fixed at the top of the modal while the
            form body scrolls independently underneath. */}
        <div
          data-testid="auth-modal-header"
          className="relative shrink-0 bg-white/95 backdrop-blur-sm border-b border-transparent"
        >
          <div className="absolute inset-0 gradient-radial-gold opacity-60 pointer-events-none" />
          <div className="relative px-8 pt-8 pb-4 pr-16">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 grid place-items-center mb-4">{icon}</div>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl" data-testid="auth-title">{title}</DialogTitle>
              <DialogDescription className="text-slate-700" data-testid="auth-subtitle">{subtitle}</DialogDescription>
            </DialogHeader>

            {(effectiveView === "login" || effectiveView === "register") && (
              <div className="mt-5 grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-full" data-testid="auth-tabs">
                <button
                  type="button"
                  data-testid="auth-tab-login"
                  onClick={() => switchView("login")}
                  className={`text-sm font-semibold py-2 rounded-full transition ${
                    effectiveView === "login" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  data-testid="auth-tab-register"
                  onClick={() => switchView("register")}
                  className={`text-sm font-semibold py-2 rounded-full transition ${
                    effectiveView === "register" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable body — everything below the sticky header. The
            close button remains visible even as this region scrolls. */}
        <div className="overflow-y-auto flex-1 [-webkit-overflow-scrolling:touch]">
          {effectiveView === "login" && (
            <form onSubmit={handleLogin} className="px-8 pb-8 pt-6 space-y-4">
              <GoogleAuthButton label="Continue with Google" testid="login-google-btn" />
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                <span className="flex-1 h-px bg-slate-200" />or continue with email<span className="flex-1 h-px bg-slate-200" />
              </div>
              <Field
                icon={<Mail className="w-4 h-4" />}
                testid="auth-email-input"
                placeholder="Email address"
                type="email"
                value={loginForm.email}
                onChange={(v) => setLoginForm({ ...loginForm, email: v })}
                required
              />
              <PasswordInput
                testid="auth-password-input"
                placeholder="Password"
                value={loginForm.password}
                onChange={(v) => setLoginForm({ ...loginForm, password: v })}
                autoComplete="current-password"
                required
                minLength={6}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    data-testid="auth-remember-me"
                    checked={loginForm.remember}
                    onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-gold focus:ring-gold/30 accent-[#C9A24A]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  data-testid="forgot-password-link"
                  onClick={() => switchView("forgot")}
                  className="text-sm text-slate-700 hover:text-gold transition font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {err && <div data-testid="auth-error" className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{err}</div>}
              {info && <div className="text-green-600 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">{info}</div>}

              <button
                type="submit"
                data-testid="auth-submit-btn"
                disabled={loading}
                className="w-full btn-gold-metallic text-white font-bold rounded-xl py-3 transition disabled:opacity-60 flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
              </button>
            </form>
          )}

          {effectiveView === "register" && (
            <form
              onSubmit={handleRegister}
              className="px-8 pb-8 pt-6 space-y-4"
              data-testid="register-form"
            >
              <GoogleAuthButton label="Continue with Google" testid="register-google-btn" />
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                <span className="flex-1 h-px bg-slate-200" />or continue with email<span className="flex-1 h-px bg-slate-200" />
              </div>
              <Field
                icon={<User className="w-4 h-4" />}
                testid="register-name-input"
                placeholder="Full name"
                type="text"
                value={regForm.name}
                onChange={(v) => setRegForm({ ...regForm, name: v })}
                required
              />
              <Field
                icon={<Phone className="w-4 h-4" />}
                testid="register-mobile-input"
                placeholder="Mobile number (10 digits)"
                type="tel"
                inputMode="numeric"
                value={regForm.mobile}
                onChange={(v) => setRegForm({ ...regForm, mobile: v.replace(/[^\d+\s-]/g, "") })}
                maxLength={15}
                required
              />
              <Field
                icon={<Mail className="w-4 h-4" />}
                testid="register-email-input"
                placeholder="Email address"
                type="email"
                value={regForm.email}
                onChange={(v) => setRegForm({ ...regForm, email: v })}
                required
              />
              <PasswordInput
                testid="register-password-input"
                placeholder="Password (min 6 characters)"
                value={regForm.password}
                onChange={(v) => setRegForm({ ...regForm, password: v })}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <div>
                <PasswordInput
                  testid="register-confirm-password-input"
                  placeholder="Confirm password"
                  value={regForm.confirmPassword}
                  onChange={(v) => setRegForm({ ...regForm, confirmPassword: v })}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className={showMismatchInline ? "border-red-400 focus:border-red-400" : ""}
                  aria-invalid={showMismatchInline}
                />
                {showMismatchInline ? (
                  <p
                    data-testid="password-mismatch"
                    className="mt-1.5 text-xs text-red-500 font-medium"
                  >
                    Passwords do not match.
                  </p>
                ) : null}
              </div>

              {err && <div data-testid="auth-error" className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{err}</div>}

              <button
                type="submit"
                data-testid="register-submit-btn"
                disabled={loading || showMismatchInline}
                className="w-full btn-gold-metallic text-white font-bold rounded-xl py-3 transition disabled:opacity-60 flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              </button>
            </form>
          )}

          {effectiveView === "forgot" && (
            <form onSubmit={handleForgot} className="px-8 pb-8 pt-6 space-y-4">
              <Field icon={<Mail className="w-4 h-4" />} testid="forgot-email-input" placeholder="Your account email" type="email" value={forgotEmail} onChange={setForgotEmail} required />
              {err && <div data-testid="auth-error" className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{err}</div>}
              <button type="submit" data-testid="forgot-submit-btn" disabled={loading} className="w-full btn-gold-metallic text-white font-bold rounded-xl py-3 transition disabled:opacity-60 flex items-center justify-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send reset link"}
              </button>
              <button type="button" data-testid="back-to-login-btn" onClick={() => switchView("login")} className="w-full inline-flex items-center justify-center text-sm text-slate-700 hover:text-gold">
                Back to login
              </button>
            </form>
          )}

          {effectiveView === "forgot-success" && (
            <div className="px-8 pb-8 pt-6 space-y-4">
              <div data-testid="forgot-success" className="text-sm bg-green-500/10 border border-green-500/20 text-green-700 rounded-lg px-3 py-3 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-0.5">Reset link sent</div>
                  <div className="text-slate-700 text-[13px]">{info} The link is valid for 15 minutes and can be used only once.</div>
                </div>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Didn{"'"}t get an email? Check your spam folder, or wait a minute and try again.
                If email delivery is not yet configured by the admin, the link is recorded in the audit log instead.
              </p>
              <button
                data-testid="back-to-login-from-success"
                onClick={() => switchView("login")}
                className="w-full btn-gold-metallic text-white font-bold rounded-xl py-3 transition"
              >
                Back to login
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ icon, testid, onChange, className = "", ...rest }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
      <input
        data-testid={testid}
        {...rest}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-gold/60 placeholder:text-slate-500 ${className}`}
      />
    </div>
  );
}
