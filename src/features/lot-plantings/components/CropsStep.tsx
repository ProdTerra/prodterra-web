"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useReducer, useState } from "react";
import type { Lot } from "@/features/farm-mapping/application/farmMappingState";
import { lotDisplayName } from "@/features/farm-mapping/application/lotDisplayName";
import { useAreaFormatter } from "@/features/farm-mapping/components/useAreaFormatter";
import { getBrowserStorage } from "@/shared/infrastructure/browserStorage";
import { lotPlantingsReducer, planningFor } from "../application/lotPlantingsState";
import { isPlantingComplete } from "../domain/lotPlanting";
import type { CatalogCrop } from "../infrastructure/cropCatalogApi";
import { loadLotPlantings, saveLotPlantings } from "../infrastructure/lotPlantingsStorage";
import { LotCard } from "./LotCard";
import { LotPlantingForm } from "./LotPlantingForm";
import { useCropCatalog } from "./useCropCatalog";

type CropsStepProps = {
  lots: Lot[];
  onEditLots: () => void;
};

const emptyPlantings = {};

export function CropsStep({ lots, onEditLots }: CropsStepProps) {
  const translate = useTranslations("farmMapping");
  const locale = useLocale();
  const formatArea = useAreaFormatter();
  const { state: catalog, retry } = useCropCatalog();
  const [plantings, dispatch] = useReducer(lotPlantingsReducer, emptyPlantings);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(lots[0]?.shapeId ?? null);
  const [today] = useState(() => new Date());
  const shapeIds = lots.map((lot) => lot.shapeId);
  const shapeIdsKey = shapeIds.join(",");

  useEffect(() => {
    const storage = getBrowserStorage();
    if (storage) {
      dispatch({ type: "plantingsRestored", plantings: loadLotPlantings(storage) });
    }
    dispatch({ type: "lotsChanged", shapeIds: shapeIdsKey.split(",") });
  }, [shapeIdsKey]);

  useEffect(() => {
    const storage = getBrowserStorage();
    if (storage && plantings !== emptyPlantings) {
      saveLotPlantings(storage, plantings);
    }
  }, [plantings]);

  const crops: CatalogCrop[] = catalog.status === "ready" ? catalog.crops : [];
  const cropName = (cropKey: string) => {
    const crop = crops.find((candidate) => candidate.key === cropKey);
    return crop ? (locale === "en" ? crop.name.en : crop.name.es) : cropKey;
  };
  const nameOf = (lot: Lot) =>
    lotDisplayName(lot, (number) => translate("lots.defaultName", { number }));
  const completedCount = lots.filter((lot) => isPlantingComplete(planningFor(plantings, lot.shapeId), today)).length;
  const selectedLot = lots.find((lot) => lot.shapeId === selectedShapeId) ?? lots[0];
  const selectedIndex = lots.indexOf(selectedLot);
  const nextLot = lots[(selectedIndex + 1) % lots.length];

  function summaryOf(lot: Lot): string | null {
    const currentUse = planningFor(plantings, lot.shapeId).currentUse;
    if (!currentUse) {
      return null;
    }
    return currentUse.kind === "fallow" ? translate("crops.fallow") : cropName(currentUse.cropKey);
  }

  return (
    <div className="crops-step">
      <header className="crops-step__header">
        <div>
          <h1 className="step-title">{translate("crops.title")}</h1>
          <p className="step-hint">{translate("crops.hint")}</p>
        </div>
        <p role="status" className="crops-step__progress" data-complete={completedCount === lots.length || undefined}>
          {completedCount === lots.length
            ? translate("crops.allDone")
            : translate("crops.progress", { done: completedCount, total: lots.length })}
        </p>
      </header>

      <section aria-label={translate("crops.lotsLabel")} className="lot-cards">
        {lots.map((lot) => (
          <LotCard
            key={lot.shapeId}
            lot={lot}
            name={nameOf(lot)}
            area={formatArea(lot.areaInHectares)}
            summary={summaryOf(lot)}
            isComplete={isPlantingComplete(planningFor(plantings, lot.shapeId), today)}
            isSelected={lot.shapeId === selectedLot?.shapeId}
            onSelect={() => setSelectedShapeId(lot.shapeId)}
          />
        ))}
      </section>

      {selectedLot && (
        <section aria-label={translate("crops.answersFor", { name: nameOf(selectedLot) })} className="crops-step__form">
          <h2 className="crops-step__form-title">
            <span aria-hidden className="lot-badge" style={{ ["--lot-color" as string]: selectedLot.color }}>
              {selectedLot.number}
            </span>
            {translate("crops.answersFor", { name: nameOf(selectedLot) })}
          </h2>

          {catalog.status === "loading" && <p role="status" className="notice">{translate("crops.catalogLoading")}</p>}
          {catalog.status === "failed" && (
            <div role="alert" className="notice notice--error">
              <p>{translate("crops.catalogFailed")}</p>
              <button type="button" onClick={retry} className="button button--quiet">
                {translate("crops.retry")}
              </button>
            </div>
          )}
          {catalog.status === "ready" && (
            <LotPlantingForm
              shapeId={selectedLot.shapeId}
              planting={planningFor(plantings, selectedLot.shapeId)}
              crops={crops}
              today={today}
              dispatch={dispatch}
            />
          )}

          <div className="step-actions">
            {lots.length > 1 && (
              <button type="button" onClick={() => setSelectedShapeId(nextLot.shapeId)} className="button button--primary">
                {translate("crops.nextLot")}
              </button>
            )}
            {lots.length > 1 && (
              <button
                type="button"
                onClick={() => dispatch({ type: "appliedToAllLots", fromShapeId: selectedLot.shapeId, shapeIds })}
                className="button button--outline"
              >
                {translate("crops.applyToAll")}
              </button>
            )}
            <button type="button" onClick={onEditLots} className="button button--quiet">
              {translate("crops.editLots")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
