"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export type ReportCell = { month: string; text: string; color: string | null };

export type ReportLot = {
  key: string;
  name: string;
  color: string;
  number: number;
  rows: { label: string; cells: ReportCell[] }[];
  lines: string[];
};

type PrintableReportProps = {
  title: string;
  subtitle: string;
  months: string[];
  monthLabel: (month: string) => string;
  legend: { label: string; color: string }[];
  lots: ReportLot[];
};

const monthsPerTable = 6;

function subscribeToNothing(): () => void {
  return () => undefined;
}

function chunk<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));
}

export function PrintableReport({ title, subtitle, months, monthLabel, legend, lots }: PrintableReportProps) {
  const isClient = useSyncExternalStore(subscribeToNothing, () => true, () => false);

  if (!isClient) {
    return null;
  }

  return createPortal(
    <section className="print-report" aria-hidden>
      <header className="print-report__header">
        <strong>ProdTerra</strong>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <ul className="print-report__legend">
          {legend.map((entry) => (
            <li key={entry.label}>
              <span style={{ background: entry.color }} />
              {entry.label}
            </li>
          ))}
        </ul>
      </header>
      {lots.map((lot) => (
        <article key={lot.key} className="print-report__lot">
          <h2>
            <span style={{ background: lot.color }}>{lot.number}</span>
            {lot.name}
          </h2>
          {chunk(months, monthsPerTable).map((monthGroup) => (
            <table key={monthGroup[0]}>
              <thead>
                <tr>
                  <th />
                  {monthGroup.map((month) => (
                    <th key={month}>{monthLabel(month)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lot.rows.map((row) => (
                  <tr key={row.label}>
                    <th>{row.label}</th>
                    {monthGroup.map((month) => {
                      const cell = row.cells.find((candidate) => candidate.month === month);
                      return (
                        <td key={month} style={cell?.color ? { background: cell.color } : undefined}>
                          {cell?.text ?? ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
          {lot.lines.length > 0 && (
            <ul className="print-report__lines">
              {lot.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>,
    document.body,
  );
}
