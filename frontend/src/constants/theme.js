// src/constants/theme.js

export const COLORS = {
  bg: "#0B0E14",
  surface: "#12161F",
  surfaceAlt: "#171C27",
  border: "#232935",
  text: "#E6E9EF",
  muted: "#838DA0",
  accent: "#35D0BA",
};

export const SEVERITY = {
  DEBUG: "#64748B",
  INFO: "#4F8DFD",
  WARNING: "#F5A524",
  ERROR: "#F5455C",
  FATAL: "#C81E67",
};

export const SEVERITY_ORDER = ["DEBUG", "INFO", "WARNING", "ERROR", "FATAL"];

// derive a pulse-strip color from an error rate — kept here since
// it's tightly coupled to the SEVERITY palette above
export function severityColorForRate(rate) {
  if (rate >= 15) return SEVERITY.FATAL;
  if (rate >= 8) return SEVERITY.ERROR;
  if (rate >= 4) return SEVERITY.WARNING;
  return COLORS.accent;
}

export const THEME_VARS = {
  "--color-bg": COLORS.bg,
  "--color-surface": COLORS.surface,
  "--color-surface-alt": COLORS.surfaceAlt,
  "--color-border": COLORS.border,
  "--color-text": COLORS.text,
  "--color-muted": COLORS.muted,
  "--color-accent": COLORS.accent,
  "--severity-debug": SEVERITY.DEBUG,
  "--severity-info": SEVERITY.INFO,
  "--severity-warning": SEVERITY.WARNING,
  "--severity-error": SEVERITY.ERROR,
  "--severity-fatal": SEVERITY.FATAL,
};