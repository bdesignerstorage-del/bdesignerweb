import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setStoredToken } from "@/lib/api";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e?.preventDefault();
    setErr(""); setBusy(true);
    try {
      const { data } = await api.post("/auth/login", { email: email.trim(), password });
      if (data.role !== "admin") {
        setStoredToken(null);
        throw new Error("This account is not an administrator.");
      }
      setStoredToken(data.token, true);
      navigate("/admin");
    } catch (e2) {
      setErr(e2.response?.data?.detail || e2.message || "Login failed.");
    } finally { setBusy(false); }
  };

  return (
    <div data-theme="dark" className="min-h-screen grid place-items-center px-4" style={{ background: "#0B0B0B" }}>
      <form onSubmit={submit} data-testid="admin-login-form" className="w-full max-w-sm rounded-2xl p-7" style={{ background: "#111111", border: "1px solid #292929" }}>
        <div className="w-12 h-12 rounded-xl grid place-items-center mb-4" style={{ background: "#1A1A1A", border: "1px solid #292929" }}>
          <ShieldCheck className="w-6 h-6" style={{ color: "#C9A24A" }} />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "#C9A24A" }}>BDesigner Admin</p>
        <h1 className="text-2xl font-bold mt-1" style={{ color: "#F5F5F5" }}>Sign in</h1>
        <p className="text-sm mt-1" style={{ color: "#B5B5B5" }}>Website CMS &amp; operations console.</p>
        {err && <div data-testid="admin-login-error" className="mt-4 text-sm rounded-lg px-3 py-2" style={{ color: "#F87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>{err}</div>}
        <label className="block text-xs font-semibold mt-5 mb-1.5" style={{ color: "#B5B5B5" }}>Email</label>
        <input data-testid="admin-login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full rounded-xl px-3.5 py-3 text-[15px] outline-none" style={{ background: "#0B0B0B", border: "1px solid #2A2A2A", color: "#F5F5F5" }} placeholder="admin@bdesigner.com" />
        <label className="block text-xs font-semibold mt-4 mb-1.5" style={{ color: "#B5B5B5" }}>Password</label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#777" }} />
          <input data-testid="admin-login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full rounded-xl pl-9 pr-3.5 py-3 text-[15px] outline-none" style={{ background: "#0B0B0B", border: "1px solid #2A2A2A", color: "#F5F5F5" }} placeholder="••••••••" />
        </div>
        <button data-testid="admin-login-submit" type="submit" disabled={busy}
          className="w-full mt-6 py-3 rounded-full font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "#F5F5F5", color: "#0B0B0B" }}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Sign in
        </button>
      </form>
    </div>
  );
}
