import { COLORS } from "../constants/theme";

export function NavItem({ icon: Icon, label, active }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
      style={{
        color: active ? COLORS.text : COLORS.muted,
        backgroundColor: active ? COLORS.surfaceAlt : "transparent",
      }}
    >
      <Icon size={17} strokeWidth={1.8} />
      <span
        className="text-sm"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
}
