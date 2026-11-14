const minimumFreeAreaInHectares = 0.001;
const minimumFreeShareOfFarm = 0.005;

export function hasRoomForAnotherLot(farmAreaInHectares: number, lotAreasInHectares: number[]): boolean {
  const lotsArea = lotAreasInHectares.reduce((total, lotArea) => total + lotArea, 0);
  const freeArea = farmAreaInHectares - lotsArea;
  return freeArea > Math.max(minimumFreeAreaInHectares, farmAreaInHectares * minimumFreeShareOfFarm);
}
