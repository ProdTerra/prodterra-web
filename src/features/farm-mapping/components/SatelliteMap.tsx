"use client";

import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import {
  createDrawingSession,
  drawingLayerPrefix,
  type DrawingSession,
  type FinishedShape,
  type RestorableShape,
  type ShapeKind,
} from "../infrastructure/drawingSession";
import type { MapView } from "../infrastructure/farmDraftStorage";
import { createSatelliteStyleUrl } from "../infrastructure/satelliteBasemap";

export type MapCoordinates = { longitude: number; latitude: number };

export type SatelliteMapHandle = {
  flyTo: (coordinates: MapCoordinates) => void;
  getCenter: () => MapCoordinates | null;
  startDrawing: (kind: ShapeKind) => void;
  closeShape: () => void;
  stopDrawing: () => void;
  undoLastPoint: () => void;
  removeShapes: (shapeIds: string[]) => void;
  paintLot: (shapeId: string, color: string) => void;
  restoreShapes: (shapes: RestorableShape[]) => void;
};

type SatelliteMapProps = {
  initialView: MapView;
  onReady: () => void;
  onViewChanged: (view: MapView) => void;
  onShapeFinished: (shape: FinishedShape) => void;
  onDrawingProgress: (canClose: boolean) => void;
  label: string;
  language: string;
  handleRef: Ref<SatelliteMapHandle>;
};

const mapWorkerUrl = "/vendor/maplibre-gl-worker.mjs";

setWorkerUrl(mapWorkerUrl);
const farmZoom = 17;

function collapseAttribution(map: MapLibreMap) {
  const openAttributionButton = map
    .getContainer()
    .querySelector<HTMLButtonElement>(".maplibregl-compact-show .maplibregl-ctrl-attrib-button");
  openAttributionButton?.click();
}

function keepDrawingLayers(
  previousStyle: StyleSpecification | undefined,
  nextStyle: StyleSpecification,
): StyleSpecification {
  if (!previousStyle) {
    return nextStyle;
  }
  const isDrawingId = (id: string) => id.startsWith(drawingLayerPrefix);
  const drawingSources = Object.fromEntries(
    Object.entries(previousStyle.sources).filter(([sourceId]) => isDrawingId(sourceId)),
  );
  const drawingLayers = previousStyle.layers.filter((layer) => isDrawingId(layer.id));
  return {
    ...nextStyle,
    sources: { ...nextStyle.sources, ...drawingSources },
    layers: [...nextStyle.layers, ...drawingLayers],
  };
}

export default function SatelliteMap({
  initialView,
  onReady,
  onViewChanged,
  onShapeFinished,
  onDrawingProgress,
  label,
  language,
  handleRef,
}: SatelliteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const drawingRef = useRef<DrawingSession | null>(null);
  const callbacksRef = useRef({ onReady, onViewChanged, onShapeFinished, onDrawingProgress });
  const initialViewRef = useRef(initialView);
  const initialLanguageRef = useRef(language);

  useEffect(() => {
    callbacksRef.current = { onReady, onViewChanged, onShapeFinished, onDrawingProgress };
  }, [onReady, onViewChanged, onShapeFinished, onDrawingProgress]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const map = new MapLibreMap({
      container: containerRef.current,
      style: createSatelliteStyleUrl(initialLanguageRef.current),
      center: [initialViewRef.current.longitude, initialViewRef.current.latitude],
      zoom: initialViewRef.current.zoom,
      maxZoom: 19,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => {
      drawingRef.current = createDrawingSession(map, {
        onShapeFinished: (shape) => callbacksRef.current.onShapeFinished(shape),
        onDrawingProgress: (canClose) => callbacksRef.current.onDrawingProgress(canClose),
      });
      callbacksRef.current.onReady();
    });
    map.once("idle", () => collapseAttribution(map));
    map.on("moveend", () => {
      const center = map.getCenter();
      callbacksRef.current.onViewChanged({
        longitude: center.lng,
        latitude: center.lat,
        zoom: map.getZoom(),
      });
    });
    mapRef.current = map;

    return () => {
      drawingRef.current?.destroy();
      drawingRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || language === initialLanguageRef.current) {
      return;
    }
    initialLanguageRef.current = language;
    map.setStyle(createSatelliteStyleUrl(language), { transformStyle: keepDrawingLayers });
  }, [language]);

  useImperativeHandle(
    handleRef,
    () => ({
      flyTo: ({ longitude, latitude }) =>
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: farmZoom }),
      getCenter: () => {
        const center = mapRef.current?.getCenter();
        return center ? { longitude: center.lng, latitude: center.lat } : null;
      },
      startDrawing: (kind) => drawingRef.current?.startDrawing(kind),
      closeShape: () => drawingRef.current?.closeShape(),
      stopDrawing: () => drawingRef.current?.stopDrawing(),
      undoLastPoint: () => drawingRef.current?.undoLastPoint(),
      removeShapes: (shapeIds) => drawingRef.current?.removeShapes(shapeIds),
      paintLot: (shapeId, color) => drawingRef.current?.paintLot(shapeId, color),
      restoreShapes: (shapes) => drawingRef.current?.restoreShapes(shapes),
    }),
    [],
  );

  return (
    <>
      <div ref={containerRef} role="application" aria-label={label} className="h-full w-full" />
      <span className="map-powered-by">Powered by Esri</span>
    </>
  );
}
