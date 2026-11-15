import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CalendarExportDocument } from "../application/calendarExportDocument";
import { capitalizeFirstLetter } from "../domain/capitalizeFirstLetter";
import { headerHeight } from "./pdfLayout";
import { pdfColors } from "./pdfTheme";

const styles = StyleSheet.create({
  header: {
    height: headerHeight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.ink,
  },
  brand: { fontSize: 11, fontWeight: 700, color: pdfColors.field, letterSpacing: 0.3 },
  context: { marginTop: 2, fontSize: 9, color: pdfColors.stone },
  calendarName: { fontWeight: 600, color: pdfColors.ink },
  month: { fontSize: 24, fontWeight: 700, color: pdfColors.ink, lineHeight: 1 },
  period: { marginTop: 3, fontSize: 8, color: pdfColors.stone, textAlign: "right" },
});

type PdfHeaderProps = { header: CalendarExportDocument["header"]; monthTitle: string };

export function PdfHeader({ header, monthTitle }: PdfHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>{header.brand}</Text>
        <Text style={styles.context}>
          {header.farmName} · <Text style={styles.calendarName}>{header.calendarName}</Text>
        </Text>
      </View>
      <View>
        <Text style={styles.month}>{capitalizeFirstLetter(monthTitle)}</Text>
        <Text style={styles.period}>{header.period}</Text>
      </View>
    </View>
  );
}
