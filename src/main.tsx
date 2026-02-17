import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
    <Analytics />
    <SpeedInsights />
  </AuthProvider>
);
