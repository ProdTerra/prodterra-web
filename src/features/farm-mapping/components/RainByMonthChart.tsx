import { useFormatter, useTranslations } from "next-intl";
import type { MonthlyClimate } from "../domain/climateSummary";

type RainByMonthChartProps = {
  months: MonthlyClimate[];
  driestMonth: number;
  wettestMonth: number;
  monthName: (month: number) => string;
};

export function RainByMonthChart({ months, driestMonth, wettestMonth, monthName }: RainByMonthChartProps) {
  const translate = useTranslations("farmMapping.summary");
  const format = useFormatter();
  const formatRain = (value: number) => format.number(value, { maximumFractionDigits: 1 });
  const highestRain = Math.max(...months.map((month) => month.precipitationInMillimetersPerDay));
  const rainOf = (monthNumber: number) =>
    months.find((month) => month.month === monthNumber)?.precipitationInMillimetersPerDay ?? 0;

  return (
    <figure className="rain-chart">
      <figcaption className="rain-chart__title">
        {translate("rainTitle")} <span className="rain-chart__unit">({translate("rainUnit")})</span>
      </figcaption>
      <div
        role="img"
        aria-label={translate("rainChartLabel", {
          driestMonth: monthName(driestMonth),
          driestValue: formatRain(rainOf(driestMonth)),
          wettestMonth: monthName(wettestMonth),
          wettestValue: formatRain(rainOf(wettestMonth)),
        })}
        className="rain-chart__plot"
      >
        {months.map((month) => {
          const isDriest = month.month === driestMonth;
          const isWettest = month.month === wettestMonth;
          const label = translate("rainBar", {
            month: monthName(month.month),
            value: formatRain(month.precipitationInMillimetersPerDay),
          });
          return (
            <div key={month.month} className="rain-chart__column" data-tooltip={label}>
              {(isDriest || isWettest) && (
                <span className="rain-chart__value">{formatRain(month.precipitationInMillimetersPerDay)}</span>
              )}
              <span
                className="rain-chart__bar"
                data-highlight={isDriest ? "driest" : isWettest ? "wettest" : undefined}
                style={{ height: `${(month.precipitationInMillimetersPerDay / highestRain) * 100}%` }}
              />
              <span aria-hidden className="rain-chart__month">
                {monthName(month.month).charAt(0).toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
      <p className="rain-chart__legend">
        <span>
          {translate("driest")}: <strong>{monthName(driestMonth)}</strong>
        </span>
        <span>
          {translate("wettest")}: <strong>{monthName(wettestMonth)}</strong>
        </span>
      </p>
      <table className="visually-hidden">
        <thead>
          <tr>
            <th scope="col">{translate("monthHeader")}</th>
            <th scope="col">{translate("rainUnit")}</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.month}>
              <th scope="row">{monthName(month.month)}</th>
              <td>{formatRain(month.precipitationInMillimetersPerDay)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
