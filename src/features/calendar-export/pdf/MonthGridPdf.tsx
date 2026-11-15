import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ExportBar, ExportLane, ExportMarker, ExportWeek } from "../application/calendarExportDocument";
import { HarvestIcon, SowingIcon } from "./PdfIcons";
import { dayNumberHeight, laneLabelWidth, maximumLaneHeight, minimumWeekHeight, weekdayRowHeight } from "./pdfLayout";
import { pdfColors, tintColor } from "./pdfTheme";

const columnShare = 100 / 7;

const styles = StyleSheet.create({
  grid: { flexGrow: 1, flexShrink: 1, borderTopWidth: 0.75, borderLeftWidth: 0.75, borderColor: pdfColors.line },
  weekdays: { flexDirection: "row", height: weekdayRowHeight, borderBottomWidth: 0.75, borderColor: pdfColors.line },
  weekdayLabel: {
    flex: 1,
    paddingTop: 2.5,
    fontSize: 7,
    fontWeight: 600,
    color: pdfColors.stone,
    textAlign: "center",
    textTransform: "uppercase",
    borderRightWidth: 0.75,
    borderColor: pdfColors.line,
  },
  week: { flex: 1, minHeight: minimumWeekHeight, flexDirection: "row", borderBottomWidth: 0.75, borderColor: pdfColors.line },
  laneLabels: { width: laneLabelWidth, paddingBottom: 2, paddingTop: dayNumberHeight + 1, paddingHorizontal: 3, borderRightWidth: 0.75, borderColor: pdfColors.line },
  laneLabel: { flex: 1, maxHeight: maximumLaneHeight, flexDirection: "row", alignItems: "center", gap: 3 },
  badge: { width: 10, height: 10, borderRadius: 5, alignItems: "center", justifyContent: "center", borderWidth: 0.75, borderColor: pdfColors.ink },
  badgeText: { fontSize: 6, fontWeight: 700, color: pdfColors.ink },
  laneName: { flex: 1, fontSize: 6.5, color: pdfColors.ink, maxLines: 1, textOverflow: "ellipsis" },
  weekBody: { flex: 1, position: "relative" },
  days: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row" },
  day: { flex: 1, paddingTop: 1.5, paddingRight: 3, borderRightWidth: 0.75, borderColor: pdfColors.line },
  dayNumber: { fontSize: 7.5, fontWeight: 600, color: pdfColors.ink, textAlign: "right" },
  outsideDayNumber: { color: pdfColors.faint, fontWeight: 400 },
  lanes: { flex: 1, marginTop: dayNumberHeight + 1, marginBottom: 2 },
  lane: { flex: 1, maxHeight: maximumLaneHeight, position: "relative" },
  barSlot: { position: "absolute", top: 1, bottom: 1, paddingHorizontal: 1 },
  bar: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 2.5, overflow: "hidden" },
  barLabel: { fontSize: 6.5, fontWeight: 600, color: pdfColors.ink, maxLines: 1, textOverflow: "ellipsis" },
  restOutline: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderWidth: 0.75, borderStyle: "dashed", borderColor: pdfColors.rest },
  restLabel: { fontSize: 6.5, color: pdfColors.stone, maxLines: 1, textOverflow: "ellipsis" },
  markerSlot: { position: "absolute", top: 0, bottom: 0, flexDirection: "row", alignItems: "center", paddingHorizontal: 3 },
});

function slotPosition(firstColumn: number, lastColumn: number) {
  return { left: `${firstColumn * columnShare}%`, width: `${(lastColumn - firstColumn + 1) * columnShare}%` };
}

function barCorners(bar: ExportBar) {
  const startRadius = bar.startsInWeek ? 3 : 0;
  const endRadius = bar.endsInWeek ? 3 : 0;
  return { borderTopLeftRadius: startRadius, borderBottomLeftRadius: startRadius, borderTopRightRadius: endRadius, borderBottomRightRadius: endRadius };
}

function barStyle(bar: ExportBar) {
  const corners = barCorners(bar);
  if (bar.kind === "rest") {
    return { ...corners, backgroundColor: pdfColors.paper };
  }
  return {
    ...corners,
    backgroundColor: tintColor(bar.color, 0.72),
    borderLeftWidth: bar.startsInWeek ? 2.5 : 0,
    borderRightWidth: bar.endsInWeek ? 2.5 : 0,
    borderColor: bar.color,
    paddingLeft: bar.startsInWeek ? 10 : 2.5,
  };
}

function Bar({ bar }: { bar: ExportBar }) {
  return (
    <View style={[styles.barSlot, slotPosition(bar.firstColumn, bar.lastColumn)]}>
      <View style={[styles.bar, barStyle(bar)]}>
        {bar.kind === "rest" && <View style={[styles.restOutline, barCorners(bar)]} />}
        {bar.label && (
          <Text style={bar.kind === "rest" ? styles.restLabel : styles.barLabel}>
            {bar.label}
          </Text>
        )}
      </View>
    </View>
  );
}

function Marker({ marker }: { marker: ExportMarker }) {
  const alignment = marker.kind === "sowing" ? "flex-start" : "flex-end";
  return (
    <View style={[styles.markerSlot, slotPosition(marker.column, marker.column), { justifyContent: alignment }]}>
      {marker.kind === "sowing" ? <SowingIcon /> : <HarvestIcon />}
    </View>
  );
}

function Lane({ lane }: { lane: ExportLane }) {
  return (
    <View style={styles.lane}>
      {lane.bars.map((bar) => (
        <Bar key={`${bar.firstColumn}-${bar.kind}-${bar.label}`} bar={bar} />
      ))}
      {lane.markers.map((marker) => (
        <Marker key={`${marker.kind}-${marker.column}`} marker={marker} />
      ))}
    </View>
  );
}

function LaneLabel({ lane }: { lane: ExportLane }) {
  return (
    <View style={styles.laneLabel}>
      <View style={[styles.badge, { backgroundColor: tintColor(lane.lotColor, 0.35) }]}>
        <Text style={styles.badgeText}>{lane.lotNumber}</Text>
      </View>
      <Text style={styles.laneName}>
        {lane.lotName}
      </Text>
    </View>
  );
}

function Week({ week }: { week: ExportWeek }) {
  return (
    <View style={styles.week}>
      <View style={styles.laneLabels}>
        {week.lanes.map((lane) => (
          <LaneLabel key={lane.lotId} lane={lane} />
        ))}
      </View>
      <View style={styles.weekBody}>
        <View style={styles.days}>
          {week.days.map((day) => (
            <View key={day.date} style={[styles.day, day.isWeekend ? { backgroundColor: pdfColors.weekend } : {}]}>
              <Text style={day.isOutside ? [styles.dayNumber, styles.outsideDayNumber] : styles.dayNumber}>{day.dayNumber}</Text>
            </View>
          ))}
        </View>
        <View style={styles.lanes}>
          {week.lanes.map((lane) => (
            <Lane key={lane.lotId} lane={lane} />
          ))}
        </View>
      </View>
    </View>
  );
}

type MonthGridPdfProps = { weekdays: string[]; weeks: ExportWeek[] };

export function MonthGridPdf({ weekdays, weeks }: MonthGridPdfProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.weekdays}>
        <View style={{ width: laneLabelWidth, borderRightWidth: 0.75, borderColor: pdfColors.line }} />
        {weekdays.map((weekday) => (
          <Text key={weekday} style={styles.weekdayLabel}>
            {weekday}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <Week key={week.days[0].date} week={week} />
      ))}
    </View>
  );
}
