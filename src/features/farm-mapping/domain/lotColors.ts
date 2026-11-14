export const lotColors = [
  "#8DB255",
  "#59B7D9",
  "#7C6BB0",
  "#E07A3A",
  "#4FA3A0",
  "#D16BA5",
  "#C7B65A",
  "#3550E0",
] as const;

export function pickLotColor(lotNumber: number): string {
  return lotColors[(lotNumber - 1) % lotColors.length];
}
