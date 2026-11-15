"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Notice } from "@/shared/components/Notice";
import { useModalDialog } from "@/shared/components/useModalDialog";
import { avatarImagePath, farmerAvatarKeys } from "../domain/avatar";
import { updateAvatar } from "../infrastructure/authApi";
import { useSession } from "./SessionProvider";

type AvatarPickerDialogProps = { isOpen: boolean; onClose: () => void };

export function AvatarPickerDialog({ isOpen, onClose }: AvatarPickerDialogProps) {
  const translate = useTranslations("account");
  const titleId = useId();
  const { user, updatedUser } = useSession();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const dialogProps = useModalDialog(isOpen, onClose);

  async function choose(avatarKey: string) {
    setSavingKey(avatarKey);
    setHasFailed(false);
    const changed = await updateAvatar(avatarKey);
    setSavingKey(null);
    if (!changed) {
      setHasFailed(true);
      return;
    }
    updatedUser(changed);
    onClose();
  }

  return (
    <dialog {...dialogProps} aria-labelledby={titleId} className="dialog">
      <div className="dialog__body auth-dialog__body">
        <header className="auth-dialog__header">
          <h2 id={titleId} className="dialog__title">
            {translate("avatarTitle")}
          </h2>
          <button type="button" onClick={onClose} aria-label={translate("close")} className="icon-button">
            <X aria-hidden size={20} />
          </button>
        </header>
        {hasFailed && <Notice tone="error">{translate("errors.unavailable")}</Notice>}
        <div role="radiogroup" aria-labelledby={titleId} className="avatar-picker">
          {farmerAvatarKeys.map((avatarKey, index) => {
            const isCurrent = user?.avatarKey === avatarKey;
            return (
              <button
                key={avatarKey}
                type="button"
                role="radio"
                aria-checked={isCurrent}
                aria-label={translate("avatarOption", { number: index + 1 })}
                disabled={savingKey !== null}
                onClick={() => void choose(avatarKey)}
                className="avatar-picker__option"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG avatars */}
                <img src={avatarImagePath(avatarKey)} alt="" width={72} height={72} />
                {isCurrent && (
                  <span aria-hidden className="avatar-picker__check">
                    <Check size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}
