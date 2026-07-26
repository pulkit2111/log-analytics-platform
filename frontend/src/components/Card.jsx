import { COLORS } from "../constants/theme";

export function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
