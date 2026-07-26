import { useState } from "react";
import "../Dashboard.css";
import {
  ResponsiveContainer,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Server,
  Gauge,
  ChevronDown,
} from "lucide-react";

import { COLORS, SEVERITY, SEVERITY_ORDER } from "../constants/theme";

import { Card } from "../components/Card";
import { PulseStrip } from "../components/PulseStrip";
import { KpiCard } from "../components/KpiCard";
import { SeverityBadge } from "../components/SeverityBadge";
import { BarTooltip } from "../components/BarToolTip";
import { ChartToolTip } from "../components/ChartToolTip";
import { useDashboardData } from "../hooks/useDashboardData";
import { getDefaultRangeHours } from "../lib/preferences";

export default function Dashboard() {
  const [rangeHours, setRangeHours] = useState(getDefaultRangeHours());
  const [rangeOpen, setRangeOpen] = useState(false);
  const { data, loading, error } = useDashboardData(rangeHours);

  const rangeLabel = {
    24: "Last 24 hours",
    168: "Last 7 days",
    720: "Last 30 days",
  }[rangeHours];

  if (loading) {
    return <div className="state-message">Loading dashboard…</div>;
  }

  if (error) {
    return (
      <div className="state-message error">
        Couldn't load dashboard data: {error}
        <br />
        Check that the backend is running at the configured API URL and that
        CORS is enabled.
      </div>
    );
  }

  const maxSeverityCount = Math.max(
    ...data.severityDistribution.map((d) => d.count),
    1,
  );

  return (
    <>
      {/* topbar */}
      <div className="topbar">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">
            Real-time ingestion across {data.topServices.length} services
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <button
            className="range-trigger"
            onClick={() => setRangeOpen((o) => !o)}
          >
            {rangeLabel}
            <ChevronDown size={14} color={COLORS.muted} />
          </button>
          {rangeOpen && (
            <div className="range-menu">
              {[
                [24, "Last 24 hours"],
                [168, "Last 7 days"],
                [720, "Last 30 days"],
              ].map(([h, l]) => (
                <div
                  key={h}
                  className={`range-menu-item${h === rangeHours ? " active" : ""}`}
                  onClick={() => {
                    setRangeHours(h);
                    setRangeOpen(false);
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* pulse strip */}
      <Card>
        <div className="pulse-header">
          <span className="card-label">Severity Pulse</span>
          <div className="legend">
            <span className="legend-item">
              <span className="legend-dot legend-dot--normal" /> normal
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--elevated" /> elevated
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--critical" /> critical
            </span>
          </div>
        </div>
        <PulseStrip trend={data.trend} />
      </Card>

      {/* KPIs */}
      <div className="kpi-grid">
        <KpiCard
          label="Total Logs"
          value={data.kpis.totalLogs.toLocaleString()}
          icon={Activity}
        />
        <KpiCard
          label="Error Rate"
          value={data.kpis.errorRate}
          unit="%"
          icon={AlertTriangle}
          tint={SEVERITY.ERROR}
        />
        <KpiCard
          label="Active Services"
          value={data.kpis.activeServices}
          icon={Server}
        />
        <KpiCard
          label="Avg Throughput"
          value={data.kpis.logsPerMin}
          unit="logs/min"
          icon={Gauge}
        />
      </div>

      {/* charts row */}
      <div className="charts-row">
        <Card className="span-2">
          <span className="card-label">Volume &amp; Error Rate</span>
          <div className="chart-md">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={COLORS.accent}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor={COLORS.accent}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={COLORS.border} vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleTimeString([], { hour: "2-digit" })
                  }
                  tick={{ fill: COLORS.muted, fontSize: 11 }}
                  axisLine={{ stroke: COLORS.border }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: COLORS.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartToolTip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Logs"
                  stroke={COLORS.accent}
                  fill="url(#volGrad)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  name="Errors"
                  stroke={SEVERITY.ERROR}
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <span className="card-label">Severity Distribution</span>
          <div className="severity-list">
            {data.severityDistribution
              .slice()
              .sort(
                (a, b) =>
                  SEVERITY_ORDER.indexOf(a.level) -
                  SEVERITY_ORDER.indexOf(b.level),
              )
              .map((d) => (
                <div key={d.level}>
                  <div className="severity-row-header">
                    <SeverityBadge level={d.level} />
                    <span className="mono-muted">
                      {d.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(d.count / maxSeverityCount) * 100}%`,
                        backgroundColor: SEVERITY[d.level],
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* top services + recent logs */}
      <div className="charts-row">
        <Card>
          <span className="card-label">Top Services by Errors</span>
          <div className="chart-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topServices}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="serviceName"
                  width={110}
                  tick={{ fill: COLORS.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: COLORS.surfaceAlt }}
                  content={<BarTooltip />}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.topServices.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? SEVERITY.ERROR : COLORS.accent}
                      fillOpacity={i === 0 ? 1 : 0.55}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="span-2">
          <span className="card-label">Recent Logs</span>
          <div style={{ marginTop: "0.75rem" }}>
            {data.recentLogs.map((log, i) => (
              <div key={i} className="log-row">
                <SeverityBadge level={log.level} />
                <span className="mono-muted log-service">
                  {log.serviceName}
                </span>
                <span className="log-message">{log.message}</span>
                <span className="mono-muted log-time">
                  {new Date(log.ts).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
