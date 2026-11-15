const averageDaysInMonth = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function monthlyRainInLitersPerSquareMeter(millimetersPerDay: number, month: number): number {
  return Math.round(millimetersPerDay * averageDaysInMonth[month - 1]);
}
