import { renderToBuffer } from "@react-pdf/renderer";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { buildCalendarExport } from "../application/buildCalendarExport";
import { sampleInput, sampleLabels } from "../testing/sampleExport";
import { CalendarPdfDocument } from "./CalendarPdfDocument";
import { registerPdfFonts } from "./registerPdfFonts";

const fontDirectory = fileURLToPath(new URL("../../../../public/fonts", import.meta.url));

function pageCountOf(buffer: Buffer): number {
  return buffer.toString("latin1").match(/\/Type \/Page\b/g)?.length ?? 0;
}

describe("CalendarPdfDocument", () => {
  it.each(["farmer", "recommended"] as const)("renders the %s calendar as a PDF with one page per month", async (calendar) => {
    registerPdfFonts(fontDirectory);
    const document = buildCalendarExport(sampleInput(calendar), sampleLabels);
    const buffer = await renderToBuffer(createElement(CalendarPdfDocument, { document }) as Parameters<typeof renderToBuffer>[0]);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pageCountOf(buffer)).toBe(2);
  }, 30_000);
});
