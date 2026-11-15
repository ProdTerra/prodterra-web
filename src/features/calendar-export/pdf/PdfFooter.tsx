import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CalendarExportDocument } from "../application/calendarExportDocument";
import { HarvestIcon, SowingIcon, StatusIcon } from "./PdfIcons";
import { footerHeight, pageMargin } from "./pdfLayout";
import { pdfColors, tintColor } from "./pdfTheme";

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    left: pageMargin,
    right: pageMargin,
    bottom: pageMargin - 8,
    height: footerHeight,
    paddingTop: 5,
    borderTopWidth: 0.75,
    borderTopColor: pdfColors.line,
    gap: 4,
  },
  legend: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 9, rowGap: 2 },
  item: { flexDirection: "row", alignItems: "center", gap: 3 },
  swatch: { width: 12, height: 6, borderRadius: 1.5, borderLeftWidth: 2.5 },
  restSwatch: { width: 12, height: 6, borderRadius: 1.5, borderWidth: 0.75, borderStyle: "dashed", borderColor: pdfColors.rest },
  itemText: { fontSize: 6.5, color: pdfColors.ink },
  bottomLine: { flexDirection: "row", justifyContent: "space-between" },
  note: { fontSize: 6.5, color: pdfColors.stone },
  page: { fontSize: 6.5, fontWeight: 600, color: pdfColors.ink },
});

type PdfFooterProps = Pick<CalendarExportDocument, "legend" | "sourceNote" | "pageLabel">;

export function PdfFooter({ legend, sourceNote, pageLabel }: PdfFooterProps) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.legend}>
        {legend.crops.map((crop) => (
          <View key={crop.name} style={styles.item}>
            <View style={[styles.swatch, { backgroundColor: tintColor(crop.color, 0.72), borderLeftColor: crop.color }]} />
            <Text style={styles.itemText}>{crop.name}</Text>
          </View>
        ))}
        {legend.rest && (
          <View style={styles.item}>
            <View style={styles.restSwatch} />
            <Text style={styles.itemText}>{legend.rest}</Text>
          </View>
        )}
        <View style={styles.item}>
          <SowingIcon />
          <Text style={styles.itemText}>{legend.sowing}</Text>
        </View>
        <View style={styles.item}>
          <HarvestIcon />
          <Text style={styles.itemText}>{legend.harvest}</Text>
        </View>
        {legend.statuses.map(({ status, label }) => (
          <View key={status} style={styles.item}>
            <StatusIcon status={status} size={7} />
            <Text style={styles.itemText}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.bottomLine}>
        <Text style={styles.note}>{sourceNote ?? ""}</Text>
        <Text style={styles.page} render={({ pageNumber, totalPages }) => pageLabel(pageNumber, totalPages)} />
      </View>
    </View>
  );
}
