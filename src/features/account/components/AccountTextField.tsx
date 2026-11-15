import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type AccountTextFieldProps = {
  label: string;
  type: "text" | "email" | "password";
  value: string;
  autoComplete: string;
  error: string | null;
  hint?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function AccountTextField({
  label,
  type,
  value,
  autoComplete,
  error,
  hint,
  showPasswordLabel,
  hidePasswordLabel,
  onChange,
  onBlur,
}: AccountTextFieldProps) {
  const inputId = useId();
  const messageId = useId();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = type === "password" && isPasswordVisible ? "text" : type;
  const message = error ?? hint;

  return (
    <div className="account-field" data-invalid={error ? true : undefined}>
      <label htmlFor={inputId} className="account-field__label">
        {label}
      </label>
      <div className="account-field__control">
        <input
          id={inputId}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className="account-field__input"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? hidePasswordLabel : showPasswordLabel}
            aria-pressed={isPasswordVisible}
            className="account-field__toggle"
          >
            {isPasswordVisible ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}
          </button>
        )}
      </div>
      {message && (
        <p id={messageId} className="account-field__message">
          {message}
        </p>
      )}
    </div>
  );
}
