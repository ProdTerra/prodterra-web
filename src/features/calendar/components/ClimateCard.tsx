import { Cloud, Droplets, Sun, Thermometer } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { climateGauge, humidityGaugeLimits, rainGaugeLimits } from "../domain/climateGauge";
import { describeClimate } from "../domain/monthInsights";
import type { MonthClimate } from "../infrastructure/plansApi";
import { ClimateGaugeBar } from "./ClimateGaugeBar";

type ClimateCardProps = {
  monthKey: string;
  monthTitle: string;
  climate: MonthClimate;
  decimal: (value: number) => string;
  whole: (value: number) => string;
};

type ClimateRowProps = { icon: ReactNode; word: string; amount: string; children?: ReactNode };

function ClimateRow({ icon, word, amount, children }: ClimateRowProps) {
  return (
    <li className="climate-fact">
      {icon}
      <span className="climate-fact__body">
        <span className="climate-fact__head">
          <strong>{word}</strong>
          <span>{amount}</span>
        </span>
        {children}
      </span>
    </li>
  );
}

export function ClimateCard({ monthKey, monthTitle, climate, decimal, whole }: ClimateCardProps) {
  const translate = useTranslations("calendar.insights");
  const description = describeClimate(climate, monthKey);
  const humidity = climate.relativeHumidityInPercent;

  return (
    <section className="calendar-card climate-card" aria-labelledby="climate-card-title">
      <div>
        <h3 id="climate-card-title" className="calendar-card__title">
          {translate("climateTitle", { month: monthTitle })}
        </h3>
        <p className="calendar-card__note">{translate("climateNote")}</p>
      </div>
      <ul className="climate-card__facts">
        <ClimateRow
          icon={<Thermometer aria-hidden size={18} />}
          word={translate("temperatureLabel")}
          amount={translate("temperatureRange", { min: decimal(climate.minimumTemperatureInCelsius), max: decimal(climate.maximumTemperatureInCelsius) })}
        >
          {description.hasFrostNights && <span className="climate-fact__warning">{translate("frostPossible")}</span>}
        </ClimateRow>
        <ClimateRow
          icon={<Droplets aria-hidden size={18} />}
          word={translate(`rainLevel.${description.rainLevel}`)}
          amount={translate("rainAmount", { value: whole(description.rainInMillimeters) })}
        >
          <ClimateGaugeBar
            gauge={climateGauge(description.rainInMillimeters, rainGaugeLimits)}
            label={translate("rainGauge", { value: whole(description.rainInMillimeters), low: rainGaugeLimits.low, high: rainGaugeLimits.high })}
          />
        </ClimateRow>
        <ClimateRow
          icon={<Cloud aria-hidden size={18} />}
          word={translate(`humidityLevel.${description.humidityLevel}`)}
          amount={translate("humidityAmount", { value: whole(humidity) })}
        >
          <ClimateGaugeBar
            gauge={climateGauge(humidity, humidityGaugeLimits)}
            label={translate("humidityGauge", { value: whole(humidity), low: humidityGaugeLimits.low, high: humidityGaugeLimits.high })}
          />
        </ClimateRow>
        <ClimateRow
          icon={<Sun aria-hidden size={18} />}
          word={translate("sunLabel")}
          amount={translate("sunAmount", { value: decimal(climate.solarRadiationInKilowattHoursPerSquareMeterPerDay) })}
        />
      </ul>
      <p className="calendar-card__note">{translate("gaugeNote")}</p>
    </section>
  );
}
