import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ExportClimate, ExportLotStatus } from "../application/calendarExportDocument";
import { StatusIcon } from "./PdfIcons";
import { insightsColumnWidth } from "./pdfLayout";
import { pdfColors, statusColors, tintColor } from "./pdfTheme";

const styles = StyleSheet.create({
  insights: { width: insightsColumnWidth, gap: 5 },
  box: { paddingVertical: 5, paddingHorizontal: 6, borderWidth: 0.75, borderColor: pdfColors.line, borderRadius: 3, gap: 3 },
  climateTitle: { fontSize: 7.5, fontWeight: 700, color: pdfColors.ink },
  climateRow: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  climateHeadline: { fontSize: 7, fontWeight: 600, color: pdfColors.ink },
  climateDetail: { fontSize: 6.5, color: pdfColors.stone, textAlign: "right" },
  climateWarning: { fontSize: 6.5, fontWeight: 700, color: statusColors.risk, textAlign: "right" },
  lotHead: { flexDirection: "row", alignItems: "center", gap: 2 },
  badge: { width: 10, height: 10, borderRadius: 5, alignItems: "center", justifyContent: "center", borderWidth: 0.75, borderColor: pdfColors.ink },
  badgeText: { fontSize: 6, fontWeight: 700, color: pdfColors.ink },
  lotName: { flex: 1, fontSize: 7, fontWeight: 700, color: pdfColors.ink, maxLines: 1, textOverflow: "ellipsis" },
  useLabel: { fontSize: 6.5, color: pdfColors.stone },
  status: { flexDirection: "row", alignItems: "center", gap: 2.5 },
  statusWord: { fontSize: 7, fontWeight: 700 },
  alarm: { paddingLeft: 4, borderLeftWidth: 1.5 },
  alarmAction: { fontSize: 6.5, fontWeight: 600, color: pdfColors.ink },
  alarmCause: { fontSize: 6, color: pdfColors.stone },
});

function ClimateBox({ climate }: { climate: ExportClimate }) {
  return (
    <View style={styles.box} wrap={false}>
      <Text style={styles.climateTitle}>{climate.title}</Text>
      {climate.rows.map((row) => (
        <View key={row.kind} style={styles.climateRow}>
          <Text style={styles.climateHeadline}>{row.headline}</Text>
          {row.detail && <Text style={row.isWarning ? styles.climateWarning : styles.climateDetail}>{row.detail}</Text>}
        </View>
      ))}
    </View>
  );
}

function LotStatusCard({ lot }: { lot: ExportLotStatus }) {
  return (
    <View style={styles.box} wrap={false}>
      <View style={styles.lotHead}>
        {lot.lots.map((member) => (
          <View key={member.id} style={[styles.badge, { backgroundColor: tintColor(member.color, 0.35) }]}>
            <Text style={styles.badgeText}>{member.number}</Text>
          </View>
        ))}
        <Text style={styles.lotName}>{lot.title}</Text>
        {lot.status && lot.statusLabel && (
          <View style={styles.status}>
            <StatusIcon status={lot.status} />
            <Text style={[styles.statusWord, { color: statusColors[lot.status] }]}>{lot.statusLabel}</Text>
          </View>
        )}
      </View>
      <Text style={styles.useLabel}>{lot.useLabel}</Text>
      {lot.alarms.map((alarm) => (
        <View key={alarm.action} style={[styles.alarm, { borderLeftColor: statusColors[alarm.level] }]}>
          <Text style={styles.alarmAction}>{alarm.action}</Text>
          <Text style={styles.alarmCause}>{alarm.cause}</Text>
        </View>
      ))}
    </View>
  );
}

type MonthInsightsPdfProps = { climate: ExportClimate | null; lotStatuses: ExportLotStatus[] };

export function MonthInsightsPdf({ climate, lotStatuses }: MonthInsightsPdfProps) {
  return (
    <View style={styles.insights}>
      {climate && <ClimateBox climate={climate} />}
      {lotStatuses.map((lot) => (
        <LotStatusCard key={lot.lots[0].id} lot={lot} />
      ))}
    </View>
  );
}
