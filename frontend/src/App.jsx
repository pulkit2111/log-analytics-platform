import { Route, Routes } from "react-router-dom";
import "./Dashboard.css";
import Dashboard from "./pages/Dashboard.jsx";
import Sidebar from "./components/Sidebar";
import { THEME_VARS } from "./constants/theme";
import SearchLogs from "./pages/SearchLogs";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings.jsx";
import { useState } from "react";
import { Menu } from "lucide-react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard" style={THEME_VARS}>
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label="Toggle navigation"
      >
        <Menu size={20} />
      </button>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<SearchLogs title="Search Logs" />} />
          {
            <Route
              path="/analytics"
              element={<Analytics title="Analytics" />}
            />
          }
          <Route path="/settings" element={<Settings title="Settings" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
