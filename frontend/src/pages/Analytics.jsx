import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { COLORS, SEVERITY, SEVERITY_ORDER } from "../constants/theme";
import { Card } from "../components/Card";
import { ChartToolTip } from "../components/ChartToolTip";
import { useAnalyticsData } from "../hooks/useAnalyticsData";

const GRANULARITIES = ["hour", "day", "week", "month"];

// formats a Date as the local "YYYY-MM-DDTHH:mm" string datetime-local wants
function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 3600 * 1000);
  return { start: toLocalInputValue(start), end: toLocalInputValue(end) };
}

export default function Analytics() {
  const initial = defaultRange();
  const [granularity, setGranularity] = useState("hour");
  const [startInput, setStartInput] = useState(initial.start);
  const [endInput, setEndInput] = useState(initial.end);
  const [appliedParams, setAppliedParams] = useState({
    granularity: "hour",
    startTime: new Date(initial.start).toISOString(),
    endTime: new Date(initial.end).toISOString(),
  });

  const { data, loading, error } = useAnalyticsData(appliedParams);

  function handleApply(e) {
    e.preventDefault();
    setAppliedParams({
      granularity,
      startTime: new Date(startInput).toISOString(),
      endTime: new Date(endInput).toISOString(),
    });
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deeper trends across the full dataset</p>
        </div>
      </div>

      {/* controls */}
      <Card>
        <form className="filter-grid" onSubmit={handleApply}>
          <div className="field">
            <label htmlFor="granularity">Granularity</label>
            <select id="granularity" value={granularity} onChange={(e) => setGranularity(e.target.value)}>
              {GRANULARITIES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="start">Start time</label>
            <input id="start" type="datetime-local" value={startInput} onChange={(e) => setStartInput(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="end">End time</label>
            <input id="end" type="datetime-local" value={endInput} onChange={(e) => setEndInput(e.target.value)} />
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Apply
            </button>
          </div>
        </form>
      </Card>

      {loading && <div className="state-message">Loading analytics…</div>}
      {error && <div className="state-message error">Couldn't load analytics: {error}</div>}

      {!loading && !error && data && (
        <>
          {/* trend */}
          <Card>
            <span className="card-label">Volume &amp; Error Rate</span>
            <div className="chart-lg">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="analyticsVolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={COLORS.border} vertical={false} />
                  <XAxis
                    dataKey="bucket"
                    tickFormatter={(v) => new Date(v).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit" })}
                    tick={{ fill: COLORS.muted, fontSize: 11 }}
                    axisLine={{ stroke: COLORS.border }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartToolTip />} />
                  <Area type="monotone" dataKey="total" name="Logs" stroke={COLORS.accent} fill="url(#analyticsVolGrad)" strokeWidth={2} />
                  <Line type="monotone" dataKey="errors" name="Errors" stroke={SEVERITY.ERROR} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="charts-row">
            {/* severity donut */}
            <Card>
              <span className="card-label">Severity Distribution</span>
              <div className="chart-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.severityDistribution}
                      dataKey="count"
                      nameKey="level"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={2}
                    >
                      {data.severityDistribution.map((d) => (
                        <Cell key={d.level} fill={SEVERITY[d.level]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="chart-tooltip">
                            {payload[0].name}: {payload[0].value.toLocaleString()}
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pie-legend">
                {data.severityDistribution
                  .slice()
                  .sort((a, b) => SEVERITY_ORDER.indexOf(a.level) - SEVERITY_ORDER.indexOf(b.level))
                  .map((d) => (
                    <div key={d.level} className="pie-legend-item">
                      <span className="pie-swatch" style={{ backgroundColor: SEVERITY[d.level] }} />
                      <span className="mono-muted">{d.level}</span>
                      <span className="mono-muted" style={{ marginLeft: "auto" }}>
                        {d.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>

            {/* top services table */}
            <Card className="span-2">
              <span className="card-label">Top Services by Volume</span>
              <table className="results-table" style={{ marginTop: "0.75rem" }}>
                <thead>
                  <tr>
                    <th style={{ width: "48px" }}>#</th>
                    <th>Service</th>
                    <th style={{ width: "120px" }}>Logs</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topServices.map((s, i) => (
                    <tr key={s.serviceName}>
                      <td className="mono-muted">{i + 1}</td>
                      <td>{s.serviceName}</td>
                      <td className="mono-muted">{s.count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
