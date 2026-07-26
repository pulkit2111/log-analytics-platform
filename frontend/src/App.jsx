import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import { THEME_VARS } from "./constants/theme";
import { Sidebar } from "lucide-react";

function App() {
  return (
    <div className="dashboard" style={THEME_VARS}>
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* <Route
              path="/search"
              element={<ComingSoon title="Search Logs" />}
            />
            <Route
              path="/analytics"
              element={<ComingSoon title="Analytics" />}
            />
            <Route path="/settings" element={<ComingSoon title="Settings" />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
