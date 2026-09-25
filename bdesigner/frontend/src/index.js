import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Prevent React dev overlay from surfacing transient axios "Network Error"
// rejections that bubble up from unhandled promises across the app.
// We still log them so genuine bugs are visible in the console.
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    const isAxiosNetworkError =
      reason &&
      (reason.isAxiosError === true ||
        reason.name === "AxiosError" ||
        reason.code === "ERR_NETWORK" ||
        reason.code === "ECONNABORTED" ||
        (typeof reason.message === "string" && reason.message === "Network Error"));
    if (isAxiosNetworkError) {
      console.warn("[suppressed unhandled axios rejection]", reason?.message || reason);
      event.preventDefault();
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
