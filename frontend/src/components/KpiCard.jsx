import { COLORS } from "../constants/theme";
import { Card } from "./Card";

export function KpiCard({ label, value, unit, icon: Icon, tint }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span
          className="text-xs uppercase tracking-wider"
          style={{ color: COLORS.muted }}
        >
          {label}
        </span>
        <Icon
          size={16}
          strokeWidth={1.8}
          style={{ color: tint || COLORS.muted }}
        />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-2xl"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: COLORS.text,
          }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs" style={{ color: COLORS.muted }}>
            {unit}
          </span>
        )}
      </div>
    </Card>
  );
}
