import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import '../Dashboard.css'

import { SEVERITY_ORDER } from "../constants/theme";
import { Card } from "../components/Card";
import { SeverityBadge } from "../components/SeverityBadge";
import { searchLogs } from "../api/logApi";

const EMPTY_FILTERS = { service: "", level: "", startTime: "", endTime: "", keyword: "" };
const PAGE_SIZE_OPTIONS = [10, 20, 50];

// datetime-local inputs give a value like "2026-07-26T14:30" with no
// timezone — treat it as local time and convert to a proper ISO
// instant string before it goes to the backend.
function toIsoOrUndefined(localDateTimeValue) {
  if (!localDateTimeValue) return undefined;
  return new Date(localDateTimeValue).toISOString();
}

export default function SearchLogs() {
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // setLoading(true);
    // setError(null);

    searchLogs({
      service: appliedFilters.service || undefined,
      level: appliedFilters.level || undefined,
      keyword: appliedFilters.keyword || undefined,
      startTime: toIsoOrUndefined(appliedFilters.startTime),
      endTime: toIsoOrUndefined(appliedFilters.endTime),
      page,
      size,
    })
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load logs");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, page, size]);

  function handleFieldChange(field, value) {
    setDraftFilters((f) => ({ ...f, [field]: value }));
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(0);
    setAppliedFilters(draftFilters);
  }

  function handleReset() {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(0);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Search Logs</h1>
          <p className="page-subtitle">Filter and page through ingested logs</p>
        </div>
      </div>

      {/* filter form */}
      <Card>
        <form className="filter-grid" onSubmit={handleSearch}>
          <div className="field">
            <label htmlFor="service">Service</label>
            <input
              id="service"
              type="text"
              placeholder="e.g. auth-service"
              value={draftFilters.service}
              onChange={(e) => handleFieldChange("service", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="level">Level</label>
            <select id="level" value={draftFilters.level} onChange={(e) => handleFieldChange("level", e.target.value)}>
              <option value="">Any</option>
              {SEVERITY_ORDER.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="startTime">Start time</label>
            <input
              id="startTime"
              type="datetime-local"
              value={draftFilters.startTime}
              onChange={(e) => handleFieldChange("startTime", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="endTime">End time</label>
            <input
              id="endTime"
              type="datetime-local"
              value={draftFilters.endTime}
              onChange={(e) => handleFieldChange("endTime", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="keyword">Keyword</label>
            <input
              id="keyword"
              type="text"
              placeholder="search message text"
              value={draftFilters.keyword}
              onChange={(e) => handleFieldChange("keyword", e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              <Search size={14} style={{ marginRight: "0.375rem", verticalAlign: "-2px" }} />
              Search
            </button>
            <button type="button" className="btn" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>
      </Card>

      {/* results */}
      <Card>
        {loading && <div className="state-message">Loading logs…</div>}
        {error && <div className="state-message error">Couldn't load logs: {error}</div>}

        {!loading && !error && result && (
          <>
            <table className="results-table">
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>Level</th>
                  <th style={{ width: "160px" }}>Service</th>
                  <th>Message</th>
                  <th style={{ width: "140px" }}>Source</th>
                  <th style={{ width: "160px" }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {result.content.length === 0 && (
                  <tr>
                    <td colSpan={5} className="state-message">
                      No logs match these filters.
                    </td>
                  </tr>
                )}
                {result.content.map((log) => (
                  <tr key={log.logId}>
                    <td>
                      <SeverityBadge level={log.logLevel} />
                    </td>
                    <td className="mono-muted">{log.serviceName}</td>
                    <td className="table-message-cell" title={log.message}>
                      {log.message}
                    </td>
                    <td className="mono-muted">{log.source}</td>
                    <td className="mono-muted">{new Date(log.timeStamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <span>
                Page {result.pageNumber + 1} of {Math.max(result.totalPages, 1)} — {result.totalElements.toLocaleString()} total logs
              </span>
              <div className="pagination-controls">
                <select
                  className="page-btn"
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
                <button className="page-btn" disabled={result.pageNumber === 0} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </button>
                <button className="page-btn" disabled={result.last} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
