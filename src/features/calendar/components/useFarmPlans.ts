import { useEffect, useState } from "react";
import { fetchFarmPlans, type FarmPlans, type LotPlanRequest } from "../infrastructure/plansApi";

export type FarmPlansState = { status: "loading" } | { status: "ready"; plans: FarmPlans } | { status: "failed" };

export function useFarmPlans(requests: LotPlanRequest[] | null) {
  const [state, setState] = useState<FarmPlansState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const requestKey = JSON.stringify(requests);

  useEffect(() => {
    const lots = JSON.parse(requestKey) as LotPlanRequest[] | null;
    if (!lots) {
      return;
    }
    const controller = new AbortController();
    fetchFarmPlans(lots, controller.signal)
      .then((plans) => setState({ status: "ready", plans }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "failed" });
        }
      });
    return () => controller.abort();
  }, [requestKey, attempt]);

  return {
    state,
    retry: () => {
      setState({ status: "loading" });
      setAttempt((current) => current + 1);
    },
  };
}
