import { useTranslations } from "next-intl";
import type { FarmMappingStep } from "../application/farmMappingState";

const orderedSteps: FarmMappingStep[] = ["locate", "boundary", "lots", "crops"];

export function StepIndicator({ currentStep }: { currentStep: FarmMappingStep }) {
  const translate = useTranslations("farmMapping.steps");
  const currentIndex = orderedSteps.indexOf(currentStep);

  return (
    <ol aria-label={translate("label")} className="step-indicator">
      {orderedSteps.map((step, index) => (
        <li
          key={step}
          aria-current={step === currentStep ? "step" : undefined}
          data-state={index < currentIndex ? "done" : index === currentIndex ? "current" : "next"}
        >
          <span className="step-indicator__number">{index + 1}</span>
          <span className="step-indicator__label">{translate(step)}</span>
        </li>
      ))}
    </ol>
  );
}
