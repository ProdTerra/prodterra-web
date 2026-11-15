export type ExportCalendar = "farmer" | "recommended";

export type LotRiskSummary = { lotId: string; lotNumber: number; riskMonths: number; watchMonths: number };

export const maximumLotsPerPdf = 5;

function byRiskThenNumber(first: LotRiskSummary, second: LotRiskSummary): number {
  return second.riskMonths - first.riskMonths || second.watchMonths - first.watchMonths || first.lotNumber - second.lotNumber;
}

export function preselectLots(lots: LotRiskSummary[], calendar: ExportCalendar): string[] {
  const ordered = calendar === "recommended" && lots.length > maximumLotsPerPdf ? [...lots].sort(byRiskThenNumber) : lots;
  return ordered.slice(0, maximumLotsPerPdf).map((lot) => lot.lotId);
}

export function toggleLotSelection(selectedLotIds: string[], lotId: string): string[] {
  if (selectedLotIds.includes(lotId)) {
    return selectedLotIds.filter((selectedId) => selectedId !== lotId);
  }
  return selectedLotIds.length < maximumLotsPerPdf ? [...selectedLotIds, lotId] : selectedLotIds;
}

export function summarizeLotRisk(lot: { lotId: string; lotNumber: number }, statuses: ("ok" | "watch" | "risk")[]): LotRiskSummary {
  return {
    ...lot,
    riskMonths: statuses.filter((status) => status === "risk").length,
    watchMonths: statuses.filter((status) => status === "watch").length,
  };
}
