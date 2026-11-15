import { CircleAlert, CircleCheck, Eye, Sprout, Wheat } from "lucide-react";
import { useTranslations } from "next-intl";

export function StatusLegend() {
  const translate = useTranslations("calendar");
  return (
    <ul aria-label={translate("legendLabel")} className="status-legend">
      <li>
        <span aria-hidden className="status-legend__swatch" data-status="ok" />
        <CircleCheck aria-hidden size={14} />
        {translate("statusOk")}
      </li>
      <li>
        <span aria-hidden className="status-legend__swatch" data-status="watch" />
        <Eye aria-hidden size={14} />
        {translate("statusWatch")}
      </li>
      <li>
        <span aria-hidden className="status-legend__swatch" data-status="risk" />
        <CircleAlert aria-hidden size={14} />
        {translate("statusRisk")}
      </li>
      <li>
        <Sprout aria-hidden size={14} />
        {translate("sowing")}
      </li>
      <li>
        <Wheat aria-hidden size={14} />
        {translate("harvest")}
      </li>
    </ul>
  );
}
