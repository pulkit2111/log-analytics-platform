export function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip">{payload[0].value} errors</div>;
}
