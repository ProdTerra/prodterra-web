import { useEffect, useState } from "react";
import { fetchRotationEvaluation, type RotationEvaluation, type RotationEvaluationRequest } from "../infrastructure/plansApi";

export type RotationEvaluationState =
  | { status: "loading" }
  | { status: "ready"; evaluation: RotationEvaluation }
  | { status: "failed" };

export function useRotationEvaluation(request: RotationEvaluationRequest | null) {
  const [state, setState] = useState<RotationEvaluationState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const requestKey = JSON.stringify(request);

  useEffect(() => {
    const parsedRequest = JSON.parse(requestKey) as RotationEvaluationRequest | null;
    if (!parsedRequest) {
      return;
    }
    const controller = new AbortController();
    fetchRotationEvaluation(parsedRequest, controller.signal)
      .then((evaluation) => setState({ status: "ready", evaluation }))
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
