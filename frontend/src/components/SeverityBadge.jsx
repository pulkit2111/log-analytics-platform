import { SEVERITY } from "../constants/theme";

export function SeverityBadge({ level }) {
  const color = SEVERITY[level];
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide"
      style={{
        color,
        backgroundColor: color + "1A",
        border: `1px solid ${color}40`,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {level}
    </span>
  );
}
