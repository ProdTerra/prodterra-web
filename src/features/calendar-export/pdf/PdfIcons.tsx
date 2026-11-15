import { Circle, Path, Polygon, Rect, Svg } from "@react-pdf/renderer";
import type { MonthStatus } from "@/features/calendar/infrastructure/plansApi";
import { pdfColors, statusColors } from "./pdfTheme";

export function SowingIcon({ size = 6 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10">
      <Polygon points="5,0.5 9.5,9.5 0.5,9.5" fill={pdfColors.ink} />
    </Svg>
  );
}

export function HarvestIcon({ size = 6 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10">
      <Rect x={1} y={1} width={8} height={8} fill={pdfColors.ink} />
    </Svg>
  );
}

function OkIcon({ color }: { color: string }) {
  return (
    <>
      <Circle cx={10} cy={10} r={8.5} stroke={color} strokeWidth={2} fill="none" />
      <Path d="M5.5 10.5 L8.8 13.6 L14.6 7" stroke={color} strokeWidth={2.2} fill="none" />
    </>
  );
}

function WatchIcon({ color }: { color: string }) {
  return (
    <>
      <Polygon points="10,1.5 19,18 1,18" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M10 7.5 L10 12.5" stroke={color} strokeWidth={2.2} />
      <Rect x={8.9} y={14.2} width={2.2} height={2.2} fill={color} />
    </>
  );
}

function RiskIcon({ color }: { color: string }) {
  return (
    <>
      <Polygon points="6.3,1 13.7,1 19,6.3 19,13.7 13.7,19 6.3,19 1,13.7 1,6.3" fill={color} />
      <Path d="M10 5 L10 11.5" stroke={pdfColors.paper} strokeWidth={2.4} />
      <Rect x={8.8} y={13.3} width={2.4} height={2.4} fill={pdfColors.paper} />
    </>
  );
}

const statusIcons = { ok: OkIcon, watch: WatchIcon, risk: RiskIcon };

export function StatusIcon({ status, size = 9 }: { status: MonthStatus; size?: number }) {
  const Icon = statusIcons[status];
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Icon color={statusColors[status]} />
    </Svg>
  );
}
