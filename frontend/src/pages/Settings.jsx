import { useState } from "react";
import { Card } from "../components/Card";
import { searchLogs, clearCache, addLogs } from "../api/logApi";
import { generateLogs, chunk } from "../lib/logGenerator";
import {
  getDefaultPageSize,
  setDefaultPageSize,
  getDefaultRangeHours,
  setDefaultRangeHours,
} from "../lib/preferences";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const RANGE_OPTIONS = [
  [24, "Last 24 hours"],
  [168, "Last 7 days"],
  [720, "Last 30 days"],
  [2160, "Last 90 days"],
  [43800, "All time"],
];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function Settings() {
  const [pageSize, setPageSize] = useState(getDefaultPageSize());
  const [rangeHours, setRangeHours] = useState(getDefaultRangeHours());
  const [saved, setSaved] = useState(false);

  const [connection, setConnection] = useState({ state: "idle" }); // idle | checking | ok | error
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const [bulkCount, setBulkCount] = useState(1000);
  const [generatingOne, setGeneratingOne] = useState(false);
  const [generatingBulk, setGeneratingBulk] = useState(false);
  const [genProgress, setGenProgress] = useState(null); // { sent, total }
  const [genMessage, setGenMessage] = useState(null);

  async function handleGenerateOne() {
    setGeneratingOne(true);
    setGenMessage(null);
    try {
      const [log] = generateLogs(1, { incidentCount: 0 });
      await addLogs([log]);
      setGenMessage("Generated 1 log");
      setTimeout(() => setGenMessage(null), 2500);
    } catch (err) {
      alert(`Failed to generate log: ${err.message}`);
    } finally {
      setGeneratingOne(false);
    }
  }

  async function handleGenerateBulk() {
    setGeneratingBulk(true);
    setGenMessage(null);
    try {
      const logs = generateLogs(bulkCount);
      const batches = chunk(logs, 200);
      let sent = 0;
      setGenProgress({ sent, total: logs.length });

      for (const batch of batches) {
        await addLogs(batch);
        sent += batch.length;
        setGenProgress({ sent, total: logs.length });
      }

      setGenMessage(`Generated ${logs.length} logs`);
      setTimeout(() => setGenMessage(null), 2500);
    } catch (err) {
      alert(`Bulk generation failed: ${err.message}`);
    } finally {
      setGeneratingBulk(false);
      setGenProgress(null);
    }
  }

  async function handleClearCache() {
    setClearing(true);
    try {
      await clearCache();
      setCleared(true);
      setTimeout(() => setCleared(false), 2500);
    } catch (err) {
      alert(`Failed to clear cache: ${err.message}`);
    } finally {
      setClearing(false);
    }
  }

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
      setConnection({
        state: "ok",
        latency: Math.round(performance.now() - start),
      });
    } catch (err) {
      setConnection({ state: "error", message: err.message });
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Connection status and local preferences
          </p>
        </div>
      </div>

      {/* connection */}
      <Card>
        <span className="card-label">Backend Connection</span>
        <div className="settings-row">
          <span className="mono-muted">{API_BASE_URL}</span>
          <button
            className="btn"
            onClick={handleTestConnection}
            disabled={connection.state === "checking"}
          >
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

      {/* cache */}
      <Card>
        <span className="card-label">Cache</span>
        <p
          className="mono-muted"
          style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}
        >
          Clear this if data was changed directly in the database (e.g. a
          seeding script) — those changes don't trigger automatic cache
          eviction.
        </p>
        <div className="metrics-row">
          <button
            className="btn btn-warn"
            onClick={handleClearCache}
            disabled={clearing}
          >
            {clearing ? "Clearing…" : "Clear Cache"}
          </button>
          {cleared && (
            <span className="state-message success" style={{ padding: 0 }}>
              Cache cleared
            </span>
          )}
        </div>
      </Card>

      {/* sample data */}
      <Card>
        <span className="card-label">Sample Data</span>
        <p
          className="mono-muted"
          style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}
        >
          Populate the database with realistic sample logs for testing the
          dashboard and analytics.
        </p>

        <div className="metrics-row">
          <button
            className="btn"
            onClick={handleGenerateOne}
            disabled={generatingOne || generatingBulk}
          >
            {generatingOne ? "Generating…" : "Generate 1 Log"}
          </button>
        </div>

        <div className="metrics-row" style={{ marginTop: "0.75rem" }}>
          <input
            type="number"
            min="10"
            max="50000"
            step="10"
            value={bulkCount}
            onChange={(e) => setBulkCount(Number(e.target.value))}
            className="bulk-count-input"
            disabled={generatingBulk}
          />
          <button
            className="btn btn-primary"
            onClick={handleGenerateBulk}
            disabled={generatingOne || generatingBulk}
          >
            {generatingBulk ? "Generating…" : "Generate Bulk Logs"}
          </button>
        </div>

        {genProgress && (
          <p className="mono-muted" style={{ marginTop: "0.5rem" }}>
            Sent {genProgress.sent} / {genProgress.total}
          </p>
        )}
        {genMessage && (
          <span
            className="state-message success"
            style={{ padding: 0, display: "block", marginTop: "0.5rem" }}
          >
            {genMessage}
          </span>
        )}
      </Card>

      {/* preferences */}
      <Card>
        <span className="card-label">Preferences</span>
        <form className="filter-grid" onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="pageSize">Default page size (Search Logs)</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="rangeHours">Default time range (Dashboard)</label>
            <select
              id="rangeHours"
              value={rangeHours}
              onChange={(e) => setRangeHours(Number(e.target.value))}
            >
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
            {saved && (
              <span className="state-message success" style={{ padding: 0 }}>
                Saved
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* about */}
      <Card>
        <span className="card-label">About</span>
        <p
          className="mono-muted"
          style={{ marginTop: "0.75rem", lineHeight: 1.6 }}
        >
          Log Analytics Platform — Spring Boot · PostgreSQL · Redis · React
        </p>
      </Card>
    </>
  );
}
