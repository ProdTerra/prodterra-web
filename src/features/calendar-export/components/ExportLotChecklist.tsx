import { useTranslations } from "next-intl";
import type { ExportLot } from "../application/buildCalendarExport";
import { maximumLotsPerPdf } from "../domain/lotSelection";

type ExportLotChecklistProps = { lots: ExportLot[]; selectedLotIds: string[]; onToggle: (lotId: string) => void };

export function ExportLotChecklist({ lots, selectedLotIds, onToggle }: ExportLotChecklistProps) {
  const translate = useTranslations("calendarExport.lots");
  const isFull = selectedLotIds.length >= maximumLotsPerPdf;

  return (
    <fieldset className="question export-dialog__section">
      <legend className="question__label export-dialog__legend">
        {translate("label")}
        <span className="export-dialog__counter">{translate("counter", { selected: selectedLotIds.length, maximum: maximumLotsPerPdf })}</span>
      </legend>
      <ul className="export-dialog__lots">
        {lots.map((lot) => {
          const isChecked = selectedLotIds.includes(lot.id);
          return (
            <li key={lot.id}>
              <label className="export-dialog__lot" data-disabled={(!isChecked && isFull) || undefined}>
                <input type="checkbox" checked={isChecked} disabled={!isChecked && isFull} onChange={() => onToggle(lot.id)} />
                <span aria-hidden className="lot-badge lot-badge--small" style={{ ["--lot-color" as string]: lot.color }}>
                  {lot.number}
                </span>
                <span>{lot.name}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {isFull && lots.length > maximumLotsPerPdf && <p className="export-dialog__hint">{translate("limit")}</p>}
      {selectedLotIds.length === 0 && (
        <p className="export-dialog__hint" data-tone="warning">
          {translate("none")}
        </p>
      )}
    </fieldset>
  );
}
