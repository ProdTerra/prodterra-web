"use client";

import { ArrowLeft, LoaderCircle, LogIn, Send, UserPlus, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
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
import { requestPasswordReset, submitAccountForm } from "../infrastructure/authApi";
import { AccountTextField } from "./AccountTextField";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useSession, type AuthDialogRequest } from "./SessionProvider";

const emptyValues: AccountFormValues = { name: "", email: "", password: "" };

export function AuthDialog() {
  const titleId = useId();
  const { isAuthDialogOpen, closeAuthDialog, authDialogRequest } = useSession();
  const dialogProps = useModalDialog(isAuthDialogOpen, closeAuthDialog);

  return (
    <dialog {...dialogProps} aria-labelledby={titleId} className="dialog auth-dialog">
      <AuthForm key={authDialogRequest.id} titleId={titleId} request={authDialogRequest} />
    </dialog>
  );
}

function AuthForm({ titleId, request }: { titleId: string; request: AuthDialogRequest }) {
  const translate = useTranslations("account");
  const locale = useLocale();
  const { closeAuthDialog, signedIn } = useSession();
  const [mode, setMode] = useState<AccountFormMode>(request.mode);
  const [values, setValues] = useState(emptyValues);
  const [touched, setTouched] = useState<Set<AccountField>>(new Set());
  const [serverErrors, setServerErrors] = useState<AccountFieldError[]>(
    request.errorCode ? [{ code: request.errorCode }] : [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetLinkSentTo, setResetLinkSentTo] = useState<string | null>(null);

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
    setResetLinkSentTo(null);
  }

  function changeValue(field: AccountField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setServerErrors((current) => current.filter((error) => error.field !== field && error.field !== undefined));
  }

  function touch(field: AccountField) {
    setTouched((current) => new Set(current).add(field));
  }

  async function sendResetLink() {
    const email = values.email.trim();
    const result = await requestPasswordReset(email, locale);
    if (result.ok) {
      setResetLinkSentTo(email);
      return;
    }
    setServerErrors(result.errors);
  }

  async function signInOrRegister(formMode: Exclude<AccountFormMode, "forgot">) {
    const result = await submitAccountForm(formMode, values, locale);
    if (result.ok) {
      setValues(emptyValues);
      setTouched(new Set());
      signedIn(result.user);
      return;
    }
    setServerErrors(result.errors);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(new Set<AccountField>(["name", "email", "password"]));
    if (clientErrors.length > 0) {
      return;
    }
    setIsSubmitting(true);
    await (mode === "forgot" ? sendResetLink() : signInOrRegister(mode));
    setIsSubmitting(false);
  }

  const title = mode === "forgot" ? "forgotTitle" : mode === "login" ? "loginTitle" : "registerTitle";
  const SubmitIcon = isSubmitting ? LoaderCircle : mode === "forgot" ? Send : mode === "login" ? LogIn : UserPlus;
  const submitLabel = isSubmitting
    ? "submitting"
    : mode === "forgot"
      ? "sendResetLink"
      : mode === "login"
        ? "loginAction"
        : "registerAction";

  return (
    <form noValidate onSubmit={handleSubmit} className="dialog__body auth-dialog__body">
      <header className="auth-dialog__header">
        <div>
          <h2 id={titleId} className="dialog__title">
            {translate(title)}
          </h2>
          <p className="dialog__description">{translate(mode === "forgot" ? "forgotIntro" : "intro")}</p>
        </div>
        <button type="button" onClick={closeAuthDialog} aria-label={translate("close")} className="icon-button">
          <X aria-hidden size={20} />
        </button>
      </header>

      {mode !== "forgot" && (
        <>
          <GoogleSignInButton label={translate(mode === "login" ? "googleLogin" : "googleRegister")} />
          <p className="auth-dialog__divider">
            <span>{translate("orWithEmail")}</span>
          </p>
          <div role="group" aria-label={translate("modeLabel")} className="auth-dialog__modes">
            {(["login", "register"] as const).map((option) => (
              <button key={option} type="button" aria-pressed={mode === option} onClick={() => changeMode(option)}>
                {translate(option === "login" ? "loginTab" : "registerTab")}
              </button>
            ))}
          </div>
        </>
      )}

      {formError && <Notice tone="error">{translate(`errors.${formError.code}`)}</Notice>}

      {resetLinkSentTo ? (
        <Notice tone="success" title={translate("resetLinkSentTitle")}>
          {translate("resetLinkSent", { email: resetLinkSentTo })}
        </Notice>
      ) : (
        <>
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
          {mode !== "forgot" && (
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
          )}
          {mode === "login" && (
            <button type="button" onClick={() => changeMode("forgot")} className="link-button auth-dialog__forgot">
              {translate("forgotPassword")}
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className="button button--primary auth-dialog__submit">
            <SubmitIcon aria-hidden size={18} className={isSubmitting ? "spin" : undefined} />
            {translate(submitLabel)}
          </button>
        </>
      )}

      {mode === "forgot" ? (
        <button type="button" onClick={() => changeMode("login")} className="button button--outline auth-dialog__submit">
          <ArrowLeft aria-hidden size={18} />
          {translate("backToLogin")}
        </button>
      ) : (
        <p className="auth-dialog__note">{translate("optionalNote")}</p>
      )}
    </form>
  );
}
