import { Document, Page, StyleSheet, View } from "@react-pdf/renderer";
import type { CalendarExportDocument, ExportMonthPage } from "../application/calendarExportDocument";
import { MonthGridPdf } from "./MonthGridPdf";
import { MonthInsightsPdf } from "./MonthInsightsPdf";
import { PdfFooter } from "./PdfFooter";
import { PdfHeader } from "./PdfHeader";
import { footerHeight, pageMargin } from "./pdfLayout";
import { pdfColors } from "./pdfTheme";
import { pdfFontFamily } from "./registerPdfFonts";

const styles = StyleSheet.create({
  page: {
    paddingTop: pageMargin,
    paddingHorizontal: pageMargin,
    paddingBottom: pageMargin + footerHeight,
    fontFamily: pdfFontFamily,
    color: pdfColors.ink,
    backgroundColor: pdfColors.paper,
  },
  body: { flexGrow: 1, flexDirection: "row", gap: 8 },
  gridColumn: { flexGrow: 1, flexShrink: 1 },
});

function MonthPage({ document, page }: { document: CalendarExportDocument; page: ExportMonthPage }) {
  return (
    <Page size={document.paperSize} orientation="landscape" style={styles.page}>
      <PdfHeader header={document.header} monthTitle={page.monthTitle} />
      <View style={styles.body}>
        <View style={styles.gridColumn} wrap={false}>
          <MonthGridPdf weekdays={document.weekdays} weeks={page.weeks} />
        </View>
        {page.lotStatuses && <MonthInsightsPdf climate={page.climate} lotStatuses={page.lotStatuses} />}
      </View>
      <PdfFooter legend={document.legend} sourceNote={document.sourceNote} pageLabel={document.pageLabel} />
    </Page>
  );
}

export function CalendarPdfDocument({ document }: { document: CalendarExportDocument }) {
  return (
    <Document title={`${document.header.brand} · ${document.header.calendarName} · ${document.header.period}`} author={document.header.brand}>
      {document.pages.map((page) => (
        <MonthPage key={page.monthKey} document={document} page={page} />
      ))}
    </Document>
  );
}
