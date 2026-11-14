"use client";

import { Map as MapLibreMap, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import {
  createDrawingSession,
  type DrawingSession,
  type FinishedShape,
  type ShapeKind,
} from "../infrastructure/drawingSession";
import { createSatelliteStyle } from "../infrastructure/satelliteBasemap";

export type MapCoordinates = { longitude: number; latitude: number };

export type SatelliteMapHandle = {
  flyTo: (coordinates: MapCoordinates) => void;
  getCenter: () => MapCoordinates | null;
  startDrawing: (kind: ShapeKind) => void;
  stopDrawing: () => void;
  undoLastPoint: () => void;
  removeShapes: (shapeIds: string[]) => void;
  paintLot: (shapeId: string, color: string) => void;
};

type SatelliteMapProps = {
  initialCenter: MapCoordinates;
  onShapeFinished: (shape: FinishedShape) => void;
  label: string;
  handleRef: Ref<SatelliteMapHandle>;
};

const mapWorkerUrl = "/vendor/maplibre-gl-worker.mjs";
const initialZoom = 13;

setWorkerUrl(mapWorkerUrl);
const farmZoom = 17;

export default function SatelliteMap({
  initialCenter,
  onShapeFinished,
  label,
  handleRef,
}: SatelliteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const drawingRef = useRef<DrawingSession | null>(null);
  const onShapeFinishedRef = useRef(onShapeFinished);

  useEffect(() => {
    onShapeFinishedRef.current = onShapeFinished;
  }, [onShapeFinished]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const map = new MapLibreMap({
      container: containerRef.current,
      style: createSatelliteStyle(),
      center: [initialCenter.longitude, initialCenter.latitude],
      zoom: initialZoom,
      maxZoom: 19,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      drawingRef.current = createDrawingSession(map, (shape) =>
        onShapeFinishedRef.current(shape),
      );
    });
    mapRef.current = map;

    return () => {
      drawingRef.current?.destroy();
      drawingRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [initialCenter.latitude, initialCenter.longitude]);

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
      stopDrawing: () => drawingRef.current?.stopDrawing(),
      undoLastPoint: () => drawingRef.current?.undoLastPoint(),
      removeShapes: (shapeIds) => drawingRef.current?.removeShapes(shapeIds),
      paintLot: (shapeId, color) => drawingRef.current?.paintLot(shapeId, color),
    }),
    [],
  );

  return <div ref={containerRef} role="application" aria-label={label} className="h-full w-full" />;
}
