export type CurrentUse = { kind: "crop"; cropKey: string } | { kind: "fallow" };

export type PreviousUse = CurrentUse | { kind: "unknown" };

export type LotPlanting = {
  currentUse: CurrentUse | null;
  plantedOn: string | null;
  previousUse: PreviousUse | null;
  hasIrrigation: boolean | null;
};

export const emptyLotPlanting: LotPlanting = {
  currentUse: null,
  plantedOn: null,
  previousUse: null,
  hasIrrigation: null,
};

const plantingMonthPattern = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isValidPlantingMonth(value: string, today: Date): boolean {
  const match = plantingMonthPattern.exec(value);
  if (!match) {
    return false;
  }
  const monthIndex = Number(match[1]) * 12 + Number(match[2]);
  const currentMonthIndex = today.getUTCFullYear() * 12 + today.getUTCMonth() + 1;
  return monthIndex <= currentMonthIndex;
}

export function isPlantingComplete(planting: LotPlanting, today: Date): boolean {
  if (!planting.currentUse || !planting.previousUse || planting.hasIrrigation === null) {
    return false;
  }
  if (planting.currentUse.kind === "fallow") {
    return true;
  }
  return planting.plantedOn !== null && isValidPlantingMonth(planting.plantedOn, today);
}
