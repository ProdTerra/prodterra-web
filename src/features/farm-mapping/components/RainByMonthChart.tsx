import { useFormatter, useTranslations } from "next-intl";
import type { MonthlyClimate } from "../domain/climateSummary";
import { monthlyRainInLitersPerSquareMeter } from "../domain/monthlyRain";

type RainByMonthChartProps = {
  months: MonthlyClimate[];
  monthName: (month: number) => string;
};

type MonthRain = { month: number; liters: number };

export function RainByMonthChart({ months, monthName }: RainByMonthChartProps) {
  const translate = useTranslations("farmMapping.summary");
  const format = useFormatter();
  const rains: MonthRain[] = months.map((month) => ({
    month: month.month,
    liters: monthlyRainInLitersPerSquareMeter(month.precipitationInMillimetersPerDay, month.month),
  }));
  const driest = rains.reduce((lowest, rain) => (rain.liters < lowest.liters ? rain : lowest));
  const wettest = rains.reduce((highest, rain) => (rain.liters > highest.liters ? rain : highest));
  const formatLiters = (liters: number) => format.number(liters);

  return (
    <figure className="rain-chart">
      <figcaption className="rain-chart__title">
        {translate("rainTitle")} <span className="rain-chart__unit">({translate("rainUnit")})</span>
      </figcaption>
      <div
        role="img"
        aria-label={translate("rainChartLabel", {
          driestMonth: monthName(driest.month),
          driestValue: formatLiters(driest.liters),
          wettestMonth: monthName(wettest.month),
          wettestValue: formatLiters(wettest.liters),
        })}
        className="rain-chart__plot"
      >
        {rains.map((rain) => {
          const highlight = rain.month === driest.month ? "driest" : rain.month === wettest.month ? "wettest" : undefined;
          return (
            <div
              key={rain.month}
              className="rain-chart__column"
              data-tooltip={translate("rainBar", { month: monthName(rain.month), value: formatLiters(rain.liters) })}
            >
              {highlight && <span className="rain-chart__value">{formatLiters(rain.liters)}</span>}
              <span
                className="rain-chart__bar"
                data-highlight={highlight}
                style={{ height: `${(rain.liters / wettest.liters) * 100}%` }}
              />
              <span aria-hidden className="rain-chart__month">
                {monthName(rain.month).charAt(0).toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
      <p className="rain-chart__legend">
        <span>{translate("driestDetail", { month: monthName(driest.month), value: formatLiters(driest.liters) })}</span>
        <span>{translate("wettestDetail", { month: monthName(wettest.month), value: formatLiters(wettest.liters) })}</span>
      </p>
      <table className="visually-hidden">
        <thead>
          <tr>
            <th scope="col">{translate("monthHeader")}</th>
            <th scope="col">{translate("litersHeader")}</th>
          </tr>
        </thead>
        <tbody>
          {rains.map((rain) => (
            <tr key={rain.month}>
              <th scope="row">{monthName(rain.month)}</th>
              <td>{formatLiters(rain.liters)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
