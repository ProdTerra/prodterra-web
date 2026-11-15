import { useTranslations } from "next-intl";
import { farmMappingSteps, type FarmMappingStep } from "../application/farmMappingState";

export function StepIndicator({ currentStep }: { currentStep: FarmMappingStep }) {
  const translate = useTranslations("farmMapping.steps");
  const currentIndex = farmMappingSteps.indexOf(currentStep);

  return (
    <ol aria-label={translate("label")} className="step-indicator">
      {farmMappingSteps.map((step, index) => (
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
