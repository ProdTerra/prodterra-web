import { useState } from "react";
import type { CalendarExportDocument } from "../application/calendarExportDocument";

export type PdfExportStatus = "idle" | "generating" | "failed";

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function useCalendarPdfExport(onDownloaded: () => void) {
  const [status, setStatus] = useState<PdfExportStatus>("idle");

  async function exportPdf(exportDocument: CalendarExportDocument, fileName: string): Promise<void> {
    setStatus("generating");
    try {
      const { renderCalendarPdf } = await import("../pdf/renderCalendarPdf");
      const blob = await renderCalendarPdf(exportDocument, `${window.location.origin}/fonts`);
      downloadBlob(blob, fileName);
      setStatus("idle");
      onDownloaded();
    } catch {
      setStatus("failed");
    }
  }

  return { status, exportPdf };
}
