import { CircleAlert, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import type { CalendarAlarm } from "../domain/calendar";
import type { PlanAlert } from "../infrastructure/plansApi";

type AlarmListProps = {
  alarms: CalendarAlarm[];
  lots: Lot[];
  monthTitle: string;
  lotName: (lot: Lot) => string;
  pestName: (pestKey: string) => string;
  decimal: (value: number) => string;
  whole: (value: number) => string;
  onOpenLot: (lotId: string) => void;
};

export function AlarmList({ alarms, lots, monthTitle, lotName, pestName, decimal, whole, onOpenLot }: AlarmListProps) {
  const translate = useTranslations("calendar");

  function message(alert: PlanAlert): string {
    switch (alert.type) {
      case "frost":
        return translate("alarm.frost", { value: decimal(alert.minimumTemperatureInCelsius) });
      case "temperature":
        return translate("alarm.temperature", { value: decimal(alert.meanTemperatureInCelsius) });
      case "drought":
        return translate("alarm.drought", { value: whole(alert.litersPerSquareMeter) });
      case "irrigation":
        return translate("alarm.irrigation", { value: whole(alert.litersPerSquareMeter) });
      case "waterExcess":
        return translate("alarm.waterExcess", { value: whole(alert.litersPerSquareMeter) });
      case "pest":
        return translate("alarm.pest", { pest: pestName(alert.pestKey) });
    }
  }

  return (
    <section aria-labelledby="alarms-title" className="alarm-list">
      <h2 id="alarms-title" className="alarm-list__title">
        {translate("alarmsTitle", { month: monthTitle })}
        {alarms.length > 0 && <span className="alarm-list__count">{alarms.length}</span>}
      </h2>
      {alarms.length === 0 ? (
        <p className="alarm-list__empty">{translate("alarmsEmpty")}</p>
      ) : (
        <ol className="alarm-list__items">
          {alarms.map((alarm, index) => {
            const lot = lots.find((candidate) => candidate.shapeId === alarm.lotId);
            return (
              <li key={`${alarm.lotId}-${alarm.alert.type}-${index}`}>
                <button type="button" onClick={() => onOpenLot(alarm.lotId)} className="alarm" data-level={alarm.alert.level}>
                  <span aria-hidden className="alarm__icon">
                    {alarm.alert.level === "risk" ? <CircleAlert size={18} /> : <Eye size={18} />}
                  </span>
                  <span className="alarm__text">
                    <span className="alarm__lot">
                      {lot && (
                        <span aria-hidden className="lot-badge lot-badge--small" style={{ ["--lot-color" as string]: lot.color }}>
                          {lot.number}
                        </span>
                      )}
                      {lot ? lotName(lot) : alarm.lotId}
                    </span>
                    <span className="alarm__message">{message(alarm.alert)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
