export const maximumFarmAreaInHectares = 1_000;
export const minimumFarmAreaInHectares = 0.01;
export const maximumLots = 30;

export type FarmAreaValidation = { isValid: true } | { isValid: false; reason: "tooLarge" | "tooSmall" };

export function validateFarmArea(areaInHectares: number): FarmAreaValidation {
  if (areaInHectares > maximumFarmAreaInHectares) {
    return { isValid: false, reason: "tooLarge" };
  }
  if (areaInHectares < minimumFarmAreaInHectares) {
    return { isValid: false, reason: "tooSmall" };
  }
  return { isValid: true };
}
