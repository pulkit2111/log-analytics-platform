import { COLORS } from "../constants/theme";
import { Card } from "./Card";

export function KpiCard({ label, value, unit, icon: Icon, tint }) {
  return (
    <Card className="kpi-card">
      <div className="kpi-card-header">
        <span className="card-label">{label}</span>
        <Icon size={16} strokeWidth={1.8} color={tint || COLORS.muted} />
      </div>
      <div className="kpi-value-row">
        <span className="kpi-value">{value}</span>
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
    </Card>
  );
}
