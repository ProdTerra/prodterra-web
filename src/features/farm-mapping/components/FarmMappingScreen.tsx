"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useReducer, useRef, useState } from "react";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { farmMappingReducer, initialFarmMappingState } from "../application/farmMappingState";
import { lotDisplayName } from "../application/lotDisplayName";
import { calculateAreaInHectares, validateLot } from "../domain/farmGeometry";
import { pickLotColor } from "../domain/lotColors";
import type { FinishedShape, ShapeKind } from "../infrastructure/drawingSession";
import { BoundaryStep } from "./BoundaryStep";
import { LocateStep } from "./LocateStep";
import { LotsStep } from "./LotsStep";
import type { MapCoordinates, SatelliteMapHandle } from "./SatelliteMap";
import { StepIndicator } from "./StepIndicator";

const SatelliteMap = dynamic(() => import("./SatelliteMap"), { ssr: false });

const cartagoHighlands: MapCoordinates = { longitude: -83.892, latitude: 9.918 };

export function FarmMappingScreen() {
  const translate = useTranslations("farmMapping");
  const [state, dispatch] = useReducer(farmMappingReducer, initialFarmMappingState);
  const [drawingKind, setDrawingKind] = useState<ShapeKind | null>(null);
  const mapRef = useRef<SatelliteMapHandle>(null);

  function formatDefaultLotName(number: number) {
    return translate("lots.defaultName", { number });
  }

  function startDrawing(kind: ShapeKind) {
    mapRef.current?.startDrawing(kind);
    setDrawingKind(kind);
  }

  function stopDrawing() {
    mapRef.current?.stopDrawing();
    setDrawingKind(null);
  }

  function handleFarmFinished(shape: FinishedShape) {
    setDrawingKind(null);
    dispatch({
      type: "boundaryFinished",
      shapeId: shape.shapeId,
      geometry: shape.geometry,
      areaInHectares: calculateAreaInHectares(shape.geometry),
    });
  }

  function handleLotFinished(shape: FinishedShape) {
    if (!state.farmBoundary) {
      mapRef.current?.removeShapes([shape.shapeId]);
      return;
    }
    const existingLots = state.lots.map((lot) => ({
      name: lotDisplayName(lot, formatDefaultLotName),
      geometry: lot.geometry,
    }));
    const validation = validateLot(shape.geometry, state.farmBoundary.geometry, existingLots);
    if (!validation.isValid) {
      mapRef.current?.removeShapes([shape.shapeId]);
      dispatch({ type: "lotRejected", validation });
      return;
    }
    mapRef.current?.paintLot(shape.shapeId, pickLotColor(state.lastLotNumber + 1));
    dispatch({
      type: "lotAccepted",
      shapeId: shape.shapeId,
      geometry: shape.geometry,
      areaInHectares: calculateAreaInHectares(shape.geometry),
    });
  }

  function handleShapeFinished(shape: FinishedShape) {
    if (shape.kind === "farm") {
      handleFarmFinished(shape);
    } else {
      handleLotFinished(shape);
    }
  }

  function handleRemoveLot(shapeId: string) {
    mapRef.current?.removeShapes([shapeId]);
    dispatch({ type: "lotRemoved", shapeId });
  }

  function handleRedrawFarm() {
    if (!window.confirm(translate("lots.redrawConfirm"))) {
      return;
    }
    const shapeIds = [state.farmBoundary?.shapeId, ...state.lots.map((lot) => lot.shapeId)];
    mapRef.current?.removeShapes(shapeIds.filter((shapeId): shapeId is string => Boolean(shapeId)));
    dispatch({ type: "boundaryReset" });
  }

  function handleConfirmLocation() {
    const center = mapRef.current?.getCenter();
    if (center) {
      mapRef.current?.flyTo(center);
    }
    dispatch({ type: "locationConfirmed" });
  }

  function handleChangeLocation() {
    stopDrawing();
    dispatch({ type: "locationChangeRequested" });
  }

  return (
    <div className="farm-mapping">
      <section className="farm-mapping__panel">
        <header className="panel-header">
          <span className="brand">ProdTerra</span>
          <LanguageSwitcher />
        </header>
        <StepIndicator currentStep={state.step} />

        {state.step === "locate" && (
          <LocateStep
            onMoveMap={(coordinates) => mapRef.current?.flyTo(coordinates)}
            onConfirm={handleConfirmLocation}
          />
        )}
        {state.step === "boundary" && (
          <BoundaryStep
            isDrawing={drawingKind === "farm"}
            onStartDrawing={() => startDrawing("farm")}
            onUndoLastPoint={() => mapRef.current?.undoLastPoint()}
            onCancelDrawing={stopDrawing}
            onChangeLocation={handleChangeLocation}
          />
        )}
        {state.step === "lots" && state.farmBoundary && (
          <LotsStep
            farmBoundary={state.farmBoundary}
            lots={state.lots}
            rejection={state.rejection}
            isDrawing={drawingKind === "lot"}
            onStartDrawing={() => startDrawing("lot")}
            onStopDrawing={stopDrawing}
            onUndoLastPoint={() => mapRef.current?.undoLastPoint()}
            onRenameLot={(shapeId, name) => dispatch({ type: "lotRenamed", shapeId, name })}
            onRemoveLot={handleRemoveLot}
            onDismissRejection={() => dispatch({ type: "rejectionDismissed" })}
            onRedrawFarm={handleRedrawFarm}
          />
        )}
      </section>

      <div className="farm-mapping__map" data-drawing={drawingKind ?? undefined}>
        <SatelliteMap
          handleRef={mapRef}
          initialCenter={cartagoHighlands}
          onShapeFinished={handleShapeFinished}
          label={translate("mapLabel")}
        />
        {state.step === "locate" && <span aria-hidden className="map-crosshair" />}
        {drawingKind && (
          <p role="status" className="map-hint">
            {drawingKind === "farm" ? translate("boundary.drawingHint") : translate("lots.drawingHint")}
          </p>
        )}
      </div>
    </div>
  );
}
