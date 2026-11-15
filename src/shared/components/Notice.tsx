import { CircleAlert, CircleCheck, FlaskConical, Info, LoaderCircle, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type NoticeTone = "info" | "loading" | "success" | "warning" | "error" | "demo";

type NoticeAction = {
  label: string;
  onClick: () => void;
};

type NoticeProps = {
  tone: NoticeTone;
  children: ReactNode;
  id?: string;
  action?: NoticeAction;
};

const iconByTone: Record<NoticeTone, LucideIcon> = {
  info: Info,
  loading: LoaderCircle,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
  demo: FlaskConical,
};

export function Notice({ tone, children, id, action }: NoticeProps) {
  const Icon = iconByTone[tone];
  const role = tone === "error" ? "alert" : tone === "loading" || tone === "success" ? "status" : undefined;

  return (
    <div id={id} role={role} className="notice" data-tone={tone}>
      <Icon aria-hidden size={18} className="notice__icon" />
      <div className="notice__body">
        <p>{children}</p>
        {action && (
          <button type="button" onClick={action.onClick} className="button button--secondary button--small">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
