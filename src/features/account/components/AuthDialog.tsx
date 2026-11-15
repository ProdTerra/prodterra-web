"use client";

import { LoaderCircle, LogIn, UserPlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, type FormEvent } from "react";
import { Notice } from "@/shared/components/Notice";
import { useModalDialog } from "@/shared/components/useModalDialog";
import {
  validateAccountForm,
  type AccountField,
  type AccountFieldError,
  type AccountFormMode,
  type AccountFormValues,
} from "../domain/accountForm";
import { submitAccountForm } from "../infrastructure/authApi";
import { AccountTextField } from "./AccountTextField";
import { useSession } from "./SessionProvider";

const emptyValues: AccountFormValues = { name: "", email: "", password: "" };

export function AuthDialog() {
  const translate = useTranslations("account");
  const titleId = useId();
  const { isAuthDialogOpen, closeAuthDialog, signedIn } = useSession();
  const [mode, setMode] = useState<AccountFormMode>("login");
  const [values, setValues] = useState(emptyValues);
  const [touched, setTouched] = useState<Set<AccountField>>(new Set());
  const [serverErrors, setServerErrors] = useState<AccountFieldError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogProps = useModalDialog(isAuthDialogOpen, closeAuthDialog);

  const clientErrors = validateAccountForm(values, mode);
  const fieldError = (field: AccountField): string | null => {
    const error =
      serverErrors.find((candidate) => candidate.field === field) ??
      (touched.has(field) ? clientErrors.find((candidate) => candidate.field === field) : undefined);
    return error ? translate(`errors.${error.code}`) : null;
  };
  const formError = serverErrors.find((error) => !error.field);

  function changeMode(nextMode: AccountFormMode) {
    setMode(nextMode);
    setTouched(new Set());
    setServerErrors([]);
  }

  function changeValue(field: AccountField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setServerErrors((current) => current.filter((error) => error.field !== field && error.field !== undefined));
  }

  function touch(field: AccountField) {
    setTouched((current) => new Set(current).add(field));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(new Set<AccountField>(["name", "email", "password"]));
    if (clientErrors.length > 0) {
      return;
    }
    setIsSubmitting(true);
    const result = await submitAccountForm(mode, values);
    setIsSubmitting(false);
    if (result.ok) {
      setValues(emptyValues);
      setTouched(new Set());
      signedIn(result.user);
      return;
    }
    setServerErrors(result.errors);
  }

  const SubmitIcon = isSubmitting ? LoaderCircle : mode === "login" ? LogIn : UserPlus;

  return (
    <dialog {...dialogProps} aria-labelledby={titleId} className="dialog auth-dialog">
      <form noValidate onSubmit={handleSubmit} className="dialog__body auth-dialog__body">
        <header className="auth-dialog__header">
          <div>
            <h2 id={titleId} className="dialog__title">
              {translate(mode === "login" ? "loginTitle" : "registerTitle")}
            </h2>
            <p className="dialog__description">{translate("intro")}</p>
          </div>
          <button type="button" onClick={closeAuthDialog} aria-label={translate("close")} className="icon-button">
            <X aria-hidden size={20} />
          </button>
        </header>

        <div role="group" aria-label={translate("modeLabel")} className="auth-dialog__modes">
          {(["login", "register"] as const).map((option) => (
            <button key={option} type="button" aria-pressed={mode === option} onClick={() => changeMode(option)}>
              {translate(option === "login" ? "loginTab" : "registerTab")}
            </button>
          ))}
        </div>

        {formError && <Notice tone="error">{translate(`errors.${formError.code}`)}</Notice>}

        {mode === "register" && (
          <AccountTextField
            label={translate("nameLabel")}
            type="text"
            value={values.name}
            autoComplete="name"
            error={fieldError("name")}
            onChange={(value) => changeValue("name", value)}
            onBlur={() => touch("name")}
          />
        )}
        <AccountTextField
          label={translate("emailLabel")}
          type="email"
          value={values.email}
          autoComplete="email"
          error={fieldError("email")}
          onChange={(value) => changeValue("email", value)}
          onBlur={() => touch("email")}
        />
        <AccountTextField
          label={translate("passwordLabel")}
          type="password"
          value={values.password}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          error={fieldError("password")}
          hint={mode === "register" ? translate("passwordHint") : undefined}
          showPasswordLabel={translate("showPassword")}
          hidePasswordLabel={translate("hidePassword")}
          onChange={(value) => changeValue("password", value)}
          onBlur={() => touch("password")}
        />

        <button type="submit" disabled={isSubmitting} className="button button--primary auth-dialog__submit">
          <SubmitIcon aria-hidden size={18} className={isSubmitting ? "spin" : undefined} />
          {translate(isSubmitting ? "submitting" : mode === "login" ? "loginAction" : "registerAction")}
        </button>
        <p className="auth-dialog__note">{translate("optionalNote")}</p>
      </form>
    </dialog>
  );
}
