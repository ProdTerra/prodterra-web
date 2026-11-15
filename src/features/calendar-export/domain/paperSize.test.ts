import { describe, expect, it } from "vitest";
import { paperSizeForLocale } from "./paperSize";

describe("paperSizeForLocale", () => {
  it.each(["en-US", "es-CR", "es-MX", "en-CA", "es-CO", "es-PA", "es-VE", "en-PH", "es-CL", "fr-CA"])("uses Letter for %s", (locale) => {
    expect(paperSizeForLocale(locale)).toBe("LETTER");
  });

  it.each(["es-ES", "es-AR", "en-GB", "de-DE", "pt-BR"])("uses A4 for %s", (locale) => {
    expect(paperSizeForLocale(locale)).toBe("A4");
  });

  it("infers the most likely region when the locale has none", () => {
    expect(paperSizeForLocale("en")).toBe("LETTER");
    expect(paperSizeForLocale("es")).toBe("A4");
  });

  it("falls back to A4 for an invalid locale", () => {
    expect(paperSizeForLocale("not a locale")).toBe("A4");
  });
});
