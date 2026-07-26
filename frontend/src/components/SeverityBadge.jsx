import { SEVERITY } from "../constants/theme";

export function SeverityBadge({ level }) {
  const color = SEVERITY[level];
  return (
    <span
      className="severity-badge"
      style={{
        color,
        backgroundColor: color + "1A",
        border: `1px solid ${color}40`,
      }}
    >
      {level}
    </span>
  );
}
