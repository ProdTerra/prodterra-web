import { useTranslations } from "next-intl";
import type { MonthStatus } from "../infrastructure/plansApi";
import { statusIcons } from "./statusIcons";

export function StatusLabel({ status }: { status: MonthStatus }) {
  const translate = useTranslations("calendar.insights");
  const StatusIcon = statusIcons[status];
  return (
    <span className="status-chip" data-status={status}>
      <StatusIcon aria-hidden size={16} />
      {translate(`status.${status}`)}
    </span>
  );
}
