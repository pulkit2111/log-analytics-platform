import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { COLORS, SEVERITY } from "./constants/theme";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SearchLogs from "./pages/SearchLogs";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import "./dashboard.css";

// Bridges theme.js into CSS variables — see dashboard.css comments.
const THEME_VARS = {
  "--color-bg": COLORS.bg,
  "--color-surface": COLORS.surface,
  "--color-surface-alt": COLORS.surfaceAlt,
  "--color-border": COLORS.border,
  "--color-text": COLORS.text,
  "--color-muted": COLORS.muted,
  "--color-accent": COLORS.accent,
  "--severity-debug": SEVERITY.DEBUG,
  "--severity-info": SEVERITY.INFO,
  "--severity-warning": SEVERITY.WARNING,
  "--severity-error": SEVERITY.ERROR,
  "--severity-fatal": SEVERITY.FATAL,
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="dashboard" style={THEME_VARS}>
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<SearchLogs />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
