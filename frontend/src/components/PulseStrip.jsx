import { COLORS, SEVERITY } from "../constants/theme";

export function PulseStrip({ trend }) {
  const maxTotal = Math.max(...trend.map((d) => d.total));
  const colorFor = (rate) => {
    if (rate >= 15) return SEVERITY.FATAL;
    if (rate >= 8) return SEVERITY.ERROR;
    if (rate >= 4) return SEVERITY.WARNING;
    return COLORS.accent;
  };
  return (
    <div className="flex items-end gap-[3px] h-16">
      {trend.map((d, i) => (
        <div
          key={i}
          title={`${new Date(d.bucket).toLocaleTimeString()} — ${d.total} logs, ${d.errorRate}% error rate`}
          className="flex-1 rounded-sm transition-opacity hover:opacity-80"
          style={{
            height: `${Math.max(8, (d.total / maxTotal) * 100)}%`,
            backgroundColor: colorFor(d.errorRate),
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}
