"use client";

import { FileDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { ChoiceChips } from "@/features/rotation-plan/components/ChoiceChips";
import { loadActiveSavedFarm } from "@/features/saved-farms/infrastructure/activeSavedFarmStorage";
import { Notice } from "@/shared/components/Notice";
import { useModalDialog } from "@/shared/components/useModalDialog";
import { getBrowserStorage } from "@/shared/infrastructure/browserStorage";
import { buildCalendarExport, type ExportLot } from "../application/buildCalendarExport";
import type { CalendarExportSources } from "../application/exportSources";
import { exportFileName } from "../domain/exportFileName";
import type { ExportCalendar } from "../domain/lotSelection";
import { paperSizeForLocale, type PaperSize } from "../domain/paperSize";
import { ExportLotChecklist } from "./ExportLotChecklist";
import { ExportPeriodField } from "./ExportPeriodField";
import { useCalendarExportLabels } from "./useCalendarExportLabels";
import { useCalendarPdfExport } from "./useCalendarPdfExport";
import { useExportSelection } from "./useExportSelection";

export type ExportDialogProps = {
  lots: ExportLot[];
  sources: CalendarExportSources;
  initialCalendar: ExportCalendar;
  cropName: (cropKey: string) => string;
  pestName: (pestKey: string) => string;
  onClose: () => void;
};

const paperSizes: PaperSize[] = ["A4", "LETTER"];

function savedFarmName(): string | null {
  const storage = getBrowserStorage();
  return storage ? (loadActiveSavedFarm(storage)?.name ?? null) : null;
}

export function ExportDialog({ lots, sources, initialCalendar, cropName, pestName, onClose }: ExportDialogProps) {
  const translate = useTranslations("calendarExport");
  const titleId = useId();
  const labels = useCalendarExportLabels({ cropName, pestName });
  const selection = useExportSelection(sources, lots, initialCalendar);
  const [paperSize, setPaperSize] = useState<PaperSize>(() => paperSizeForLocale(navigator.language));
  const { status, exportPdf } = useCalendarPdfExport(onClose);
  const isGenerating = status === "generating";
  const dialogProps = useModalDialog(true, () => !isGenerating && onClose());
  const canDownload = selection.months.length > 0 && selection.selectedLots.length > 0 && !isGenerating;

  function download() {
    const exportDocument = buildCalendarExport(
      {
        calendar: selection.calendar,
        farmName: savedFarmName(),
        paperSize,
        months: selection.months,
        lots: selection.selectedLots,
        blocks: selection.source.blocks,
        insights: selection.source.insights,
      },
      labels,
    );
    void exportPdf(exportDocument, exportFileName(translate(`fileSlug.${selection.calendar}`), selection.months));
  }

  return (
    <dialog {...dialogProps} aria-labelledby={titleId} className="dialog dialog--wide export-dialog">
      <div className="dialog__body">
        <h2 id={titleId} className="dialog__title">
          {translate("title")}
        </h2>
        <p className="dialog__description">{translate("description")}</p>

        {sources.recommended ? (
          <ChoiceChips
            label={translate("calendar.label")}
            options={[
              { value: "farmer", label: translate("calendar.farmer") },
              { value: "recommended", label: translate("calendar.recommended") },
            ]}
            selectedValue={selection.calendar}
            onSelect={(value) => selection.chooseCalendar(value === "recommended" ? "recommended" : "farmer")}
          />
        ) : (
          <p className="export-dialog__hint">{translate("calendar.recommendedLater")}</p>
        )}

        <ExportPeriodField
          periodKind={selection.period.kind}
          planMonths={selection.planMonths}
          endMonths={selection.endMonths}
          fromMonth={selection.fromMonth}
          toMonth={selection.toMonth}
          monthCount={selection.months.length}
          monthTitle={labels.monthTitle}
          onChooseKind={selection.choosePeriodKind}
          onChooseFrom={selection.chooseFromMonth}
          onChooseTo={selection.chooseToMonth}
        />

        <label className="export-dialog__paper">
          <span className="question__label">{translate("paper.label")}</span>
          <select value={paperSize} onChange={(event) => setPaperSize(event.target.value === "LETTER" ? "LETTER" : "A4")}>
            {paperSizes.map((size) => (
              <option key={size} value={size}>
                {translate(`paper.${size}`)}
              </option>
            ))}
          </select>
        </label>

        <ExportLotChecklist lots={lots} selectedLotIds={selection.selectedLotIds} onToggle={selection.toggleLot} />

        {status === "failed" && (
          <Notice tone="error" title={translate("errorTitle")}>
            {translate("error")}
          </Notice>
        )}

        <div className="dialog__actions">
          <button type="button" onClick={onClose} disabled={isGenerating} className="button button--outline">
            {translate("cancel")}
          </button>
          <button type="button" onClick={download} disabled={!canDownload} aria-busy={isGenerating} className="button button--primary">
            <FileDown aria-hidden size={18} />
            {isGenerating ? translate("generating") : translate("download")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
