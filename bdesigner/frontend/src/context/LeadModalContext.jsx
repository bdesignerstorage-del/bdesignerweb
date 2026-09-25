import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import api from "@/lib/api";
import LeadModal from "@/components/home/LeadModal";

/**
 * (Fix 9) Central lead modal + shared cache of the admin-managed
 * service-area / main-area dropdowns. Every CTA on the site opens the
 * SAME modal, guaranteeing a single reusable component.
 *
 *   const { openLeadModal } = useLeadModal();
 *   openLeadModal({ source: "hero", title: "Get a free quote" });
 */
const LeadModalContext = createContext({
  openLeadModal: () => {},
  closeLeadModal: () => {},
  ensureCms: () => {},
  regions: [],
  mainAreas: [],
});

export function LeadModalProvider({ children }) {
  const [state, setState] = useState({ open: false, source: "unknown", title: "", subtitle: "" });
  const [regions, setRegions] = useState([]);
  const [mainAreas, setMainAreas] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load the CMS-managed regions + main areas ONCE per session, lazily on
  // first modal open, so we don't add an extra request on cold home load.
  const loadCms = useCallback(async () => {
    if (loaded) return;
    try {
      const { data } = await api.get("/homepage/sections");
      setRegions((data?.service_area_region || []).filter((r) => !r.hidden));
      setMainAreas((data?.service_area || []).filter((r) => !r.hidden));
    } catch { /* silent — modal degrades to free-text if fetch fails */ }
    finally { setLoaded(true); }
  }, [loaded]);

  const openLeadModal = useCallback((opts = {}) => {
    setState({
      open: true,
      source: opts.source || "unknown",
      title: opts.title || "Get Free Consultation",
      subtitle: opts.subtitle || "Share your details — our advisor will call you back in 30 minutes.",
      prefill: opts.prefill || null,
      estimate: opts.estimate || null,
      compact: opts.compact || false,
    });
    loadCms();
  }, [loadCms]);

  const closeLeadModal = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  // Body scroll lock + hide floating CTAs while the modal is open.
  useEffect(() => {
    if (!state.open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("lead-modal-open");
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("lead-modal-open");
    };
  }, [state.open]);

  const value = useMemo(() => ({
    openLeadModal, closeLeadModal, regions, mainAreas, ensureCms: loadCms,
  }), [openLeadModal, closeLeadModal, regions, mainAreas, loadCms]);

  return (
    <LeadModalContext.Provider value={value}>
      {children}
      <LeadModal
        open={state.open}
        source={state.source}
        title={state.title}
        subtitle={state.subtitle}
        prefill={state.prefill}
        estimate={state.estimate}
        compact={state.compact}
        regions={regions}
        mainAreas={mainAreas}
        onClose={closeLeadModal}
      />
    </LeadModalContext.Provider>
  );
}

export function useLeadModal() {
  return useContext(LeadModalContext);
}
