import type { MonthStatus } from "@/features/calendar/infrastructure/plansApi";

export const pdfColors = {
  ink: "#161a15",
  stone: "#6b7066",
  faint: "#b5b9b0",
  line: "#d3d6ce",
  weekend: "#f1f2ee",
  paper: "#ffffff",
  field: "#1f4d2e",
  rest: "#8b8f86",
};

export const statusColors: Record<MonthStatus, string> = { ok: "#2f7d4a", watch: "#9a6f00", risk: "#c2463b" };

function channel(hexColor: string, index: number): number {
  return parseInt(hexColor.slice(1 + index * 2, 3 + index * 2), 16);
}

export function tintColor(hexColor: string, whiteShare: number): string {
  const mixed = [0, 1, 2].map((index) => Math.round(channel(hexColor, index) * (1 - whiteShare) + 255 * whiteShare));
  return `#${mixed.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}
