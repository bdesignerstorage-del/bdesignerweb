import React, { createContext, useContext, useState, useCallback } from "react";
import RequirementForm from "@/components/requirement/RequirementForm";

const Ctx = createContext({ openRequirement: () => {}, closeRequirement: () => {} });

export function RequirementFormProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openRequirement = useCallback((opts = {}) => {
    if (typeof window !== "undefined") window.__bd_req_source = opts.source || "plan-your-dream-home";
    setOpen(true);
  }, []);
  const closeRequirement = useCallback(() => setOpen(false), []);
  return (
    <Ctx.Provider value={{ openRequirement, closeRequirement }}>
      {children}
      {open ? <RequirementForm onClose={closeRequirement} /> : null}
    </Ctx.Provider>
  );
}

export function useRequirementForm() {
  return useContext(Ctx);
}
