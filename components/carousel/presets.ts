import type { TemplatePalette } from "./types";

export const PALETTE_PRESETS: Record<string, TemplatePalette> = {
  dark: {
    bg: "#020617",
    text: "#f8fafc",
    subtext: "#94a3b8",
    accent: "#8b5cf6",
    stroke: "#475569",
  },
  light: {
    bg: "#ffffff",
    text: "#0f172a",
    subtext: "#475569",
    accent: "#6366f1",
    stroke: "#e2e8f0",
  },
  pastel: {
    bg: "#fef6e4",
    text: "#001858",
    subtext: "#172c66",
    accent: "#f582ae",
    stroke: "#ffd803",
  },
};
