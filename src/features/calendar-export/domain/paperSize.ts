export type PaperSize = "A4" | "LETTER";

const letterRegions = new Set(["US", "CA", "MX", "CR", "PA", "CO", "VE", "PH", "CL"]);

function regionOf(locale: string): string | null {
  try {
    const parsed = new Intl.Locale(locale);
    return parsed.region ?? parsed.maximize().region ?? null;
  } catch {
    return null;
  }
}

export function paperSizeForLocale(locale: string): PaperSize {
  const region = regionOf(locale);
  return region && letterRegions.has(region) ? "LETTER" : "A4";
}
