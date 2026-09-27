import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Sparkles, Loader2, MapPin, ArrowRight, Home as HomeIcon } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRequirementForm } from "@/context/RequirementFormContext";

const rupee = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

export default function ClientHome() {
  const { user, loading, setAuthOpen, setAuthMode } = useAuth();
  const { openRequirement } = useRequirementForm();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, projects: [], count: 0 });

  // Gate: anonymous visitors are prompted to log in (draft-safe).
  useEffect(() => {
    if (loading) return;
    if (!user?.id) {
      setAuthMode("login");
      setAuthOpen(true);
    }
  }, [loading, user, setAuthMode, setAuthOpen]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    api.get("/client/summary")
      .then(({ data }) => { if (active) setState({ loading: false, projects: data.projects || [], count: data.count || 0 }); })
      .catch(() => { if (active) setState({ loading: false, projects: [], count: 0 }); });
    return () => { active = false; };
  }, [user]);

  const startProject = () => openRequirement({ source: "client-dashboard" });

  if (loading || (user?.id && state.loading)) {
    return (
      <div data-testid="client-home-loading" className="min-h-[70vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--text-secondary)" }} />
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div data-testid="client-home-gate" className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Please log in to view your dashboard</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Sign in to see your projects and requirements.</p>
        <button data-testid="client-gate-login" onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
          className="btn-gold-metallic text-white font-bold rounded-full px-6 py-3 mt-6">Login</button>
      </div>
    );
  }

  const firstName = (user.name || "there").split(" ")[0];
  const isEmpty = state.count === 0;

  return (
    <div data-testid="client-home" className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] bd-eyebrow">Welcome to BDesigner</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mt-2" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
        Hi {firstName} 👋
      </h1>

      {isEmpty ? (
        <div data-testid="client-empty-state"
          className="mt-8 rounded-3xl px-6 sm:px-10 py-12 sm:py-16 text-center bd-card-surface"
          style={{ border: "1px solid var(--border-primary)" }}>
          <div className="w-16 h-16 rounded-2xl grid place-items-center mx-auto bd-card-surface" style={{ border: "1px solid var(--border-primary)" }}>
            <HomeIcon className="w-7 h-7" style={{ color: "var(--text-primary)" }} />
          </div>
          <h2 className="text-2xl font-bold mt-6" style={{ color: "var(--text-primary)" }}>Start your first home project</h2>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            Tell us about your dream home and get an instant architectural estimate. We'll guide you from design to handover.
          </p>
          <button
            data-testid="client-start-project-btn"
            onClick={startProject}
            className="btn-gold-metallic text-white font-bold rounded-full px-7 py-3.5 mt-8 inline-flex items-center gap-2"
          >
            <ClipboardList className="w-5 h-5" /> Plan Your Dream Home
          </button>
          <p className="text-[11px] mt-4 inline-flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Sparkles className="w-3 h-3" /> Free estimate · No obligation
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Your Projects</h2>
            <button data-testid="client-new-project-btn" onClick={startProject}
              className="btn-gold-metallic text-white font-semibold rounded-full px-4 py-2.5 text-sm inline-flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> New Project
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4" data-testid="client-projects">
            {state.projects.map((p) => (
              <div key={p.id} data-testid={`client-project-${p.id}`}
                className="rounded-2xl p-5 bd-card-surface" style={{ border: "1px solid var(--border-primary)" }}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-[var(--text-primary)] leading-tight">{p.project_name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>{p.status}</span>
                </div>
                {p.location && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <MapPin className="w-3.5 h-3.5" /> {p.location}
                  </div>
                )}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Architectural Estimate</div>
                    <div className="text-xl font-bold bd-req-accent mt-0.5">{rupee(p.total_architectural_charge)}</div>
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{p.services_count} service{p.services_count === 1 ? "" : "s"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
