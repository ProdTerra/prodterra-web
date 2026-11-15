export type SearchableCrop = { key: string; name: string };

export function normalizeForSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLocaleLowerCase();
}

function matchRank(name: string, query: string): number {
  const normalizedName = normalizeForSearch(name);
  if (normalizedName === query) {
    return 0;
  }
  if (normalizedName.startsWith(query)) {
    return 1;
  }
  return normalizedName.includes(query) ? 2 : -1;
}

export function searchCrops<Crop extends SearchableCrop>(crops: Crop[], query: string): Crop[] {
  const normalizedQuery = normalizeForSearch(query);
  const alphabetical = [...crops].sort((first, second) => first.name.localeCompare(second.name));
  if (normalizedQuery === "") {
    return alphabetical;
  }
  return alphabetical
    .map((crop) => ({ crop, rank: matchRank(crop.name, normalizedQuery) }))
    .filter(({ rank }) => rank >= 0)
    .sort((first, second) => first.rank - second.rank)
    .map(({ crop }) => crop);
}
