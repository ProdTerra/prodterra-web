"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Dialog } from "@/shared/components/Dialog";
import { AccountMenu } from "@/features/account/components/AccountMenu";
import { SavePlanButton } from "@/features/saved-farms/components/SavePlanButton";
import { CalendarStep } from "@/features/calendar/components/CalendarStep";
import { FarmerCalendarStep } from "@/features/rotation-plan/components/FarmerCalendarStep";
import { PlanStep } from "@/features/rotation-plan/components/PlanStep";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import {
  farmMappingReducer,
  initialFarmMappingState,
  type FarmMappingState,
  type Lot,
  type LotRejection,
} from "../application/farmMappingState";
import { lotDisplayName } from "../application/lotDisplayName";
import { calculateAreaInHectares, validateLot } from "../domain/farmGeometry";
import { maximumFarmAreaInHectares, validateFarmArea } from "../domain/farmLimits";
import { pickLotColor } from "../domain/lotColors";
import {
  splitFarm,
  type SplitLayout,
} from "../domain/splitFarm";
import type {
  FinishedShape,
  RestorableShape,
  ShapeKind,
} from "../infrastructure/drawingSession";
import {
  getBrowserStorage,
  loadFarmDraft,
  loadMapView,
  saveFarmDraft,
  saveMapView,
  type MapView,
} from "../infrastructure/farmDraftStorage";
import { BoundaryStep } from "./BoundaryStep";
import { FarmSummaryDialog } from "./FarmSummaryDialog";
import { LocateStep } from "./LocateStep";
import { LotsStep } from "./LotsStep";
import { MapPositionChip } from "./MapPositionChip";
import type {
  LotLabel,
  MapCoordinates,
  SatelliteMapHandle,
} from "./SatelliteMap";
import { StepIndicator } from "./StepIndicator";

const SatelliteMap = dynamic(() => import("./SatelliteMap"), { ssr: false });

const defaultSplitLotCount = 4;

const formSteps = new Set<FarmMappingState["step"]>(["plan", "myCalendar", "analysis"]);

const cartagoHighlandsView: MapView = {
  longitude: -83.892,
  latitude: 9.918,
  zoom: 13,
};

function toRestorableShapes(draft: FarmMappingState): RestorableShape[] {
  if (!draft.farmBoundary) {
    return [];
  }
  return [
    {
      kind: "farm",
      shapeId: draft.farmBoundary.shapeId,
      geometry: draft.farmBoundary.geometry,
    },
    ...draft.lots.map((lot) => ({
      kind: "lot" as const,
      shapeId: lot.shapeId,
      geometry: lot.geometry,
      color: lot.color,
    })),
  ];
}

function labelPositionOf(lot: Lot): MapCoordinates {
  const ring = lot.geometry.coordinates[0].slice(0, -1);
  const longitude =
    ring.reduce((sum, [ringLongitude]) => sum + ringLongitude, 0) / ring.length;
  const latitude =
    ring.reduce((sum, [, ringLatitude]) => sum + ringLatitude, 0) / ring.length;
  return { longitude, latitude };
}

function toLotLabels(lots: Lot[]): LotLabel[] {
  return lots.map((lot) => ({
    shapeId: lot.shapeId,
    text: String(lot.number),
    color: lot.color,
    position: labelPositionOf(lot),
  }));
}

function readInitialMapView(): MapView {
  const storage = typeof window === "undefined" ? null : getBrowserStorage();
  return (storage && loadMapView(storage)) ?? cartagoHighlandsView;
}

export function FarmMappingScreen() {
  const translate = useTranslations("farmMapping");
  const locale = useLocale();
  const [state, dispatch] = useReducer(
    farmMappingReducer,
    initialFarmMappingState,
  );
  const [drawingKind, setDrawingKind] = useState<ShapeKind | null>(null);
  const [canCloseShape, setCanCloseShape] = useState(false);
  const [isRedrawConfirmOpen, setIsRedrawConfirmOpen] = useState(false);
  const [isReplaceConfirmOpen, setIsReplaceConfirmOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [farmAreaRejection, setFarmAreaRejection] = useState<"tooLarge" | "tooSmall" | null>(null);
  const [split, setSplit] = useState<{
    lotCount: number;
    layout: SplitLayout;
  } | null>(null);
  const mapRef = useRef<SatelliteMapHandle>(null);
  const [initialMapView] = useState(readInitialMapView);
  const [mapCenter, setMapCenter] = useState<MapCoordinates>(initialMapView);
  const [isMapReady, setIsMapReady] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    screenRef.current?.scrollTo({ top: 0 });
  }, [state.step]);

  useEffect(() => {
    if (isMapReady) {
      mapRef.current?.setLotLabels(toLotLabels(state.lots));
    }
  }, [state.lots, isMapReady]);

  useEffect(() => {
    const storage = getBrowserStorage();
    const draft = storage && loadFarmDraft(storage);
    if (draft) {
      dispatch({ type: "draftRestored", draft });
    }
  }, []);

  useEffect(() => {
    const storage = getBrowserStorage();
    const isUntouchedInitialState = state === initialFarmMappingState;
    if (storage && !isUntouchedInitialState) {
      saveFarmDraft(storage, state);
    }
  }, [state]);

  function handleMapReady() {
    setIsMapReady(true);
    const storage = getBrowserStorage();
    const draft = storage && loadFarmDraft(storage);
    if (draft) {
      mapRef.current?.restoreShapes(toRestorableShapes(draft));
    }
    if (draft?.farmBoundary) {
      mapRef.current?.fitToArea(draft.farmBoundary.geometry);
    }
  }

  function handleMapViewChanged(view: MapView) {
    setMapCenter({ longitude: view.longitude, latitude: view.latitude });
    const storage = getBrowserStorage();
    if (storage) {
      saveMapView(storage, view);
    }
  }

  function formatDefaultLotName(number: number) {
    return translate("lots.defaultName", { number });
  }

  function startDrawing(kind: ShapeKind) {
    mapRef.current?.startDrawing(kind);
    setDrawingKind(kind);
    setCanCloseShape(false);
  }

  function stopDrawing() {
    mapRef.current?.stopDrawing();
    setDrawingKind(null);
    setCanCloseShape(false);
  }

  function handleFarmFinished(shape: FinishedShape) {
    setDrawingKind(null);
    const areaInHectares = calculateAreaInHectares(shape.geometry);
    const validation = validateFarmArea(areaInHectares);
    if (!validation.isValid) {
      mapRef.current?.removeShapes([shape.shapeId]);
      setFarmAreaRejection(validation.reason);
      return;
    }
    dispatch({
      type: "boundaryFinished",
      shapeId: shape.shapeId,
      geometry: shape.geometry,
      areaInHectares,
    });
  }

  function handleLotFinished(shape: FinishedShape) {
    if (!state.farmBoundary) {
      mapRef.current?.removeShapes([shape.shapeId]);
      return;
    }
    const existingLots = state.lots.map((lot) => ({
      lotNumber: lot.number,
      geometry: lot.geometry,
    }));
    const validation = validateLot(
      shape.geometry,
      state.farmBoundary.geometry,
      existingLots,
    );
    if (!validation.isValid) {
      mapRef.current?.removeShapes([shape.shapeId]);
      dispatch({ type: "lotRejected", validation });
      return;
    }
    mapRef.current?.paintLot(
      shape.shapeId,
      pickLotColor(state.lastLotNumber + 1),
    );
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

  function applySplit(lotCount: number, layout: SplitLayout) {
    if (!state.farmBoundary) {
      return;
    }
    const strips = splitFarm(
      state.farmBoundary.geometry,
      lotCount,
      layout,
    );
    const newLots = strips.map((geometry) => ({
      shapeId: crypto.randomUUID(),
      geometry,
      areaInHectares: calculateAreaInHectares(geometry),
    }));
    mapRef.current?.removeShapes(state.lots.map((lot) => lot.shapeId));
    mapRef.current?.restoreShapes(
      newLots.map((lot, index) => ({
        kind: "lot" as const,
        shapeId: lot.shapeId,
        geometry: lot.geometry,
        color: pickLotColor(index + 1),
      })),
    );
    dispatch({ type: "lotsReplaced", lots: newLots });
    setSplit({ lotCount, layout });
  }

  function startSplit() {
    stopDrawing();
    setIsReplaceConfirmOpen(false);
    applySplit(defaultSplitLotCount, "along");
  }

  function requestSplit() {
    if (state.lots.length > 0) {
      setIsReplaceConfirmOpen(true);
      return;
    }
    startSplit();
  }

  function handleRedrawFarm() {
    setIsRedrawConfirmOpen(false);
    setSplit(null);
    const shapeIds = [
      state.farmBoundary?.shapeId,
      ...state.lots.map((lot) => lot.shapeId),
    ];
    mapRef.current?.removeShapes(
      shapeIds.filter((shapeId): shapeId is string => Boolean(shapeId)),
    );
    dispatch({ type: "boundaryReset" });
  }

  const handleMapTapped = useCallback(
    (point: MapCoordinates) => {
      if (state.step === "locate") {
        mapRef.current?.flyTo(point);
      }
    },
    [state.step],
  );

  function handleConfirmLocation() {
    const center = mapRef.current?.getCenter();
    if (center) {
      mapRef.current?.flyTo(center);
    }
    dispatch({ type: "locationConfirmed" });
  }

  function describeRejection(rejection: LotRejection): {
    title: string;
    description: string;
  } {
    if (rejection.reason === "outsideFarm") {
      return {
        title: translate("lots.rejection.outsideFarmTitle"),
        description: translate("lots.rejection.outsideFarm"),
      };
    }
    const overlappedLot = state.lots.find(
      (lot: Lot) => lot.number === rejection.overlappedLotNumber,
    );
    const lotName = overlappedLot
      ? lotDisplayName(overlappedLot, formatDefaultLotName)
      : formatDefaultLotName(rejection.overlappedLotNumber);
    return {
      title: translate("lots.rejection.overlapsLotTitle"),
      description: translate("lots.rejection.overlapsLot", { lotName }),
    };
  }

  const isFormStep = formSteps.has(state.step);
  const rejectionMessage = state.rejection
    ? describeRejection(state.rejection)
    : null;

  function handleChangeLocation() {
    stopDrawing();
    dispatch({ type: "locationChangeRequested" });
  }

  return (
    <div ref={screenRef} className="farm-mapping" data-layout={isFormStep ? "form" : "map"}>
      <section className="farm-mapping__panel" data-step={state.step}>
        <header className="panel-header">
          <span className="brand">ProdTerra</span>
          <div className="panel-header__actions">
            <LanguageSwitcher />
            <AccountMenu />
          </div>
        </header>
        <StepIndicator currentStep={state.step} />

        {state.step === "locate" && (
          <LocateStep
            onMoveMap={(coordinates, zoom) => mapRef.current?.flyTo(coordinates, zoom)}
            onConfirm={handleConfirmLocation}
          />
        )}
        {state.step === "boundary" && (
          <BoundaryStep
            isDrawing={drawingKind === "farm"}
            canCloseShape={canCloseShape}
            onCloseShape={() => mapRef.current?.closeShape()}
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
            isDrawing={drawingKind === "lot"}
            canCloseShape={canCloseShape}
            onCloseShape={() => mapRef.current?.closeShape()}
            onStartDrawing={() => startDrawing("lot")}
            onStopDrawing={stopDrawing}
            onUndoLastPoint={() => mapRef.current?.undoLastPoint()}
            onRenameLot={(shapeId, name) =>
              dispatch({ type: "lotRenamed", shapeId, name })
            }
            onRemoveLot={handleRemoveLot}
            onRedrawFarm={() => setIsRedrawConfirmOpen(true)}
            split={split}
            onStartSplit={requestSplit}
            onChangeSplit={applySplit}
            onFinishSplit={() => setSplit(null)}
            onContinue={() => {
              stopDrawing();
              setIsSummaryOpen(true);
            }}
          />
        )}
        {state.step === "plan" && (
          <PlanStep
            lots={state.lots}
            onEditLots={() => dispatch({ type: "lotsEditRequested" })}
            onContinue={() => dispatch({ type: "planConfirmed" })}
          />
        )}
        {state.step === "myCalendar" && (
          <FarmerCalendarStep
            lots={state.lots}
            onEditPlan={() => dispatch({ type: "planEditRequested" })}
            onAnalyze={() => dispatch({ type: "analysisRequested" })}
          />
        )}
        {state.step === "analysis" && (
          <CalendarStep
            lots={state.lots}
            onBack={() => dispatch({ type: "myCalendarRequested" })}
            actions={<SavePlanButton farmState={state} />}
          />
        )}
      </section>

      {!isFormStep && (
        <div
          className="farm-mapping__map"
          data-drawing={drawingKind ?? undefined}
        >
          <SatelliteMap
            handleRef={mapRef}
            initialView={initialMapView}
            onReady={handleMapReady}
            onViewChanged={handleMapViewChanged}
            onShapeFinished={handleShapeFinished}
            onDrawingProgress={setCanCloseShape}
            onMapTapped={handleMapTapped}
            label={translate("mapLabel")}
            language={locale}
          />
          <span
            aria-hidden
            className="map-crosshair"
            data-subtle={state.step !== "locate" || undefined}
          />
          {isMapReady && <MapPositionChip center={mapCenter} />}
          {drawingKind && (
            <p role="status" className="map-hint">
              {drawingKind === "farm"
                ? translate("boundary.drawingHint")
                : translate("lots.drawingHint")}
            </p>
          )}
        </div>
      )}

      {state.farmBoundary && (
        <FarmSummaryDialog
          isOpen={isSummaryOpen}
          farmBoundary={state.farmBoundary.geometry}
          farmAreaInHectares={state.farmBoundary.areaInHectares}
          lots={state.lots}
          onClose={() => setIsSummaryOpen(false)}
          onContinue={() => {
            setIsSummaryOpen(false);
            setIsMapReady(false);
            dispatch({ type: "lotsConfirmed" });
          }}
        />
      )}
      <Dialog
        isOpen={farmAreaRejection !== null}
        tone="info"
        title={translate(farmAreaRejection === "tooSmall" ? "boundary.tooSmallTitle" : "boundary.tooLargeTitle")}
        description={translate(farmAreaRejection === "tooSmall" ? "boundary.tooSmall" : "boundary.tooLarge", {
          maximum: new Intl.NumberFormat(locale, { useGrouping: "always" }).format(maximumFarmAreaInHectares),
        })}
        confirmLabel={translate("boundary.tryAgain")}
        onConfirm={() => setFarmAreaRejection(null)}
      />
      <Dialog
        isOpen={isRedrawConfirmOpen}
        tone="danger"
        title={translate("lots.redrawDialog.title")}
        description={translate("lots.redrawDialog.description", {
          count: state.lots.length,
        })}
        confirmLabel={translate("lots.redrawDialog.confirm")}
        cancelLabel={translate("lots.redrawDialog.cancel")}
        onConfirm={handleRedrawFarm}
        onCancel={() => setIsRedrawConfirmOpen(false)}
      />
      <Dialog
        isOpen={isReplaceConfirmOpen}
        tone="danger"
        title={translate("split.replaceDialog.title")}
        description={translate("split.replaceDialog.description", {
          count: state.lots.length,
        })}
        confirmLabel={translate("split.replaceDialog.confirm")}
        cancelLabel={translate("split.replaceDialog.cancel")}
        onConfirm={startSplit}
        onCancel={() => setIsReplaceConfirmOpen(false)}
      />
      <Dialog
        isOpen={rejectionMessage !== null}
        tone="info"
        title={rejectionMessage?.title ?? ""}
        description={rejectionMessage?.description ?? ""}
        confirmLabel={translate("lots.rejection.dismiss")}
        onConfirm={() => dispatch({ type: "rejectionDismissed" })}
      />
    </div>
  );
}
