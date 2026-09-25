import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { LeadModalProvider } from "@/context/LeadModalContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import ScrollToTop from "@/components/ScrollToTop";
import RouteProgress from "@/components/RouteProgress";
import BackButton from "@/components/BackButton";
import BDBackground from "@/components/bd/BDBackground";
import BDVideoBackground from "@/components/bd/BDVideoBackground";
import BDIntro from "@/components/bd/BDIntro";
import BDAudioPlayer from "@/components/bd/BDAudioPlayer";
import BDStickyCta from "@/components/bd/BDStickyCta";
import BDRouteTransition from "@/components/bd/BDRouteTransition";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import ProjectDetail from "@/pages/ProjectDetail";

function ChromeFrame({ children }) {
  const loc = useLocation();
  const [showIntro, setShowIntro] = React.useState(() => {
    try {
      if (typeof window !== "undefined" && /[?&]nointro=1/.test(window.location.search)) return false;
      return sessionStorage.getItem("bd_intro_seen") !== "1";
    } catch (e) {
      return true;
    }
  });
  const isHome = loc.pathname === "/";

  React.useEffect(() => {
    document.body.classList.add("bd-theme");
    document.body.classList.toggle("bd-route-home", isHome);
    return () => {
      document.body.classList.remove("bd-theme");
      document.body.classList.remove("bd-route-home");
    };
  }, [isHome]);

  return (
    <div className="bd-site">
      <BDBackground />
      {isHome ? <BDVideoBackground /> : null}
      {showIntro ? (
        <BDIntro
          onDone={() => {
            setShowIntro(false);
            try { sessionStorage.setItem("bd_intro_seen", "1"); } catch (e) { /* noop */ }
          }}
        />
      ) : null}
      <BDRouteTransition />
      <Navbar />
      <BackButton />
      <main className="min-h-[60vh]">
        <div key={loc.pathname} className="bd-page-fade">{children}</div>
      </main>
      <Footer />
      <BDAudioPlayer />
      <BDStickyCta />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <BrowserRouter>
        <ScrollToTop />
        <RouteProgress />
        <ThemeProvider>
          <SettingsProvider>
            <AuthProvider>
              <LeadModalProvider>
                <ChromeFrame>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />

                    {/* Keep auth entry URLs but render the existing homepage modal. */}
                    <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
                    <Route path="/register" element={<Navigate to="/?auth=register" replace />} />
                    <Route path="/forgot-password" element={<Navigate to="/?auth=login" replace />} />

                    {/* Legacy links from the preserved homepage/drawer/footer intentionally return home. */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ChromeFrame>
                <AuthModal />
                <Toaster position="bottom-center" theme="light" />
              </LeadModalProvider>
            </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
