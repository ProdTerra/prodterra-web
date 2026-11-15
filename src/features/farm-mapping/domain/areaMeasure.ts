export type AreaMeasure =
  | { unit: "squareMeters"; value: number }
  | { unit: "hectares"; value: number };

const squareMetersPerHectare = 10_000;
const squareMetersRounding = 10;
const largeFarmInHectares = 10;

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function toAreaMeasure(areaInHectares: number): AreaMeasure {
  if (areaInHectares < 1) {
    const squareMeters = areaInHectares * squareMetersPerHectare;
    return {
      unit: "squareMeters",
      value: Math.round(squareMeters / squareMetersRounding) * squareMetersRounding,
    };
  }
  const decimals = areaInHectares < largeFarmInHectares ? 2 : 1;
  return { unit: "hectares", value: roundTo(areaInHectares, decimals) };
}
