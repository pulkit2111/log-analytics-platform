import { Route, Routes } from "react-router-dom";
import "./Dashboard.css";
import Dashboard from "./pages/Dashboard.jsx";
import Sidebar from "./components/Sidebar";
import { THEME_VARS } from "./constants/theme";
import SearchLogs from "./pages/SearchLogs";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings.jsx";

function App() {
  return (
    <div className="dashboard" style={THEME_VARS}>
      <Sidebar />
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
