import type { EvaluatedRotation, LotPlan, PlanEvent, RotationEvaluation } from "../infrastructure/plansApi";

export type PlanVariant = "farmer" | "recommended";

function eventsOf(rotation: EvaluatedRotation): PlanEvent[] {
  return rotation.blocks
    .filter((block) => block.kind === "crop")
    .flatMap((block) => [
      { month: block.startsOn.slice(0, 7), day: Number(block.startsOn.slice(8, 10)), kind: "sowing" as const },
      { month: block.endsOn.slice(0, 7), day: Number(block.endsOn.slice(8, 10)), kind: "harvest" as const },
    ]);
}

export function toLotPlans(evaluation: RotationEvaluation, variant: PlanVariant): LotPlan[] {
  return evaluation.lots.map((lot) => {
    const rotation = lot[variant];
    if (!rotation) {
      return { lotId: lot.lotId, months: [], events: [] };
    }
    return {
      lotId: lot.lotId,
      months: rotation.months.map((month) => ({
        month: month.month,
        cropKey: month.cropKey,
        phase: month.cropKey ? "crop" : month.isRest ? "rest" : "free",
        status: month.status,
        alerts: month.alerts,
      })),
      events: eventsOf(rotation),
    };
  });
}

export function allMonths(plans: LotPlan[]): string[] {
  return [...new Set(plans.flatMap((plan) => plan.months.map((month) => month.month)))].sort();
}
