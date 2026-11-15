"use client";

import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import bbox from "@turf/bbox";
import type { Polygon } from "geojson";
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

export type LotLabel = {
  shapeId: string;
  text: string;
  color: string;
  position: MapCoordinates;
};

export type SatelliteMapHandle = {
  setLotLabels: (labels: LotLabel[]) => void;
  fitToArea: (area: Polygon) => void;
  flyTo: (coordinates: MapCoordinates, zoom?: number) => void;
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
  onMapTapped: (point: MapCoordinates) => void;
  label: string;
  language: string;
  handleRef: Ref<SatelliteMapHandle>;
};

const mapWorkerUrl = "/vendor/maplibre-gl-worker.mjs";

setWorkerUrl(mapWorkerUrl);
const farmZoom = 17;
const fitPaddingInPixels = 48;
const fitMaximumZoom = 18;

function createLabelElement(label: LotLabel): HTMLElement {
  const element = document.createElement("span");
  element.className = "lot-badge";
  element.textContent = label.text;
  element.style.setProperty("--lot-color", label.color);
  element.setAttribute("aria-hidden", "true");
  return element;
}

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
  onMapTapped,
  label,
  language,
  handleRef,
}: SatelliteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const drawingRef = useRef<DrawingSession | null>(null);
  const labelMarkersRef = useRef<Marker[]>([]);
  const callbacksRef = useRef({ onReady, onViewChanged, onShapeFinished, onDrawingProgress, onMapTapped });
  const initialViewRef = useRef(initialView);
  const initialLanguageRef = useRef(language);

  useEffect(() => {
    callbacksRef.current = { onReady, onViewChanged, onShapeFinished, onDrawingProgress, onMapTapped };
  }, [onReady, onViewChanged, onShapeFinished, onDrawingProgress, onMapTapped]);

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
    map.on("click", (event) => callbacksRef.current.onMapTapped({ longitude: event.lngLat.lng, latitude: event.lngLat.lat }));
    map.on("moveend", () => {
      const center = map.getCenter();
      callbacksRef.current.onViewChanged({
        longitude: center.lng,
        latitude: center.lat,
        zoom: map.getZoom(),
      });
    });
    mapRef.current = map;
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      labelMarkersRef.current.forEach((marker) => marker.remove());
      labelMarkersRef.current = [];
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
      fitToArea: (area) => {
        const [west, south, east, north] = bbox(area);
        mapRef.current?.fitBounds(
          [
            [west, south],
            [east, north],
          ],
          { padding: fitPaddingInPixels, maxZoom: fitMaximumZoom, animate: false },
        );
      },
      setLotLabels: (labels) => {
        const map = mapRef.current;
        labelMarkersRef.current.forEach((marker) => marker.remove());
        if (!map) {
          labelMarkersRef.current = [];
          return;
        }
        labelMarkersRef.current = labels.map((label) =>
          new Marker({ element: createLabelElement(label) })
            .setLngLat([label.position.longitude, label.position.latitude])
            .addTo(map),
        );
      },
      flyTo: ({ longitude, latitude }, zoom = farmZoom) =>
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom }),
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
