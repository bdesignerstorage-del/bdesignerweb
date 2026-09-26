import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X, ArrowLeft, ClipboardList, Check, ChevronDown, ChevronUp, Upload,
  MapPin, Plus, Minus, Loader2, Mail, Phone as PhoneIcon,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const LS_KEY = "bd_requirement_draft_v1";
const FACINGS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const PURPOSES = ["House Owner", "House Rent", "Parking", "Shop", "Storage"];
const INDOOR = ["Living Room","Temple","Kitchen","Double Height Lobby","Dining","Common Washroom","Office Area","Study Room","Kids Room","Store Room","Inside Lift","Inside Stair","Family Lounge","Drawing Room","Theatre","Gym","Walk-in Wardrobe","Bar Area","Balcony","Foyer","Wash Area","Family Room","Conference Room","Powder Room"];
const OUTDOOR = ["Garden","Outside Stair","Swimming Pool","Security Room","Compound Gate","Veranda / Sitout","Basement Room","Servant Room","Pet House","Bonfire"];
const ELEV_STYLES = ["Simple Design","Modern Design","Kerala Design","Classical Design"];
const ELEV_VIEWS = ["Front Design","Left Design","Right Design","Back Design"];

const rupee = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const emptyFloor = () => ({ area: "", purpose: "House Owner", bedrooms: 0, masterBedrooms: 0, indoor: [], outdoor: [], notes: "" });

function loadDraft() {
  try { const d = JSON.parse(localStorage.getItem(LS_KEY)); if (d) return d; } catch {}
  return null;
}

export default function RequirementForm({ onClose }) {
  const { register, user } = useAuth();
  const saved = loadDraft();
  const [step, setStep] = useState(saved?.step || 1);
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(saved?.selected || []);
  const [dims, setDims] = useState(saved?.dims || { front: "", back: "", left: "", right: "" });
  const [storeys, setStoreys] = useState(saved?.storeys ?? 0); // G+N -> N
  const [floors, setFloors] = useState(saved?.floors || [emptyFloor()]);
  const [projectName, setProjectName] = useState(saved?.projectName || "");
  const [files, setFiles] = useState(saved?.files || []);
  const [address, setAddress] = useState(saved?.address || null);
  const [showAddrPicker, setShowAddrPicker] = useState(false);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [serviceable, setServiceable] = useState(null);
  const [construction, setConstruction] = useState(saved?.construction || { need: "", vastu: "", facing: "", family: 0, bike: 0, car: 0 });
  const [activeFloor, setActiveFloor] = useState(0);
  const [elevation, setElevation] = useState(saved?.elevation || { style: "", views: [] });
  const [priceLines, setPriceLines] = useState([]);
  const [total, setTotal] = useState(0);
  const [reg, setReg] = useState({ name: "", mobile: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/requirement/services").then((r) => setServices(r.data.services || [])).catch(() => {});
    api.get("/requirement/serviceability").then((r) => setServiceAreas(r.data.areas || [])).catch(() => {});
  }, []);

  const totalArea = useMemo(() => {
    const floorCount = storeys + 1;
    return floors.slice(0, floorCount).reduce((s, f) => s + (parseFloat(f.area) || 0), 0);
  }, [floors, storeys]);

  const wantsElevation = useMemo(
    () => services.some((s) => s.triggers_elevation && selected.includes(s.code)),
    [services, selected]
  );

  // Live authoritative pricing
  useEffect(() => {
    if (!selected.length) { setPriceLines([]); setTotal(0); return; }
    const t = setTimeout(() => {
      api.post("/requirement/price", { service_codes: selected, total_area: totalArea })
        .then((r) => { setPriceLines(r.data.lines || []); setTotal(r.data.total || 0); })
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [selected, totalArea]);

  // Autosave
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ step, selected, dims, storeys, floors, projectName, files, address, construction, elevation }));
    } catch {}
  }, [step, selected, dims, storeys, floors, projectName, files, address, construction, elevation]);

  // Keep floors array length in sync with storeys
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
    base.push(7, 8);
    return base;
  }, [wantsElevation]);

  const goNext = () => {
    setErr("");
    const idx = STEPS.indexOf(step);
    if (step === 1 && selected.length === 0) return setErr("Select at least one service.");
    if (step === 2 && totalArea <= 0) return setErr("Enter built-up area for at least one floor.");
    if (step === 3 && !address) return setErr("Select your project location.");
    if (step === 4 && !construction.need) return setErr("Please tell us about construction interest.");
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

  const handleRegister = async () => {
    setErr(""); setSubmitting(true);
    try {
      const name = reg.name.trim(); const mobile = reg.mobile.replace(/\D/g, ""); const email = reg.email.trim();
      if (!name) throw new Error("Please enter your full name.");
      if (mobile.length < 10) throw new Error("Enter a valid 10-digit mobile number.");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email.");
      if (reg.password.length < 6) throw new Error("Password must be at least 6 characters.");
      if (!user?.id) await register(name, email, reg.password, mobile, "client");
      await submitLead({ name, mobile, email });
      try { localStorage.removeItem(LS_KEY); } catch {}
      toast.success("Account created — your project requirement is saved.");
      onClose?.();
    } catch (e) {
      setErr(e.response?.data?.detail || e.message || "Something went wrong.");
    } finally { setSubmitting(false); }
  };

  const STEP_META = {
    1: { title: "Select Architectural Services", help: "Choose the design services you need for your project." },
    2: { title: "Project Details", help: "Tell us your plot size, floors and project name." },
    3: { title: "Serviceability Check", help: "Confirm your location so we can check construction coverage." },
    4: { title: "Construction Requirement", help: "A few details to shape your design and build." },
    5: { title: "Specify Room Per Floor", help: "Set the rooms and amenities for each floor." },
    6: { title: "Select Elevation Details", help: "Pick the elevation style and views you like." },
    7: { title: "Project Summary", help: "Review your requirement and estimated charges." },
    8: { title: "Registration", help: "Create your account to save this project and continue." },
  };
  const meta = STEP_META[step];
  const showPriceBar = [2, 3, 4, 5, 6].includes(step);

  const shell = (
    <div className="fixed inset-0 z-[100000] flex items-stretch sm:items-center justify-center" data-testid="requirement-form" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-[var(--background-secondary,#111111)] text-[var(--text-primary,#F5F5F5)] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh] border border-[var(--border-primary,#292929)]">
        {/* Header */}
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-[var(--border-divider,#242424)]">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-[var(--background-elevated,#1A1A1A)] grid place-items-center border border-[var(--border-primary,#292929)]">
              <ClipboardList className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <div className="flex gap-2">
              {STEPS.indexOf(step) > 0 && (
                <button data-testid="req-back" onClick={goBack} aria-label="Back" className="w-9 h-9 grid place-items-center rounded-full bg-[var(--background-elevated,#1A1A1A)] border border-[var(--border-primary,#292929)] hover:opacity-80">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <button data-testid="req-close" onClick={onClose} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-full bg-[var(--background-elevated,#1A1A1A)] border border-[var(--border-primary,#292929)] hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C9A24A] mt-3">BDesigner</p>
          <h2 className="text-2xl font-bold mt-0.5" style={{ letterSpacing: "-0.02em" }} data-testid="req-step-title">{meta.title}</h2>
          <p className="text-sm text-[var(--text-secondary,#B5B5B5)] mt-1">{meta.help}</p>
          <div className="mt-3 flex gap-1">
            {STEPS.map((s) => (
              <span key={s} className={`h-1 flex-1 rounded-full ${STEPS.indexOf(step) >= STEPS.indexOf(s) ? "bg-[#C9A24A]" : "bg-[var(--border-primary,#292929)]"}`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {err && <div data-testid="req-error" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{err}</div>}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3" data-testid="req-services">
              {services.map((s) => {
                const on = selected.includes(s.code);
                return (
                  <button key={s.code} type="button" data-testid={`req-service-${s.code}`} onClick={() => toggleService(s.code)}
                    className={`relative text-left rounded-2xl overflow-hidden border transition ${on ? "border-[#C9A24A]" : "border-[var(--border-primary,#292929)]"}`}>
                    <span className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full grid place-items-center ${on ? "bg-[#C9A24A] text-black" : "bg-black/50 text-white/70 border border-white/30"}`}><Check className="w-3.5 h-3.5" /></span>
                    {s.pricing_type === "free" && <span className="absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded bg-[#C9A24A] text-black">FREE</span>}
                    <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${s.image})` }} />
                    <div className="p-2.5 bg-[var(--background-card,#151515)]"><div className="text-sm font-semibold leading-tight">{s.name}</div></div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <>
              <Card title="Built-up Area (ft)">
                <div className="grid grid-cols-2 gap-3">
                  {["front", "back", "left", "right"].map((k) => (
                    <Input key={k} placeholder={`${k[0].toUpperCase()+k.slice(1)} side`} value={dims[k]} type="number" testid={`req-dim-${k}`}
                      onChange={(v) => setDims({ ...dims, [k]: v })} />
                  ))}
                </div>
              </Card>
              <Card title="Add Your Storey">
                <div className="flex items-center justify-between gap-2 bg-[var(--background-elevated,#1A1A1A)] rounded-xl px-3 py-2 border border-[var(--border-primary,#292929)]">
                  <button onClick={() => setStoreys((s) => Math.max(0, s - 1))} data-testid="req-storey-minus" className="w-9 h-9 grid place-items-center rounded-full border border-[var(--border-primary,#292929)]"><ChevronDown className="w-4 h-4" /></button>
                  <span className="text-lg font-bold" data-testid="req-storey-val">G + {storeys}</span>
                  <button onClick={() => setStoreys((s) => Math.min(9, s + 1))} data-testid="req-storey-plus" className="w-9 h-9 grid place-items-center rounded-full border border-[var(--border-primary,#292929)]"><ChevronUp className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-3 overflow-x-auto mt-3 hide-scrollbar" data-testid="req-floor-areas">
                  {Array.from({ length: storeys + 1 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-[150px] rounded-xl border border-[var(--border-primary,#292929)] bg-[var(--background-card,#151515)] p-3">
                      <div className="text-xs text-[var(--text-secondary,#B5B5B5)] mb-1">{floorName(i)}</div>
                      <Input placeholder="Area sq.ft." type="number" value={floors[i]?.area || ""} testid={`req-floor-area-${i}`} onChange={(v) => updFloor(i, { area: v })} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm font-semibold" data-testid="req-total-area">Total Built-up Area: {totalArea.toLocaleString("en-IN")} sq.ft.</div>
              </Card>
              <Card title="Project Name">
                <Input placeholder="Enter Project Name" value={projectName} testid="req-project-name" onChange={setProjectName} />
              </Card>
              <Card title="Upload Files">
                <label className="flex flex-col items-center justify-center gap-2 py-5 rounded-xl border border-dashed border-[var(--border-primary,#292929)] cursor-pointer text-[var(--text-secondary,#B5B5B5)]">
                  <Upload className="w-5 h-5" /><span className="text-xs">Upload plan, CAD, PDF, images & videos</span>
                  <input type="file" multiple className="hidden" data-testid="req-file-input" onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files).map((f) => ({ name: f.name, size: f.size }))])} />
                </label>
                {files.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{files.map((f, i) => (
                  <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-[var(--background-elevated,#1A1A1A)] border border-[var(--border-primary,#292929)] flex items-center gap-1">{f.name}<button onClick={() => setFiles((p) => p.filter((_, k) => k !== i))}><X className="w-3 h-3" /></button></span>
                ))}</div>}
              </Card>
            </>
          )}

          {step === 3 && (
            !showAddrPicker ? (
              <>
                <div className="rounded-2xl overflow-hidden border border-[var(--border-primary,#292929)] aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=70)" }} />
                <Card title="Select your location" right={<button onClick={() => setShowAddrPicker(true)} data-testid="req-change-location" className="text-sm text-[#C9A24A]">Change →</button>}>
                  {address ? (
                    <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[#C9A24A] mt-0.5" /><div><div className="text-sm font-semibold">{address.label}</div></div></div>
                  ) : <div className="text-sm text-[var(--text-secondary,#B5B5B5)]">No location selected yet.</div>}
                  {serviceable !== null && (
                    <div className={`mt-3 text-xs font-semibold px-2.5 py-1.5 rounded-lg inline-block ${serviceable ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`} data-testid="req-serviceability">
                      {serviceable ? "Construction Available" : "Construction Not Available Yet — architecture continues"}
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <div data-testid="req-address-picker">
                <button onClick={() => setShowAddrPicker(false)} className="flex items-center gap-2 text-sm mb-3"><ArrowLeft className="w-4 h-4" /> Back to map</button>
                <div className="space-y-2">
                  {serviceAreas.map((a) => (
                    <button key={a.id} data-testid={`req-area-${a.id}`} onClick={() => { setAddress(a); setServiceable(true); setShowAddrPicker(false); }}
                      className="w-full flex items-start gap-3 p-3 rounded-xl border border-[var(--border-primary,#292929)] hover:border-[#C9A24A] text-left">
                      <MapPin className="w-4 h-4 text-[#C9A24A] mt-0.5" /><div className="text-sm font-semibold">{a.label}</div>
                    </button>
                  ))}
                  <button data-testid="req-area-other" onClick={() => { setAddress({ label: "Other location" }); setServiceable(false); setShowAddrPicker(false); }}
                    className="w-full p-3 rounded-xl border border-dashed border-[var(--border-primary,#292929)] text-sm text-[var(--text-secondary,#B5B5B5)]">My area isn't listed (architecture still available)</button>
                </div>
              </div>
            )
          )}

          {step === 4 && (
            <>
              <Card title="Do you also need turnkey construction?">
                <Segmented options={["Yes", "No", "Maybe Later"]} value={construction.need} onChange={(v) => setConstruction({ ...construction, need: v })} testid="req-construction-need" />
              </Card>
              <Card title="Plan needs as per standard Vastu?">
                <Segmented options={["Yes", "No"]} value={construction.vastu} onChange={(v) => setConstruction({ ...construction, vastu: v })} testid="req-vastu" />
              </Card>
              <Card title="Front facing">
                <div className="grid grid-cols-4 gap-2">{FACINGS.map((f) => (
                  <button key={f} data-testid={`req-facing-${f}`} onClick={() => setConstruction({ ...construction, facing: f })} className={`text-xs py-2 rounded-lg border ${construction.facing === f ? "border-[#C9A24A] text-[#C9A24A]" : "border-[var(--border-primary,#292929)]"}`}>{f}</button>
                ))}</div>
              </Card>
              <Counter label="Family Members" value={construction.family} onChange={(v) => setConstruction({ ...construction, family: v })} testid="req-family" />
              <Counter label="Bike Parking" value={construction.bike} onChange={(v) => setConstruction({ ...construction, bike: v })} testid="req-bike" />
              <Counter label="Car Parking" value={construction.car} onChange={(v) => setConstruction({ ...construction, car: v })} testid="req-car" />
            </>
          )}

          {step === 5 && (
            <>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar" data-testid="req-floor-tabs">
                {Array.from({ length: storeys + 1 }).map((_, i) => (
                  <button key={i} data-testid={`req-floor-tab-${i}`} onClick={() => setActiveFloor(i)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${activeFloor === i ? "bg-[#C9A24A] text-black border-[#C9A24A]" : "border-[var(--border-primary,#292929)]"}`}>{floorName(i)}</button>
                ))}
              </div>
              <Card title="Select the Purpose">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar" data-testid="req-purpose">
                  {PURPOSES.map((p) => (
                    <button key={p} onClick={() => updFloor(activeFloor, { purpose: p })} className={`shrink-0 px-3 py-2 rounded-xl text-xs border ${floors[activeFloor]?.purpose === p ? "border-[#C9A24A] text-[#C9A24A]" : "border-[var(--border-primary,#292929)]"}`}>{p}</button>
                  ))}
                </div>
              </Card>
              <Counter label="Bedrooms" value={floors[activeFloor]?.bedrooms || 0} onChange={(v) => updFloor(activeFloor, { bedrooms: v })} testid="req-bedrooms" />
              <Counter label="Master Bedrooms" value={floors[activeFloor]?.masterBedrooms || 0} onChange={(v) => updFloor(activeFloor, { masterBedrooms: v })} testid="req-master" />
              <Card title="Indoor Amenities"><Chips items={INDOOR} selected={floors[activeFloor]?.indoor || []} onToggle={(v) => toggleFloorItem(activeFloor, "indoor", v)} /></Card>
              <Card title="Outdoor Amenities"><Chips items={OUTDOOR} selected={floors[activeFloor]?.outdoor || []} onToggle={(v) => toggleFloorItem(activeFloor, "outdoor", v)} /></Card>
              <Card title="Additional Information">
                <textarea data-testid="req-floor-notes" value={floors[activeFloor]?.notes || ""} onChange={(e) => updFloor(activeFloor, { notes: e.target.value })} placeholder="Add any additional requirements for this floor…" rows={3}
                  className="w-full bg-[var(--background-elevated,#1A1A1A)] border border-[var(--border-primary,#292929)] rounded-xl p-3 text-sm" />
              </Card>
            </>
          )}

          {step === 6 && wantsElevation && (
            <>
              <Card title="Select elevation type">
                <div className="grid grid-cols-2 gap-3">{ELEV_STYLES.map((s) => (
                  <button key={s} data-testid={`req-elev-style-${s}`} onClick={() => setElevation({ ...elevation, style: s })} className={`p-3 rounded-xl border text-sm ${elevation.style === s ? "border-[#C9A24A] text-[#C9A24A]" : "border-[var(--border-primary,#292929)]"}`}>{s}</button>
                ))}</div>
              </Card>
              <Card title="Select elevation views">
                <Chips items={ELEV_VIEWS} selected={elevation.views} onToggle={(v) => setElevation({ ...elevation, views: elevation.views.includes(v) ? elevation.views.filter((x) => x !== v) : [...elevation.views, v] })} />
              </Card>
            </>
          )}

          {step === 7 && (
            <div data-testid="req-summary">
              <Card title={projectName || "My Dream Home"}>
                <Row k="Location" v={address?.label || "—"} />
                <Row k="Floors" v={`G + ${storeys}`} />
                <Row k="Total Built-up Area" v={`${totalArea.toLocaleString("en-IN")} sq.ft.`} />
                <Row k="Construction Interest" v={construction.need || "—"} />
              </Card>
              <Card title="Architectural charges">
                {priceLines.map((l) => (
                  <div key={l.code} className="flex items-center justify-between py-1.5 border-b border-[var(--border-divider,#242424)] last:border-0">
                    <div className="text-sm"><div className="font-medium">{l.name}</div><div className="text-[11px] text-[var(--text-secondary,#B5B5B5)]">{l.pricing_type === "free" ? "Included FREE" : l.pricing_type === "per_sqft" ? `${rupee(l.rate)}/sq.ft. × ${l.applicable_area.toLocaleString("en-IN")} sq.ft.` : "Fixed"}</div></div>
                    <div className="text-sm font-semibold">{rupee(l.amount)}</div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-[var(--border-primary,#292929)]">
                  <span className="font-bold">Total architectural estimate</span>
                  <span className="font-bold text-[#C9A24A]" data-testid="req-summary-total">{rupee(total)}</span>
                </div>
              </Card>
              <div className="flex gap-3">
                <button data-testid="req-edit" onClick={() => setStep(1)} className="flex-1 py-3 rounded-full border border-[var(--border-primary,#292929)] font-semibold text-sm">Edit Requirement</button>
                <button data-testid="req-continue-project" onClick={() => setStep(8)} className="flex-1 py-3 rounded-full bg-[#C9A24A] text-black font-bold text-sm">Continue With This Project</button>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-3" data-testid="req-registration">
              <button disabled className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border-primary,#292929)] text-[var(--text-secondary,#B5B5B5)] opacity-60 cursor-not-allowed" title="Not configured">
                Continue with Google
              </button>
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary,#B5B5B5)]"><span className="flex-1 h-px bg-[var(--border-primary,#292929)]" />or continue with email<span className="flex-1 h-px bg-[var(--border-primary,#292929)]" /></div>
              <Input placeholder="Full Name" value={reg.name} testid="req-reg-name" onChange={(v) => setReg({ ...reg, name: v })} />
              <Input placeholder="Mobile Number (10 digits)" value={reg.mobile} testid="req-reg-mobile" onChange={(v) => setReg({ ...reg, mobile: v.replace(/[^\d]/g, "") })} />
              <Input placeholder="Email" type="email" value={reg.email} testid="req-reg-email" onChange={(v) => setReg({ ...reg, email: v })} icon={<Mail className="w-4 h-4" />} />
              <Input placeholder="Password (min 6)" type="password" value={reg.password} testid="req-reg-password" onChange={(v) => setReg({ ...reg, password: v })} />
              <button disabled className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border-primary,#292929)] text-[var(--text-secondary,#B5B5B5)] opacity-60 cursor-not-allowed" data-testid="req-phone-disabled">
                <PhoneIcon className="w-4 h-4" /> Continue with Phone <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--border-primary,#292929)]">Coming Soon</span>
              </button>
              <button data-testid="req-create-account" disabled={submitting} onClick={handleRegister} className="w-full py-3 rounded-full bg-[#C9A24A] text-black font-bold flex items-center justify-center disabled:opacity-60">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              </button>
            </div>
          )}
        </div>

        {/* Sticky price bar / Continue */}
        <div className="shrink-0 border-t border-[var(--border-divider,#242424)] p-4">
          {showPriceBar && (
            <div className="flex items-center justify-between gap-3">
              <div><div className="text-[11px] text-[var(--text-secondary,#B5B5B5)]">Architectural Services</div><div className="text-sm font-bold text-[#C9A24A]" data-testid="req-price-bar">{rupee(total)}</div></div>
              <button data-testid="req-next" onClick={goNext} className="px-8 py-3 rounded-full bg-[#C9A24A] text-black font-bold text-sm">Next</button>
            </div>
          )}
          {step === 1 && <button data-testid="req-next" onClick={goNext} className="w-full py-3 rounded-full bg-[#C9A24A] text-black font-bold">Continue</button>}
        </div>
      </div>
    </div>
  );
  return createPortal(shell, document.body);
}

function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-[var(--border-primary,#292929)] bg-[var(--background-card,#151515)] p-4">
      <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold">{title}</h3>{right}</div>
      {children}
    </div>
  );
}
function Input({ placeholder, value, onChange, type = "text", testid, icon }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary,#B5B5B5)]">{icon}</span>}
      <input data-testid={testid} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[var(--background-elevated,#1A1A1A)] border border-[var(--border-primary,#292929)] rounded-xl py-2.5 text-sm ${icon ? "pl-9 pr-3" : "px-3"} focus:outline-none focus:border-[#C9A24A]`} />
    </div>
  );
}
function Segmented({ options, value, onChange, testid }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length},1fr)` }} data-testid={testid}>
      {options.map((o) => (
        <button key={o} data-testid={`${testid}-${o.replace(/\s+/g, "-").toLowerCase()}`} onClick={() => onChange(o)} className={`py-2 rounded-lg text-sm border ${value === o ? "bg-[#C9A24A] text-black border-[#C9A24A]" : "border-[var(--border-primary,#292929)]"}`}>{o}</button>
      ))}
    </div>
  );
}
function Counter({ label, value, onChange, testid }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border-primary,#292929)] bg-[var(--background-card,#151515)] px-4 py-3" data-testid={testid}>
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(0, value - 1))} data-testid={`${testid}-minus`} className="w-8 h-8 grid place-items-center rounded-full border border-[var(--border-primary,#292929)]"><Minus className="w-4 h-4" /></button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button onClick={() => onChange(value + 1)} data-testid={`${testid}-plus`} className="w-8 h-8 grid place-items-center rounded-full border border-[var(--border-primary,#292929)]"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
function Chips({ items, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const on = selected.includes(it);
        return <button key={it} onClick={() => onToggle(it)} className={`text-xs px-3 py-1.5 rounded-full border ${on ? "bg-[#C9A24A] text-black border-[#C9A24A]" : "border-[var(--border-primary,#292929)]"}`}>{it}</button>;
      })}
    </div>
  );
}
function Row({ k, v }) {
  return <div className="flex items-center justify-between py-1.5 text-sm border-b border-[var(--border-divider,#242424)] last:border-0"><span className="text-[var(--text-secondary,#B5B5B5)]">{k}</span><span className="font-medium">{v}</span></div>;
}
