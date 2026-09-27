import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  X, ArrowLeft, ClipboardList, Upload, MapPin, Loader2, Mail,
  ChevronDown, ChevronUp, Sparkles, CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/PasswordInput";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import {
  ReqCard, ReqField, ReqSegmented, ReqCounter, ReqChips, ReqImageCard, ReqRow,
  ELEV_IMAGES, rupee, GoogleIcon,
} from "./primitives";

const LS_KEY = "bd_requirement_draft_v1";
const FACINGS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const PURPOSES = ["House Owner", "House Rent", "Parking", "Shop", "Storage"];
const INDOOR = ["Living Room","Temple","Kitchen","Double Height Lobby","Dining","Common Washroom","Office Area","Study Room","Kids Room","Store Room","Inside Lift","Inside Stair","Family Lounge","Drawing Room","Theatre","Gym","Walk-in Wardrobe","Bar Area","Balcony","Foyer","Wash Area","Family Room","Conference Room","Powder Room"];
const OUTDOOR = ["Garden","Outside Stair","Swimming Pool","Security Room","Compound Gate","Veranda / Sitout","Basement Room","Servant Room","Pet House","Bonfire"];
const ELEV_STYLES = ["Simple Design", "Modern Design", "Kerala Design", "Classical Design"];
const ELEV_VIEWS = ["Front Design", "Left Design", "Right Design", "Back Design"];

const emptyFloor = () => ({ area: "", purpose: "House Owner", bedrooms: 0, masterBedrooms: 0, indoor: [], outdoor: [], notes: "" });

function loadDraft() {
  try { const d = JSON.parse(localStorage.getItem(LS_KEY)); if (d) return d; } catch {}
  return null;
}

export default function RequirementForm({ onClose }) {
  const { register, user, setAuthOpen, setAuthMode } = useAuth();
  const navigate = useNavigate();
  const saved = loadDraft();
  const [step, setStep] = useState(saved?.step || 1);
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(saved?.selected || []);
  const [dims, setDims] = useState(saved?.dims || { front: "", back: "", left: "", right: "" });
  const [storeys, setStoreys] = useState(saved?.storeys ?? 0);
  const [floors, setFloors] = useState(saved?.floors || [emptyFloor()]);
  const [projectName, setProjectName] = useState(saved?.projectName || "");
  const [files, setFiles] = useState(saved?.files || []);
  const [address, setAddress] = useState(saved?.address || null);
  const [showAddrPicker, setShowAddrPicker] = useState(false);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [serviceable, setServiceable] = useState(saved?.serviceable ?? null);
  const [construction, setConstruction] = useState(saved?.construction || { need: "", vastu: "", facing: "", family: 0, bike: 0, car: 0 });
  const [activeFloor, setActiveFloor] = useState(0);
  const [elevation, setElevation] = useState(saved?.elevation || { style: "", views: [] });
  const [priceLines, setPriceLines] = useState([]);
  const [total, setTotal] = useState(0);
  const [reg, setReg] = useState({ name: user?.name || "", mobile: "", email: user?.email || "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [resumeAfterLogin, setResumeAfterLogin] = useState(false);

  useEffect(() => {
    document.body.classList.add("lead-modal-open");
    return () => document.body.classList.remove("lead-modal-open");
  }, []);

  useEffect(() => {
    api.get("/requirement/services").then((r) => setServices(r.data.services || [])).catch(() => {});
    api.get("/requirement/serviceability").then((r) => setServiceAreas(r.data.areas || [])).catch(() => {});
  }, []);

  const totalArea = useMemo(() => {
    const floorCount = storeys + 1;
    return floors.slice(0, floorCount).reduce((s, f) => s + (parseFloat(f.area) || 0), 0);
  }, [floors, storeys]);

  // Calculated plot footprint from the 4 plot sides (near-rectangular avg).
  const baseArea = useMemo(() => {
    const f = parseFloat(dims.front), b = parseFloat(dims.back), l = parseFloat(dims.left), r = parseFloat(dims.right);
    if ([f, b, l, r].some((v) => !(v > 0))) return 0;
    return Math.round(((f + b) / 2) * ((l + r) / 2));
  }, [dims]);

  // Auto-populate Ground Floor with the calculated footprint (stays editable;
  // never overwrites a value the user has manually changed).
  const autoGfRef = useRef(null);
  useEffect(() => {
    if (baseArea > 0) {
      setFloors((prev) => {
        const cur = prev[0]?.area;
        if (cur === "" || cur == null || String(cur) === String(autoGfRef.current)) {
          autoGfRef.current = baseArea;
          const next = [...prev];
          next[0] = { ...next[0], area: String(baseArea) };
          return next;
        }
        return prev;
      });
    }
  }, [baseArea]);

  // Step-2 completeness: every created floor must have a valid area.
  const incompleteFloors = useMemo(() => {
    return floors.slice(0, storeys + 1)
      .map((f, i) => (parseFloat(f.area) > 0 ? -1 : i))
      .filter((i) => i >= 0);
  }, [floors, storeys]);
  const step2Complete = totalArea > 0 && incompleteFloors.length === 0;

  const wantsElevation = useMemo(
    () => services.some((s) => s.triggers_elevation && selected.includes(s.code)),
    [services, selected]
  );

  useEffect(() => {
    if (!selected.length) { setPriceLines([]); setTotal(0); return; }
    const t = setTimeout(() => {
      api.post("/requirement/price", { service_codes: selected, total_area: totalArea })
        .then((r) => { setPriceLines(r.data.lines || []); setTotal(r.data.total || 0); })
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [selected, totalArea]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ step, selected, dims, storeys, floors, projectName, files, address, serviceable, construction, elevation }));
    } catch {}
  }, [step, selected, dims, storeys, floors, projectName, files, address, serviceable, construction, elevation]);

  useEffect(() => {
    setFloors((prev) => {
      const need = storeys + 1;
      const next = [...prev];
      while (next.length < need) next.push(emptyFloor());
      return next.slice(0, need);
    });
    setActiveFloor((a) => Math.min(a, storeys));
  }, [storeys]);

  const floorName = (i) => (i === 0 ? "Ground Floor" : i === 1 ? "First Floor" : i === 2 ? "Second Floor" : i === 3 ? "Third Floor" : `Floor ${i}`);

  const STEPS = useMemo(() => {
    const base = [1, 2, 3, 4, 5];
    if (wantsElevation) base.push(6);
    base.push(7);
    // Registration (step 8) is only for anonymous visitors. An authenticated
    // client saves the project against their own account from the Summary.
    if (!user?.id) base.push(8);
    return base;
  }, [wantsElevation, user]);

  // Keep `step` valid if the elevation step appears/disappears (avoids a stuck state).
  useEffect(() => {
    if (!STEPS.includes(step)) {
      const fallback = [...STEPS].reverse().find((s) => s < step) || STEPS[0];
      setStep(fallback);
    }
  }, [STEPS, step]);

  const goNext = () => {
    setErr("");
    const idx = STEPS.indexOf(step);
    if (step === 1 && selected.length === 0) return setErr("Select at least one service.");
    if (step === 2 && !step2Complete) return setErr("Enter built-up area for every floor.");
    if (step === 3 && !address) return setErr("Select your project location.");
    if (step === 4 && !construction.need) return setErr("Please tell us about your construction interest.");
    if (step === 6 && !elevation.style) return setErr("Select an elevation style.");
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };
  const goBack = () => {
    setErr("");
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const toggleService = (code) => setSelected((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));
  const updFloor = (i, patch) => setFloors((p) => p.map((f, k) => (k === i ? { ...f, ...patch } : f)));
  const toggleFloorItem = (i, key, val) => setFloors((p) => p.map((f, k) => (k === i ? { ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] } : f)));

  const buildRequirement = () => ({
    dimensions: dims, storeys: `G+${storeys}`, total_built_up_area: totalArea,
    floors: floors.slice(0, storeys + 1).map((f, i) => ({ name: floorName(i), ...f })),
    project_name: projectName, files: files.map((f) => f.name),
    address, serviceable, construction, elevation: wantsElevation ? elevation : null,
  });

  const submitLead = useCallback(async (extra = {}) => {
    const source = (typeof window !== "undefined" && window.__bd_req_source) || "plan-your-dream-home";
    return api.post("/requirement/submit", {
      name: extra.name || reg.name, mobile: extra.mobile || reg.mobile, email: extra.email || reg.email,
      project_name: projectName, service_codes: selected, total_area: totalArea,
      requirement: buildRequirement(), source,
    });
  }, [reg, projectName, selected, totalArea, floors, storeys, dims, address, construction, elevation, wantsElevation, serviceable]);

  // Authenticated client saving the project directly from Summary (Flow E /
  // logged-in user). No registration, uses their own account.
  const handleProjectSubmit = useCallback(async () => {
    setErr(""); setSubmitting(true);
    try {
      await submitLead({ name: user?.name, email: user?.email, mobile: reg.mobile });
      try { localStorage.removeItem(LS_KEY); } catch {}
      toast.success("Your project has been saved.");
      onClose?.();
      navigate("/client");
    } catch (e) {
      setErr(e.response?.data?.detail || e.message || "Something went wrong.");
    } finally { setSubmitting(false); }
  }, [submitLead, user, reg.mobile, onClose]);

  const handleRegister = async () => {
    setErr(""); setEmailExists(false); setSubmitting(true);
    try {
      const name = reg.name.trim(); const mobile = reg.mobile.replace(/\D/g, ""); const email = reg.email.trim();
      if (!name) throw new Error("Please enter your full name.");
      if (mobile.length < 10) throw new Error("Enter a valid 10-digit mobile number.");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email.");
      if (!user?.id) {
        if (reg.password.length < 6) throw new Error("Password must be at least 6 characters.");
        if (reg.password !== reg.confirmPassword) throw new Error("Passwords do not match.");
        await register(name, email, reg.password, mobile, "client");
      }
      await submitLead({ name, mobile, email });
      try { localStorage.removeItem(LS_KEY); } catch {}
      toast.success("Account created — your project requirement is saved.");
      onClose?.();
      navigate("/client");
    } catch (e) {
      const detail = e.response?.data?.detail || e.message || "Something went wrong.";
      // Email uniqueness — offer to log in and resume with the draft intact.
      if (/already registered|already exists/i.test(String(detail))) {
        setEmailExists(true);
        setErr("An account already exists with this email.");
      } else {
        setErr(detail);
      }
    } finally { setSubmitting(false); }
  };

  // Flow D: user chose "Login to Continue" from the existing-email state.
  // Open the login modal (draft stays in localStorage). When they become
  // authenticated we resume the submission automatically.
  const loginToContinue = () => {
    setResumeAfterLogin(true);
    try { sessionStorage.setItem("bd_suppress_auth_redirect", "1"); } catch {}
    setReg((r) => ({ ...r }));
    setAuthMode("login");
    setAuthOpen(true);
  };

  useEffect(() => {
    if (resumeAfterLogin && user?.id) {
      setResumeAfterLogin(false);
      (async () => {
        setSubmitting(true);
        try {
          await submitLead({ name: user.name, email: user.email, mobile: reg.mobile });
          try { localStorage.removeItem(LS_KEY); } catch {}
          toast.success("Logged in — your project requirement is saved.");
          onClose?.();
          navigate("/client");
        } catch (e) {
          setErr(e.response?.data?.detail || e.message || "Something went wrong.");
        } finally { setSubmitting(false); }
      })();
    }
  }, [resumeAfterLogin, user, submitLead, reg.mobile, onClose]);

  const STEP_META = {
    1: { n: 1, title: "Select Architectural Services", help: "Choose the design services you need for your dream home." },
    2: { n: 2, title: "Project Details", help: "Tell us your plot size, floors and project name." },
    3: { n: 3, title: "Serviceability Check", help: "Confirm your location so we can check construction coverage." },
    4: { n: 4, title: "Construction Requirement", help: "A few details to shape your design and build." },
    5: { n: 5, title: "Rooms Per Floor", help: "Set the rooms and amenities for each floor." },
    6: { n: 6, title: "Elevation Details", help: "Pick the elevation style and views you like." },
    7: { n: 7, title: "Project Summary", help: "Review your requirement and estimated charges." },
    8: { n: 8, title: "Create Your Account", help: "Save this project and continue with BDesigner." },
  };
  const meta = STEP_META[step];
  const stepIndex = STEPS.indexOf(step);

  // CTA config
  let ctaLabel = "Next", ctaAction = goNext, ctaDisabled = false, secondary = null, ctaIcon = null;
  if (step === 1) ctaLabel = "Continue";
  if (step === 2) ctaDisabled = !step2Complete;
  if (step === 7) {
    if (user?.id) {
      ctaLabel = submitting ? "Saving…" : "Create This Project";
      ctaAction = handleProjectSubmit; ctaDisabled = submitting;
      ctaIcon = submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />;
    } else {
      ctaLabel = "Continue With This Project"; ctaAction = () => setStep(8);
    }
    secondary = { label: "Edit Requirement", action: () => setStep(1) };
  }
  if (step === 8) {
    ctaLabel = submitting ? "Creating…" : (user?.id ? "Save My Project" : "Create Account");
    ctaAction = handleRegister; ctaDisabled = submitting;
    ctaIcon = submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />;
  }

  const CtaButtons = ({ full }) => (
    <div className={`flex ${secondary ? "flex-col sm:flex-row" : ""} gap-2.5`}>
      {secondary && (
        <button data-testid="req-edit" onClick={secondary.action}
          className="bd-req-ghost rounded-full px-5 py-3 text-sm font-semibold sm:flex-1">
          {secondary.label}
        </button>
      )}
      <button
        data-testid={step === 8 ? "req-create-account" : "req-next"}
        onClick={ctaAction}
        disabled={ctaDisabled}
        className={`bd-req-cta rounded-full px-6 py-3 text-sm inline-flex items-center justify-center gap-2 ${full || secondary ? "flex-1" : ""}`}
      >
        {ctaIcon}{ctaLabel}
      </button>
    </div>
  );

  const Summary = ({ compact }) => (
    <div className="space-y-4" data-testid="req-summary-panel">
      <div>
        <p className="bd-eyebrow">Your Project</p>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mt-1 leading-tight">{projectName || "My Dream Home"}</h3>
      </div>
      <div className="bd-card-surface rounded-2xl px-4 py-1 bd-req-divide">
        <ReqRow k="Services" v={selected.length ? `${selected.length} selected` : "—"} />
        <ReqRow k="Built-up Area" v={totalArea > 0 ? `${totalArea.toLocaleString("en-IN")} sq.ft.` : "—"} />
        <ReqRow k="Floors" v={`G + ${storeys}`} />
        <ReqRow k="Location" v={address?.label || "—"} />
        {construction.need && <ReqRow k="Construction" v={construction.need} />}
      </div>
      {serviceable !== null && (
        <div className={`text-xs font-semibold px-3 py-2 rounded-xl inline-flex items-center gap-1.5 ${serviceable ? "text-[var(--status-success)]" : "text-[var(--status-warning)]"}`}
          style={{ background: "var(--surface-secondary)", border: "1px solid var(--border-primary)" }} data-testid="req-serviceability">
          <MapPin className="w-3.5 h-3.5" />
          {serviceable ? "Construction available in your area" : "Architecture available · turnkey coming soon"}
        </div>
      )}
      {!compact && priceLines.length > 0 && (
        <div className="bd-card-surface rounded-2xl px-4 py-3 bd-req-divide">
          {priceLines.map((l) => (
            <div key={l.code} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">{l.name}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  {l.pricing_type === "free" ? "Included FREE" : l.pricing_type === "per_sqft" ? `${rupee(l.rate)}/sq.ft. × ${l.applicable_area.toLocaleString("en-IN")} sq.ft.` : "Fixed"}
                </div>
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{rupee(l.amount)}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end justify-between pt-1">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Architectural Estimate</div>
          <div className="text-2xl font-bold bd-req-accent mt-0.5" data-testid="req-summary-total">{rupee(total)}</div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <Sparkles className="w-3 h-3" /> Live estimate
        </div>
      </div>
    </div>
  );

  const shell = (
    <div className="fixed inset-0 z-[100000] flex items-stretch lg:items-center justify-center" data-testid="requirement-form" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="bd-req-shell bd-req-enter relative w-full h-full lg:h-auto lg:max-h-[90vh] lg:max-w-5xl lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT — form */}
        <div className="flex-1 flex flex-col min-h-0 lg:w-[60%]">
          {/* Header */}
          <div className="shrink-0 px-5 sm:px-7 pt-5 sm:pt-7 pb-4 border-b" style={{ borderColor: "var(--border-divider)" }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl grid place-items-center bd-card-surface">
                  <ClipboardList className="w-5 h-5 text-[var(--text-primary)]" />
                </div>
                <div>
                  <p className="bd-eyebrow">BDesigner</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Step {meta.n} of {STEPS.length}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {stepIndex > 0 && (
                  <button data-testid="req-back" onClick={goBack} aria-label="Back" className="bd-req-iconbtn w-9 h-9 grid place-items-center rounded-full">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <button data-testid="req-close" onClick={onClose} aria-label="Close" className="bd-req-iconbtn w-9 h-9 grid place-items-center rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h2 className="text-2xl sm:text-[26px] font-bold mt-4 text-[var(--text-primary)]" style={{ letterSpacing: "-0.02em" }} data-testid="req-step-title">{meta.title}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{meta.help}</p>
            <div className="mt-4 flex gap-1.5">
              {STEPS.map((s) => (
                <span key={s} className={`h-1 flex-1 rounded-full ${stepIndex >= STEPS.indexOf(s) ? "bd-req-track-on" : "bd-req-track"}`} />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
            {err && <div data-testid="req-error" className="text-sm rounded-xl px-3.5 py-2.5" style={{ color: "var(--status-error)", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)" }}>{err}</div>}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3" data-testid="req-services">
                {services.map((s) => (
                  <ReqImageCard
                    key={s.code}
                    testid={`req-service-${s.code}`}
                    image={s.image}
                    label={s.name}
                    sublabel={s.pricing_type === "per_sqft" ? `${rupee(s.rate)}/sq.ft.` : s.pricing_type === "free" ? "Complimentary" : "Fixed price"}
                    badge={s.pricing_type === "free" ? "FREE" : null}
                    selected={selected.includes(s.code)}
                    onClick={() => toggleService(s.code)}
                  />
                ))}
              </div>
            )}

            {step === 2 && (
              <>
                <ReqCard title="Built-up Area (ft)" subtitle="Plot dimensions on each side">
                  <div className="grid grid-cols-2 gap-3">
                    {["front", "back", "left", "right"].map((k) => (
                      <ReqField key={k} placeholder={`${k[0].toUpperCase() + k.slice(1)} side`} value={dims[k]} type="number" inputMode="numeric" testid={`req-dim-${k}`}
                        onChange={(v) => setDims({ ...dims, [k]: v })} />
                    ))}
                  </div>
                  {baseArea > 0 && (
                    <div className="mt-3 text-sm font-medium text-[var(--text-secondary)]" data-testid="req-base-area">
                      Calculated plot footprint: <span className="font-bold text-[var(--text-primary)]">≈ {baseArea.toLocaleString("en-IN")} sq.ft.</span>
                    </div>
                  )}
                </ReqCard>
                <ReqCard title="Add Your Storey" subtitle="Ground + additional floors">
                  <div className="bd-card-surface flex items-center justify-between rounded-xl px-3 py-2">
                    <button onClick={() => setStoreys((s) => Math.max(0, s - 1))} data-testid="req-storey-minus" className="bd-req-iconbtn w-9 h-9 grid place-items-center rounded-full"><ChevronDown className="w-4 h-4" /></button>
                    <span className="text-lg font-bold text-[var(--text-primary)]" data-testid="req-storey-val">G + {storeys}</span>
                    <button onClick={() => setStoreys((s) => Math.min(9, s + 1))} data-testid="req-storey-plus" className="bd-req-iconbtn w-9 h-9 grid place-items-center rounded-full"><ChevronUp className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto mt-3 hide-scrollbar pb-1" data-testid="req-floor-areas">
                    {Array.from({ length: storeys + 1 }).map((_, i) => (
                      <div key={i} className="shrink-0 w-[160px] bd-card-surface rounded-xl p-3">
                        <div className="text-xs text-[var(--text-secondary)] mb-1.5">{floorName(i)}{i === 0 && baseArea > 0 ? " · auto" : ""}</div>
                        <ReqField placeholder="Area sq.ft." type="number" inputMode="numeric" value={floors[i]?.area || ""} testid={`req-floor-area-${i}`} onChange={(v) => { if (i === 0) autoGfRef.current = null; updFloor(i, { area: v }); }} />
                        {incompleteFloors.includes(i) && (
                          <div className="mt-1.5 text-[11px] font-medium" style={{ color: "var(--status-warning)" }} data-testid={`req-floor-error-${i}`}>Enter built-up area for this floor.</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm font-semibold text-[var(--text-primary)]" data-testid="req-total-area">Total Built-up Area: <span className="text-[var(--text-primary)]">{totalArea.toLocaleString("en-IN")} sq.ft.</span></div>
                </ReqCard>
                <ReqCard title="Project Name">
                  <ReqField placeholder="e.g. Sharma Residence" value={projectName} testid="req-project-name" onChange={setProjectName} />
                </ReqCard>
                <ReqCard title="Upload Files" subtitle="Optional — plans, CAD, references">
                  <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border border-dashed cursor-pointer text-[var(--text-secondary)]" style={{ borderColor: "var(--border-strong)" }}>
                    <Upload className="w-5 h-5" /><span className="text-xs">Upload plan, CAD, PDF, images & videos</span>
                    <input type="file" multiple className="hidden" data-testid="req-file-input" onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files).map((f) => ({ name: f.name, size: f.size }))])} />
                  </label>
                  {files.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{files.map((f, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bd-card-surface flex items-center gap-1.5 text-[var(--text-primary)]">{f.name}<button onClick={() => setFiles((p) => p.filter((_, k) => k !== i))}><X className="w-3 h-3" /></button></span>
                  ))}</div>}
                </ReqCard>
              </>
            )}

            {step === 3 && (
              !showAddrPicker ? (
                <>
                  <ReqCard title="Select your location" right={<button onClick={() => setShowAddrPicker(true)} data-testid="req-change-location" className="text-sm font-semibold text-[var(--text-primary)] underline underline-offset-4 decoration-[var(--border-strong)]">Change →</button>}>
                    {address ? (
                      <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" /><div className="text-sm font-semibold text-[var(--text-primary)]">{address.label}</div></div>
                    ) : <div className="text-sm text-[var(--text-secondary)]">No location selected yet.</div>}
                    {serviceable !== null && (
                      <div className={`mt-3 text-xs font-semibold px-2.5 py-1.5 rounded-lg inline-block`} style={{ background: "var(--surface-secondary)", border: "1px solid var(--border-primary)", color: serviceable ? "var(--status-success)" : "var(--status-warning)" }}>
                        {serviceable ? "Construction Available" : "Construction Not Available Yet — architecture continues"}
                      </div>
                    )}
                  </ReqCard>
                </>
              ) : (
                <div data-testid="req-address-picker">
                  <button onClick={() => setShowAddrPicker(false)} className="flex items-center gap-2 text-sm mb-3 text-[var(--text-primary)]"><ArrowLeft className="w-4 h-4" /> Back</button>
                  <div className="space-y-2">
                    {serviceAreas.map((a) => (
                      <button key={a.id} data-testid={`req-area-${a.id}`} onClick={() => { setAddress(a); setServiceable(true); setShowAddrPicker(false); }}
                        className="bd-req-pick w-full flex items-start gap-3 p-3.5 rounded-xl text-left">
                        <MapPin className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" /><div className="text-sm font-semibold text-[var(--text-primary)]">{a.label}</div>
                      </button>
                    ))}
                    <button data-testid="req-area-other" onClick={() => { setAddress({ label: "Other location" }); setServiceable(false); setShowAddrPicker(false); }}
                      className="w-full p-3.5 rounded-xl border border-dashed text-sm text-[var(--text-secondary)]" style={{ borderColor: "var(--border-strong)" }}>My area isn't listed (architecture still available)</button>
                  </div>
                </div>
              )
            )}

            {step === 4 && (
              <>
                <ReqCard title="Do you also need turnkey construction?">
                  <ReqSegmented options={["Yes", "No", "Maybe Later"]} value={construction.need} onChange={(v) => setConstruction({ ...construction, need: v })} testid="req-construction-need" />
                </ReqCard>
                <ReqCard title="Plan as per standard Vastu?">
                  <ReqSegmented options={["Yes", "No"]} value={construction.vastu} onChange={(v) => setConstruction({ ...construction, vastu: v })} testid="req-vastu" />
                </ReqCard>
                <ReqCard title="Front facing">
                  <div className="grid grid-cols-2 gap-2.5">{FACINGS.map((f) => (
                    <button key={f} data-testid={`req-facing-${f}`} onClick={() => setConstruction({ ...construction, facing: f })} className={`bd-req-seg ${construction.facing === f ? "bd-req-seg--on" : ""} text-sm font-semibold min-h-[52px] px-3 rounded-xl`}>{f}</button>
                  ))}</div>
                </ReqCard>
                <ReqCounter label="Family Members" value={construction.family} onChange={(v) => setConstruction({ ...construction, family: v })} testid="req-family" />
                <ReqCounter label="Bike Parking" value={construction.bike} onChange={(v) => setConstruction({ ...construction, bike: v })} testid="req-bike" />
                <ReqCounter label="Car Parking" value={construction.car} onChange={(v) => setConstruction({ ...construction, car: v })} testid="req-car" />
              </>
            )}

            {step === 5 && (
              <>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1" data-testid="req-floor-tabs">
                  {Array.from({ length: storeys + 1 }).map((_, i) => (
                    <button key={i} data-testid={`req-floor-tab-${i}`} onClick={() => setActiveFloor(i)} className={`bd-req-seg ${activeFloor === i ? "bd-req-seg--on" : ""} shrink-0 px-4 py-2 rounded-full text-xs font-semibold`}>{floorName(i)}</button>
                  ))}
                </div>
                <ReqCard title="Purpose of this floor">
                  <div className="grid grid-cols-2 gap-2.5" data-testid="req-purpose">
                    {PURPOSES.map((p) => (
                      <button key={p} data-testid={`req-purpose-${p.replace(/\s+/g, "-").toLowerCase()}`} onClick={() => updFloor(activeFloor, { purpose: p })} className={`bd-req-seg ${floors[activeFloor]?.purpose === p ? "bd-req-seg--on" : ""} min-h-[54px] px-3 rounded-xl text-sm font-semibold`}>{p}</button>
                    ))}
                  </div>
                </ReqCard>
                <ReqCounter label="Bedrooms" value={floors[activeFloor]?.bedrooms || 0} onChange={(v) => updFloor(activeFloor, { bedrooms: v })} testid="req-bedrooms" />
                <ReqCounter label="Master Bedrooms" value={floors[activeFloor]?.masterBedrooms || 0} onChange={(v) => updFloor(activeFloor, { masterBedrooms: v })} testid="req-master" />
                <ReqCard title="Indoor Amenities"><ReqChips items={INDOOR} selected={floors[activeFloor]?.indoor || []} onToggle={(v) => toggleFloorItem(activeFloor, "indoor", v)} /></ReqCard>
                <ReqCard title="Outdoor Amenities"><ReqChips items={OUTDOOR} selected={floors[activeFloor]?.outdoor || []} onToggle={(v) => toggleFloorItem(activeFloor, "outdoor", v)} /></ReqCard>
                <ReqCard title="Additional Information">
                  <div className="bd-req-field rounded-xl px-3.5 py-2">
                    <textarea data-testid="req-floor-notes" value={floors[activeFloor]?.notes || ""} onChange={(e) => updFloor(activeFloor, { notes: e.target.value })} placeholder="Add any additional requirements for this floor…" rows={3}
                      className="w-full bg-transparent outline-none text-sm resize-none" />
                  </div>
                </ReqCard>
              </>
            )}

            {step === 6 && wantsElevation && (
              <>
                <ReqCard title="Select elevation style" subtitle="Choose the look that fits your vision">
                  <div className="grid grid-cols-2 gap-3">{ELEV_STYLES.map((s) => (
                    <ReqImageCard key={s} testid={`req-elev-style-${s}`} image={ELEV_IMAGES[s]} label={s.replace(" Design", "")} sublabel={`${s}`} selected={elevation.style === s} onClick={() => setElevation({ ...elevation, style: s })} />
                  ))}</div>
                </ReqCard>
                <ReqCard title="Select elevation views">
                  <ReqChips items={ELEV_VIEWS} selected={elevation.views} onToggle={(v) => setElevation({ ...elevation, views: elevation.views.includes(v) ? elevation.views.filter((x) => x !== v) : [...elevation.views, v] })} />
                </ReqCard>
              </>
            )}

            {step === 7 && (
              <div className="space-y-4" data-testid="req-summary">
                <ReqCard title="Floor-by-floor plan">
                  <div className="space-y-2.5">
                    {floors.slice(0, storeys + 1).map((f, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 py-2 border-b last:border-0" style={{ borderColor: "var(--border-divider)" }}>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">{floorName(i)}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">{f.purpose} · {f.area ? `${f.area} sq.ft.` : "—"} · {(f.bedrooms || 0)} BR</div>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] text-right max-w-[45%]">
                          {[...(f.indoor || []), ...(f.outdoor || [])].slice(0, 3).join(", ") || "No amenities"}
                          {([...(f.indoor || []), ...(f.outdoor || [])].length > 3) ? ` +${[...(f.indoor || []), ...(f.outdoor || [])].length - 3}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </ReqCard>
                {wantsElevation && elevation.style && (
                  <ReqCard title="Elevation">
                    <ReqRow k="Style" v={elevation.style} />
                    <ReqRow k="Views" v={elevation.views.join(", ") || "—"} />
                  </ReqCard>
                )}
                {/* Full price breakdown for mobile (right panel shows it on desktop) */}
                <div className="lg:hidden"><Summary /></div>
              </div>
            )}

            {step === 8 && (
              <div className="space-y-3" data-testid="req-registration">
                <GoogleAuthButton label="Continue with Google" testid="req-google-btn" onStart={() => { try { sessionStorage.setItem("bd_suppress_auth_redirect", "1"); } catch {} }} />
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]"><span className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />or continue with email<span className="flex-1 h-px" style={{ background: "var(--border-primary)" }} /></div>
                <ReqField placeholder="Full Name" value={reg.name} testid="req-reg-name" onChange={(v) => setReg({ ...reg, name: v })} />
                <ReqField placeholder="Mobile Number (10 digits)" value={reg.mobile} inputMode="numeric" testid="req-reg-mobile" onChange={(v) => setReg({ ...reg, mobile: v.replace(/[^\d]/g, "") })} />
                <ReqField placeholder="Email" type="email" value={reg.email} testid="req-reg-email" onChange={(v) => { setReg({ ...reg, email: v }); setEmailExists(false); }} icon={<Mail className="w-4 h-4" />} />
                <PasswordInput variant="req" placeholder="Password (min 6)" value={reg.password} testid="req-reg-password" autoComplete="new-password" onChange={(v) => setReg({ ...reg, password: v })} />
                <div>
                  <PasswordInput variant="req" placeholder="Confirm Password" value={reg.confirmPassword} testid="req-reg-confirm-password" autoComplete="new-password" onChange={(v) => setReg({ ...reg, confirmPassword: v })} />
                  {reg.confirmPassword.length > 0 && reg.password !== reg.confirmPassword && (
                    <p data-testid="req-password-mismatch" className="mt-1.5 text-xs font-medium" style={{ color: "var(--status-error)" }}>Passwords do not match.</p>
                  )}
                </div>
                {emailExists && (
                  <div className="rounded-xl px-3.5 py-3 space-y-2" style={{ background: "var(--surface-secondary)", border: "1px solid var(--border-primary)" }} data-testid="req-email-exists">
                    <p className="text-sm text-[var(--text-secondary)]">An account already exists with this email. Log in to continue — your project details are saved.</p>
                    <button data-testid="req-login-to-continue" onClick={loginToContinue} className="bd-req-cta rounded-full px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 w-full">
                      Login to Continue
                    </button>
                  </div>
                )}
                {/* mobile: show the create button inline too */}
                <div className="lg:hidden pt-1"><CtaButtons full /></div>
              </div>
            )}
          </div>

          {/* Mobile footer bar */}
          {step !== 8 && (
            step === 7 ? (
              <div className="lg:hidden shrink-0 border-t p-4" style={{ borderColor: "var(--border-divider)", background: "var(--background-secondary)" }}>
                <CtaButtons full />
              </div>
            ) : (
              <div className="lg:hidden shrink-0 border-t p-4 flex items-center justify-between gap-3" style={{ borderColor: "var(--border-divider)", background: "var(--background-secondary)" }}>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Est. Charges</div>
                  <div className="text-base font-bold bd-req-accent" data-testid="req-price-bar">{rupee(total)}</div>
                </div>
                <div className={secondary ? "flex-1" : ""}><CtaButtons /></div>
              </div>
            )
          )}
        </div>

        {/* RIGHT — live summary (desktop) */}
        <aside className="bd-req-summary hidden lg:flex lg:flex-col lg:w-[40%]">
          <div className="flex-1 overflow-y-auto p-7">
            <Summary compact={step !== 7} />
          </div>
          <div className="shrink-0 border-t p-6" style={{ borderColor: "var(--border-primary)" }}>
            <CtaButtons full />
            <p className="text-[11px] text-[var(--text-muted)] text-center mt-3">Free estimate · No obligation · Data saved securely</p>
          </div>
        </aside>
      </div>
    </div>
  );
  return createPortal(shell, document.body);
}
