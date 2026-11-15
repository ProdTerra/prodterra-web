import { useTranslations } from "next-intl";
import type { PestsAlert } from "../domain/alertDisplay";
import type { PlanAlert } from "../infrastructure/plansApi";

type NumberFormatters = {
  decimal: (value: number) => string;
  whole: (value: number) => string;
  pestName: (pestKey: string) => string;
};

export type AlertText = { name: string; action: string; cause: string };

const shownPestNames = 3;

export function useAlertText({ decimal, whole, pestName }: NumberFormatters) {
  const translate = useTranslations("calendar.insights");

  function pestList(pestKeys: string[]): string {
    const names = pestKeys.slice(0, shownPestNames).map(pestName).join(", ");
    const hiddenCount = pestKeys.length - shownPestNames;
    return hiddenCount > 0 ? translate("pestListMore", { names, count: hiddenCount }) : names;
  }

  return function alertText(alert: PlanAlert | PestsAlert): AlertText {
    switch (alert.type) {
      case "frost":
        return {
          name: translate("alarmName.frost"),
          action: translate("action.frost"),
          cause: translate("cause.frost", { value: decimal(alert.minimumTemperatureInCelsius) }),
        };
      case "temperature":
        return {
          name: translate("alarmName.temperature"),
          action: translate("action.temperature"),
          cause: translate("cause.temperature", { value: decimal(alert.meanTemperatureInCelsius) }),
        };
      case "drought":
        return {
          name: translate("alarmName.drought"),
          action: translate("action.drought", { value: whole(alert.litersPerSquareMeter) }),
          cause: translate("cause.drought"),
        };
      case "irrigation":
        return {
          name: translate("alarmName.irrigation"),
          action: translate("action.irrigation", { value: whole(alert.litersPerSquareMeter) }),
          cause: translate("cause.irrigation"),
        };
      case "waterExcess":
        return {
          name: translate("alarmName.waterExcess"),
          action: translate("action.waterExcess"),
          cause: translate("cause.waterExcess", { value: whole(alert.litersPerSquareMeter) }),
        };
      case "pest":
        return {
          name: translate("alarmName.pest", { pest: pestName(alert.pestKey) }),
          action: translate("action.pest", { pest: pestName(alert.pestKey) }),
          cause: translate("cause.pest"),
        };
      case "pests":
        return {
          name: translate("alarmName.pests"),
          action: translate("action.pests", { pests: pestList(alert.pestKeys) }),
          cause: translate("cause.pest"),
        };
    }
  };
}
