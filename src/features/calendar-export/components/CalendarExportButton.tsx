"use client";

import { FileDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ExportDialog, type ExportDialogProps } from "./ExportDialog";

export function CalendarExportButton(props: Omit<ExportDialogProps, "onClose">) {
  const translate = useTranslations("calendarExport");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="button button--outline">
        <FileDown aria-hidden size={18} />
        {translate("open")}
      </button>
      {isOpen && <ExportDialog {...props} onClose={() => setIsOpen(false)} />}
    </>
  );
}
