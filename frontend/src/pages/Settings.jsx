import { useState } from "react";
import { Card } from "../components/Card";
import { searchLogs } from "../api/logApi";
import {
  getDefaultPageSize,
  setDefaultPageSize,
  getDefaultRangeHours,
  setDefaultRangeHours,
} from "../lib/preferences";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const RANGE_OPTIONS = [
  [24, "Last 24 hours"],
  [168, "Last 7 days"],
  [720, "Last 30 days"],
];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function Settings() {
  const [pageSize, setPageSize] = useState(getDefaultPageSize());
  const [rangeHours, setRangeHours] = useState(getDefaultRangeHours());
  const [saved, setSaved] = useState(false);

  const [connection, setConnection] = useState({ state: "idle" }); // idle | checking | ok | error

  function handleSave(e) {
    e.preventDefault();
    setDefaultPageSize(pageSize);
    setDefaultRangeHours(rangeHours);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleTestConnection() {
    setConnection({ state: "checking" });
    const start = performance.now();
    try {
      await searchLogs({ page: 0, size: 1 });
      setConnection({ state: "ok", latency: Math.round(performance.now() - start) });
    } catch (err) {
      setConnection({ state: "error", message: err.message });
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Connection status and local preferences</p>
        </div>
      </div>

      {/* connection */}
      <Card>
        <span className="card-label">Backend Connection</span>
        <div className="settings-row">
          <span className="mono-muted">{API_BASE_URL}</span>
          <button className="btn" onClick={handleTestConnection} disabled={connection.state === "checking"}>
            {connection.state === "checking" ? "Testing…" : "Test Connection"}
          </button>
        </div>

        {connection.state === "ok" && (
          <div className="status-row">
            <span className="status-dot status-dot--ok" />
            Connected — responded in {connection.latency}ms
          </div>
        )}
        {connection.state === "error" && (
          <div className="status-row">
            <span className="status-dot status-dot--error" />
            {connection.message || "Could not reach the backend"}
          </div>
        )}
      </Card>

      {/* preferences */}
      <Card>
        <span className="card-label">Preferences</span>
        <form className="filter-grid" onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="pageSize">Default page size (Search Logs)</label>
            <select id="pageSize" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="rangeHours">Default time range (Dashboard)</label>
            <select id="rangeHours" value={rangeHours} onChange={(e) => setRangeHours(Number(e.target.value))}>
              {RANGE_OPTIONS.map(([h, l]) => (
                <option key={h} value={h}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            {saved && <span className="state-message success" style={{ padding: 0 }}>Saved</span>}
          </div>
        </form>
      </Card>

      {/* about */}
      <Card>
        <span className="card-label">About</span>
        <p className="mono-muted" style={{ marginTop: "0.75rem", lineHeight: 1.6 }}>
          Log Analytics Platform — Spring Boot · PostgreSQL · Redis · React
        </p>
      </Card>
    </>
  );
}
