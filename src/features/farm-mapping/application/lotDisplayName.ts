import type { Lot } from "./farmMappingState";

export function lotDisplayName(
  lot: Pick<Lot, "customName" | "number">,
  formatDefaultName: (number: number) => string,
): string {
  const trimmedName = lot.customName.trim();
  return trimmedName || formatDefaultName(lot.number);
}
