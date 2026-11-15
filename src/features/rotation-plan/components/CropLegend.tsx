import { Sprout, Wheat } from "lucide-react";
import { useTranslations } from "next-intl";

type CropLegendProps = {
  crops: { cropKey: string; name: string; color: string }[];
  hasRest: boolean;
};

export function CropLegend({ crops, hasRest }: CropLegendProps) {
  const translate = useTranslations("rotationPlan.myCalendar");

  return (
    <ul aria-label={translate("legendLabel")} className="status-legend crop-legend">
      {crops.map((crop) => (
        <li key={crop.cropKey}>
          <span aria-hidden className="crop-legend__swatch" style={{ ["--use-color" as string]: crop.color }} />
          {crop.name}
        </li>
      ))}
      {hasRest && (
        <li>
          <span aria-hidden className="crop-legend__swatch" data-use="rest" />
          {translate("rest")}
        </li>
      )}
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
