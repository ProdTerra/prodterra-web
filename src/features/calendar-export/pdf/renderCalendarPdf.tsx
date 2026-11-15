import { pdf } from "@react-pdf/renderer";
import type { CalendarExportDocument } from "../application/calendarExportDocument";
import { CalendarPdfDocument } from "./CalendarPdfDocument";
import { registerPdfFonts } from "./registerPdfFonts";

export async function renderCalendarPdf(document: CalendarExportDocument, fontBaseUrl: string): Promise<Blob> {
  registerPdfFonts(fontBaseUrl);
  return pdf(<CalendarPdfDocument document={document} />).toBlob();
}
