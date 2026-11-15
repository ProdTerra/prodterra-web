"use client";

import { ArrowRight, KeyRound, LoaderCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { Notice } from "@/shared/components/Notice";
import { validateNewPassword, type AccountField, type AccountFieldError, type NewPasswordValues } from "../domain/accountForm";
import { resetPassword } from "../infrastructure/authApi";
import { AccountTextField } from "./AccountTextField";
import { useSession } from "./SessionProvider";

const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

export function ResetPasswordScreen({ token }: { token: string }) {
  const translate = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const { signedIn } = useSession();
  const [values, setValues] = useState<NewPasswordValues>({ password: "", confirmPassword: "" });
  const [touched, setTouched] = useState<Set<AccountField>>(new Set());
  const [serverErrors, setServerErrors] = useState<AccountFieldError[]>(
    tokenPattern.test(token) ? [] : [{ code: "invalidResetLink" }],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const clientErrors = validateNewPassword(values);
  const isLinkInvalid = serverErrors.some((error) => error.code === "invalidResetLink");
  const formError = serverErrors.find((error) => !error.field && error.code !== "invalidResetLink");
  const fieldError = (field: AccountField): string | null => {
    const error =
      serverErrors.find((candidate) => candidate.field === field) ??
      (touched.has(field) ? clientErrors.find((candidate) => candidate.field === field) : undefined);
    return error ? translate(`errors.${error.code}`) : null;
  };

  function changeValue(field: keyof NewPasswordValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setServerErrors((current) => current.filter((error) => error.field !== field && error.field !== undefined));
  }

  function touch(field: AccountField) {
    setTouched((current) => new Set(current).add(field));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(new Set<AccountField>(["password", "confirmPassword"]));
    if (clientErrors.length > 0) {
      return;
    }
    setIsSubmitting(true);
    const result = await resetPassword(token, values.password, locale);
    setIsSubmitting(false);
    if (result.ok) {
      signedIn(result.user);
      setIsPasswordChanged(true);
      return;
    }
    setServerErrors(result.errors);
  }

  return (
    <main className="farms-screen reset-password">
      <header className="panel-header farms-screen__header">
        <Link href="/" className="brand">
          ProdTerra
        </Link>
        <div className="panel-header__actions">
          <LanguageSwitcher />
        </div>
      </header>

      <section className="reset-password__card" aria-labelledby="reset-password-title">
        <div>
          <h1 id="reset-password-title" className="step-title">
            {translate("resetTitle")}
          </h1>
          <p className="step-hint">{translate("resetHint")}</p>
        </div>

        {isPasswordChanged ? (
          <div className="reset-password__done">
            <Notice tone="success" title={translate("passwordChangedTitle")}>
              {translate("passwordChanged")}
            </Notice>
            <Link href="/" className="button button--primary">
              {translate("backToPlanner")}
              <ArrowRight aria-hidden size={18} />
            </Link>
          </div>
        ) : isLinkInvalid ? (
          <Notice
            tone="error"
            title={translate("errors.invalidResetLink")}
            action={{ label: translate("requestNewLink"), onClick: () => router.push("/?account=forgotPassword"), icon: Mail }}
          >
            {translate("invalidResetLinkHint")}
          </Notice>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="auth-dialog__body">
            {formError && <Notice tone="error">{translate(`errors.${formError.code}`)}</Notice>}
            <AccountTextField
              label={translate("newPasswordLabel")}
              type="password"
              value={values.password}
              autoComplete="new-password"
              error={fieldError("password")}
              hint={translate("passwordHint")}
              showPasswordLabel={translate("showPassword")}
              hidePasswordLabel={translate("hidePassword")}
              onChange={(value) => changeValue("password", value)}
              onBlur={() => touch("password")}
            />
            <AccountTextField
              label={translate("confirmPasswordLabel")}
              type="password"
              value={values.confirmPassword}
              autoComplete="new-password"
              error={fieldError("confirmPassword")}
              showPasswordLabel={translate("showPassword")}
              hidePasswordLabel={translate("hidePassword")}
              onChange={(value) => changeValue("confirmPassword", value)}
              onBlur={() => touch("confirmPassword")}
            />
            <button type="submit" disabled={isSubmitting} className="button button--primary auth-dialog__submit">
              {isSubmitting ? <LoaderCircle aria-hidden size={18} className="spin" /> : <KeyRound aria-hidden size={18} />}
              {translate(isSubmitting ? "submitting" : "savePassword")}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
