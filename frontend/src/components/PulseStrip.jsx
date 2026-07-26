import { severityColorForRate } from "../constants/theme";

export function PulseStrip({ trend }) {
  const maxTotal = Math.max(...trend.map((d) => d.total), 1);
  return (
    <div className="pulse-strip">
      {trend.map((d, i) => (
        <div
          key={i}
          title={`${new Date(d.bucket).toLocaleTimeString()} — ${d.total} logs, ${d.errorRate}% error rate`}
          className="pulse-bar"
          // height/background are inline — both computed from this bucket's data
          style={{
            height: `${Math.max(8, (d.total / maxTotal) * 100)}%`,
            backgroundColor: severityColorForRate(d.errorRate),
          }}
        />
      ))}
    </div>
  );
}
