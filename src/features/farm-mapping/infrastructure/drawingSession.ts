import type { Map as MapLibreMap } from "maplibre-gl";
import type { Polygon } from "geojson";
import {
  TerraDraw,
  TerraDrawModeUndoRedo,
  TerraDrawPolygonMode,
  ValidateNotSelfIntersecting,
  type GeoJSONStoreFeatures,
  type HexColor,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";

export type ShapeKind = "farm" | "lot";

export type FinishedShape = {
  kind: ShapeKind;
  shapeId: string;
  geometry: Polygon;
};

export type RestorableShape = {
  kind: ShapeKind;
  shapeId: string;
  geometry: Polygon;
  color?: string;
};

export type DrawingSessionCallbacks = {
  onShapeFinished: (shape: FinishedShape) => void;
  onDrawingProgress: (canClose: boolean) => void;
};

export type DrawingSession = {
  startDrawing: (kind: ShapeKind) => void;
  closeShape: () => void;
  stopDrawing: () => void;
  undoLastPoint: () => void;
  removeShapes: (shapeIds: string[]) => void;
  paintLot: (shapeId: string, color: string) => void;
  restoreShapes: (shapes: RestorableShape[]) => void;
  destroy: () => void;
};

const farmTapeColor: HexColor = "#F2B705";
const lotOutlineColor: HexColor = "#FFFFFF";
const unpaintedLotColor: HexColor = "#FFFFFF";
const staticModeName = "static";
const finishKey = "Enter";
const ringLengthWithThreeCorners = 5;

export const drawingLayerPrefix = "farm-drawing";

function readLotColor(feature: GeoJSONStoreFeatures): HexColor {
  const color = feature.properties.color;
  return typeof color === "string" && color.startsWith("#")
    ? (color as HexColor)
    : unpaintedLotColor;
}

function rejectSelfIntersecting(
  feature: GeoJSONStoreFeatures,
  { updateType }: { updateType: string },
) {
  if (updateType === "finish" || updateType === "commit") {
    return ValidateNotSelfIntersecting(feature);
  }
  return { valid: true };
}

function createFarmMode() {
  return new TerraDrawPolygonMode({
    modeName: "farm",
    snapping: { toCoordinate: true, toLine: true },
    validation: rejectSelfIntersecting,
    styles: {
      fillColor: farmTapeColor,
      fillOpacity: 0.08,
      outlineColor: farmTapeColor,
      outlineWidth: 4,
      closingPointColor: farmTapeColor,
      closingPointWidth: 9,
      closingPointOutlineColor: "#161A15",
      closingPointOutlineWidth: 2,
      coordinatePointColor: farmTapeColor,
      coordinatePointWidth: 5,
    },
  });
}

function createLotMode() {
  return new TerraDrawPolygonMode({
    modeName: "lot",
    snapping: { toCoordinate: true, toLine: true },
    validation: rejectSelfIntersecting,
    styles: {
      fillColor: readLotColor,
      fillOpacity: 0.4,
      outlineColor: lotOutlineColor,
      outlineWidth: 2,
      closingPointColor: lotOutlineColor,
      closingPointWidth: 8,
      closingPointOutlineColor: "#161A15",
      closingPointOutlineWidth: 2,
    },
  });
}

function isPolygonFeature(
  feature: GeoJSONStoreFeatures | undefined,
): feature is GeoJSONStoreFeatures & { geometry: Polygon } {
  return feature?.geometry.type === "Polygon";
}

function toStoreFeature(shape: RestorableShape): GeoJSONStoreFeatures {
  const properties: GeoJSONStoreFeatures["properties"] = { mode: shape.kind };
  if (shape.color) {
    properties.color = shape.color;
  }
  return { id: shape.shapeId, type: "Feature", geometry: shape.geometry, properties };
}

function hasEnoughCornersToClose(features: GeoJSONStoreFeatures[]): boolean {
  const drawingFeature = features.find((feature) => feature.properties.currentlyDrawing === true);
  if (drawingFeature?.geometry.type !== "Polygon") {
    return false;
  }
  return drawingFeature.geometry.coordinates[0].length >= ringLengthWithThreeCorners;
}

export function createDrawingSession(
  map: MapLibreMap,
  callbacks: DrawingSessionCallbacks,
): DrawingSession {
  const drawingModes = { farm: createFarmMode(), lot: createLotMode() };
  const draw = new TerraDraw({
    adapter: new TerraDrawMapLibreGLAdapter({ map, prefixId: drawingLayerPrefix }),
    modes: [drawingModes.farm, drawingModes.lot],
    undoRedo: { modeLevel: new TerraDrawModeUndoRedo() },
  });
  draw.start();

  draw.on("change", () => {
    callbacks.onDrawingProgress(hasEnoughCornersToClose(draw.getSnapshot()));
  });

  draw.on("finish", (shapeId, context) => {
    if (context.action !== "draw") {
      return;
    }
    const feature = draw.getSnapshotFeature(shapeId);
    if (!isPolygonFeature(feature)) {
      return;
    }
    const kind: ShapeKind = feature.properties.mode === "farm" ? "farm" : "lot";
    if (kind === "farm") {
      draw.setMode(staticModeName);
    }
    callbacks.onDrawingProgress(false);
    callbacks.onShapeFinished({ kind, shapeId: String(shapeId), geometry: feature.geometry });
  });

  return {
    startDrawing: (kind) => draw.setMode(kind),
    closeShape: () => {
      const activeMode = draw.getMode();
      if (activeMode === "farm" || activeMode === "lot") {
        drawingModes[activeMode].onKeyUp({ key: finishKey, heldKeys: [], preventDefault: () => {} });
      }
    },
    stopDrawing: () => {
      draw.setMode(staticModeName);
      callbacks.onDrawingProgress(false);
    },
    undoLastPoint: () => {
      draw.undo();
    },
    removeShapes: (shapeIds) => {
      const existingIds = shapeIds.filter((shapeId) => draw.hasFeature(shapeId));
      if (existingIds.length > 0) {
        draw.removeFeatures(existingIds);
      }
    },
    paintLot: (shapeId, color) => draw.updateFeatureProperties(shapeId, { color }),
    restoreShapes: (shapes) => {
      draw.addFeatures(shapes.map(toStoreFeature));
    },
    destroy: () => draw.stop(),
  };
}
