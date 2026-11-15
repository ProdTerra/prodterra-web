import { useId } from "react";

export type ChoiceOption = {
  value: string;
  label: string;
};

type ChoiceChipsProps = {
  label: string;
  options: ChoiceOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
};

export function ChoiceChips({ label, options, selectedValue, onSelect }: ChoiceChipsProps) {
  const labelId = useId();

  return (
    <fieldset className="question">
      <legend id={labelId} className="question__label">
        {label}
      </legend>
      <div role="radiogroup" aria-labelledby={labelId} className="choice-chips">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === selectedValue}
            onClick={() => onSelect(option.value)}
            className="choice-chip"
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
