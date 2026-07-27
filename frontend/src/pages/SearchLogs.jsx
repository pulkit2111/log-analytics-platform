import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { SEVERITY_ORDER } from "../constants/theme";
import { Card } from "../components/Card";
import { SeverityBadge } from "../components/SeverityBadge";
import { CacheMetricsBadge } from "../components/CacheMetricsBadge";
import { searchLogsWithMetrics } from "../api/logApi";
import { getDefaultPageSize } from "../lib/preferences";

const EMPTY_FILTERS = {
  service: "",
  level: "",
  startTime: "",
  endTime: "",
  keyword: "",
};
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
  const [size, setSize] = useState(getDefaultPageSize());

  const [result, setResult] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [comparison, setComparison] = useState(null); // { cached, fresh } — populated by "Compare" button
  const [comparing, setComparing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized so this is only a new object reference when the filters/page/size
  // actually change — otherwise it'd be new every render, making the effect
  // below re-run every render regardless of whether anything real changed.
  const currentParams = useMemo(
    () => ({
      service: appliedFilters.service || undefined,
      level: appliedFilters.level || undefined,
      keyword: appliedFilters.keyword || undefined,
      startTime: toIsoOrUndefined(appliedFilters.startTime),
      endTime: toIsoOrUndefined(appliedFilters.endTime),
      page,
      size,
    }),
    [appliedFilters, page, size],
  );

  useEffect(() => {
    let cancelled = false;

    // Resetting these synchronously is necessary here: unlike the dashboard's
    // range picker, remounting this component on filter change would wipe out
    // draftFilters/page/size state that needs to persist. There's no
    // derive-only alternative for a "reset then refetch on param change"
    // pattern, so this is a deliberate, scoped exception to the lint rule.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setComparison(null);

    searchLogsWithMetrics(currentParams)
      .then(({ data, metrics }) => {
        if (cancelled) return;
        setResult(data);
        setMetrics(metrics);
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
  }, [currentParams]);

  // Runs the exact same query twice — once allowed to hit the cache,
  // once forced to bypass it — so you can see cached vs. uncached
  // timing for the identical query side by side.
  async function handleCompare() {
    setComparing(true);
    try {
      const cached = await searchLogsWithMetrics({
        ...currentParams,
        bypassCache: false,
      });
      const fresh = await searchLogsWithMetrics({
        ...currentParams,
        bypassCache: true,
      });
      setComparison({ cached: cached.metrics, fresh: fresh.metrics });
    } catch (err) {
      setError(err.message || "Comparison failed");
    } finally {
      setComparing(false);
    }
  }

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
            <select
              id="level"
              value={draftFilters.level}
              onChange={(e) => handleFieldChange("level", e.target.value)}
            >
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
              <Search
                size={14}
                style={{ marginRight: "0.375rem", verticalAlign: "-2px" }}
              />
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
        {error && (
          <div className="state-message error">Couldn't load logs: {error}</div>
        )}

        {!loading && !error && result && (
          <>
            <div className="metrics-row">
              <CacheMetricsBadge metrics={metrics} />
              <button
                className="btn"
                onClick={handleCompare}
                disabled={comparing}
              >
                {comparing ? "Comparing…" : "Compare cached vs. fresh"}
              </button>
            </div>

            {comparison && (
              <div className="compare-row">
                <CacheMetricsBadge metrics={comparison.cached} />
                <span className="mono-muted">vs</span>
                <CacheMetricsBadge metrics={comparison.fresh} />
              </div>
            )}

            <table className="results-table" style={{ marginTop: "0.75rem" }}>
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
                    <td className="mono-muted">
                      {new Date(log.timeStamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <span>
                Page {result.pageNumber + 1} of {Math.max(result.totalPages, 1)}{" "}
                — {result.totalElements.toLocaleString()} total logs
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
                <button
                  className="page-btn"
                  disabled={result.pageNumber === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </button>
                <button
                  className="page-btn"
                  disabled={result.last}
                  onClick={() => setPage((p) => p + 1)}
                >
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
