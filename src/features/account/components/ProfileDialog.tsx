"use client";

import { Check, LoaderCircle, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, type FormEvent } from "react";
import { Notice } from "@/shared/components/Notice";
import { useModalDialog } from "@/shared/components/useModalDialog";
import { validateAccountForm, type AccountFieldError } from "../domain/accountForm";
import { avatarImagePath, farmerAvatarKeys } from "../domain/avatar";
import { updateProfile } from "../infrastructure/authApi";
import { AccountTextField } from "./AccountTextField";
import { useSession } from "./SessionProvider";

export function ProfileDialog({ onClose }: { onClose: () => void }) {
  const translate = useTranslations("account");
  const titleId = useId();
  const avatarLabelId = useId();
  const { user, updatedUser } = useSession();
  const [name, setName] = useState(user?.name ?? "");
  const [avatarKey, setAvatarKey] = useState(user?.avatarKey ?? null);
  const [isNameTouched, setIsNameTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<AccountFieldError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const dialogProps = useModalDialog(true, onClose);

  const nameError =
    serverErrors.find((error) => error.field === "name") ??
    (isNameTouched ? validateAccountForm({ name, email: "a@b.co", password: "x" }, "register").find((error) => error.field === "name") : undefined);
  const formError = serverErrors.find((error) => error.field !== "name");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsNameTouched(true);
    if (validateAccountForm({ name, email: "a@b.co", password: "x" }, "register").some((error) => error.field === "name")) {
      return;
    }
    setIsSaving(true);
    const result = await updateProfile({ name: name.trim(), avatarKey });
    setIsSaving(false);
    if (!result.ok) {
      setServerErrors(result.errors);
      return;
    }
    updatedUser(result.user);
    onClose();
  }

  return (
    <dialog {...dialogProps} aria-labelledby={titleId} className="dialog">
      <form noValidate onSubmit={handleSubmit} className="dialog__body auth-dialog__body">
        <header className="auth-dialog__header">
          <h2 id={titleId} className="dialog__title">
            {translate("profileTitle")}
          </h2>
          <button type="button" onClick={onClose} aria-label={translate("close")} className="icon-button">
            <X aria-hidden size={20} />
          </button>
        </header>
        {formError && <Notice tone="error">{translate(`errors.${formError.code}`)}</Notice>}
        <AccountTextField
          label={translate("nameLabel")}
          type="text"
          value={name}
          autoComplete="name"
          error={nameError ? translate(`errors.${nameError.code}`) : null}
          onChange={(value) => {
            setName(value);
            setServerErrors([]);
          }}
          onBlur={() => setIsNameTouched(true)}
        />
        <div className="account-field">
          <span id={avatarLabelId} className="account-field__label">
            {translate("avatarTitle")}
          </span>
          <div role="radiogroup" aria-labelledby={avatarLabelId} className="avatar-picker">
            {farmerAvatarKeys.map((key, index) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={avatarKey === key}
                aria-label={translate("avatarOption", { number: index + 1 })}
                onClick={() => setAvatarKey(key)}
                className="avatar-picker__option"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG avatars */}
                <img src={avatarImagePath(key)} alt="" width={72} height={72} />
                {avatarKey === key && (
                  <span aria-hidden className="avatar-picker__check">
                    <Check size={14} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="dialog__actions">
          <button type="button" onClick={onClose} className="button button--outline">
            {translate("cancel")}
          </button>
          <button type="submit" disabled={isSaving} className="button button--primary">
            {isSaving ? <LoaderCircle aria-hidden size={18} className="spin" /> : <Save aria-hidden size={18} />}
            {translate(isSaving ? "submitting" : "saveProfile")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
