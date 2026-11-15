"use client";

import { CircleAlert, Info } from "lucide-react";
import { useId } from "react";
import { useModalDialog } from "./useModalDialog";

type DialogTone = "danger" | "info";

type DialogProps = {
  isOpen: boolean;
  tone: DialogTone;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function Dialog({
  isOpen,
  tone,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const Icon = tone === "danger" ? CircleAlert : Info;

  function handleDismiss() {
    if (onCancel) {
      onCancel();
    } else {
      onConfirm();
    }
  }

  const dialogProps = useModalDialog(isOpen, handleDismiss);

  return (
    <dialog
      {...dialogProps}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="dialog"
      data-tone={tone}
    >
      <div className="dialog__body">
        <span aria-hidden className="dialog__icon">
          <Icon size={22} />
        </span>
        <h2 id={titleId} className="dialog__title">
          {title}
        </h2>
        <p id={descriptionId} className="dialog__description">
          {description}
        </p>
        <div className="dialog__actions">
          {cancelLabel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              autoFocus={tone === "danger"}
              className="button button--outline"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            autoFocus={tone === "info" || !cancelLabel || !onCancel}
            className={tone === "danger" ? "button button--danger" : "button button--primary"}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
