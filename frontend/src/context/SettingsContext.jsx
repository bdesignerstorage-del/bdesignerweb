import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const SettingsContext = createContext({
  settings: null,
  loading: true,
  reload: async () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings(data);
    } catch (e) {
      // swallow; UI falls back to defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Apply favicon + browser tab title when settings change
  useEffect(() => {
    if (!settings) return;
    if (settings.site_name) {
      const tagline = settings.tagline ? ` — ${settings.tagline}` : "";
      document.title = `${settings.site_name}${tagline}`;
    }
    if (settings.favicon) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, reload }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
