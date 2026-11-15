"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { amountInUnit, daysForAmount, durationUnits, naturalUnitOf, type DurationUnit } from "../domain/durationUnits";

type DurationFieldProps = {
  name: string;
  durationInDays: number;
  startDate: string;
  longestInDays: number;
  onChange: (durationInDays: number) => void;
};

const digitsOnly = /^\d{1,4}$/;

export function DurationField({ name, durationInDays, startDate, longestInDays, onChange }: DurationFieldProps) {
  const translate = useTranslations("rotationPlan.rotation");
  const inputId = useId();
  const [unit, setUnit] = useState<DurationUnit>(() => naturalUnitOf(durationInDays));
  const [draft, setDraft] = useState<string | null>(null);
  const [wasLimited, setWasLimited] = useState(false);
  const amount = amountInUnit(unit, durationInDays, startDate);

  function apply(requestedAmount: number) {
    const requestedDays = daysForAmount(unit, requestedAmount, startDate);
    const durationToSave = Math.max(1, Math.min(requestedDays, longestInDays));
    setWasLimited(requestedDays > longestInDays);
    onChange(durationToSave);
  }

  function changeText(text: string) {
    setDraft(text);
    if (digitsOnly.test(text) && Number(text) > 0) {
      apply(Number(text));
    }
  }

  return (
    <div className="duration-field">
      <label htmlFor={inputId} className="visually-hidden">
        {translate("durationLabel", { name, unit: translate(`units.${unit}`) })}
      </label>
      <div className="duration-field__row">
        <div className="duration-field__amount">
          <button
            type="button"
            aria-label={translate("shorter", { unit: translate(`units.${unit}`) })}
            disabled={durationInDays <= 1}
            onClick={() => apply(Math.max(1, amount - 1))}
            className="icon-button"
          >
            <Minus aria-hidden size={18} />
          </button>
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={draft ?? String(amount)}
            onChange={(event) => changeText(event.target.value.trim())}
            onBlur={() => setDraft(null)}
            className="duration-field__input"
          />
          <button
            type="button"
            aria-label={translate("longer", { unit: translate(`units.${unit}`) })}
            disabled={durationInDays >= longestInDays}
            onClick={() => apply(amount + 1)}
            className="icon-button"
          >
            <Plus aria-hidden size={18} />
          </button>
        </div>
        <div role="group" aria-label={translate("unitLabel")} className="segmented">
          {durationUnits.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={unit === option}
              onClick={() => {
                setUnit(option);
                setDraft(null);
              }}
            >
              {translate(`units.${option}`)}
            </button>
          ))}
        </div>
      </div>
      {wasLimited && <p className="field-hint">{translate("limitReached")}</p>}
    </div>
  );
}
