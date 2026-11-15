import { useEffect, useState } from "react";
import { fetchCatalogCrops, type CatalogCrop } from "../infrastructure/cropCatalogApi";

export type CropCatalogState =
  | { status: "loading" }
  | { status: "ready"; crops: CatalogCrop[] }
  | { status: "failed" };

export function useCropCatalog() {
  const [state, setState] = useState<CropCatalogState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchCatalogCrops(controller.signal)
      .then((crops) => setState({ status: "ready", crops }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "failed" });
        }
      });
    return () => controller.abort();
  }, [attempt]);

  return {
    state,
    retry: () => {
      setState({ status: "loading" });
      setAttempt((current) => current + 1);
    },
  };
}
