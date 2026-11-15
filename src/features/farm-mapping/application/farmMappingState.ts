import type { Polygon } from "geojson";
import type { LotValidation } from "../domain/farmGeometry";
import { pickLotColor } from "../domain/lotColors";

export type FarmMappingStep = "locate" | "boundary" | "lots" | "crops";

export type DrawnShape = {
  shapeId: string;
  geometry: Polygon;
  areaInHectares: number;
};

export type Lot = DrawnShape & {
  number: number;
  color: string;
  customName: string;
};

type RejectedLotValidation = Extract<LotValidation, { isValid: false }>;

type WithoutValidityFlag<Validation> = Validation extends unknown
  ? Omit<Validation, "isValid">
  : never;

export type LotRejection = WithoutValidityFlag<RejectedLotValidation>;

export type FarmMappingState = {
  step: FarmMappingStep;
  farmBoundary: DrawnShape | null;
  lots: Lot[];
  lastLotNumber: number;
  rejection: LotRejection | null;
};

export type FarmMappingAction =
  | { type: "locationConfirmed" }
  | { type: "locationChangeRequested" }
  | ({ type: "boundaryFinished" } & DrawnShape)
  | { type: "boundaryReset" }
  | ({ type: "lotAccepted" } & DrawnShape)
  | { type: "lotRejected"; validation: RejectedLotValidation }
  | { type: "lotRenamed"; shapeId: string; name: string }
  | { type: "lotRemoved"; shapeId: string }
  | { type: "rejectionDismissed" }
  | { type: "draftRestored"; draft: FarmMappingState }
  | { type: "lotsReplaced"; lots: DrawnShape[] }
  | { type: "lotsConfirmed" }
  | { type: "lotsEditRequested" };

export const initialFarmMappingState: FarmMappingState = {
  step: "locate",
  farmBoundary: null,
  lots: [],
  lastLotNumber: 0,
  rejection: null,
};

function toShape({ shapeId, geometry, areaInHectares }: DrawnShape): DrawnShape {
  return { shapeId, geometry, areaInHectares };
}

function toLot(shape: DrawnShape, number: number): Lot {
  return { ...toShape(shape), number, color: pickLotColor(number), customName: "" };
}

function toRejection(validation: RejectedLotValidation): LotRejection {
  if (validation.reason === "overlapsLot") {
    return { reason: validation.reason, overlappedLotNumber: validation.overlappedLotNumber };
  }
  return { reason: validation.reason };
}

export function farmMappingReducer(
  state: FarmMappingState,
  action: FarmMappingAction,
): FarmMappingState {
  switch (action.type) {
    case "locationConfirmed":
      return { ...state, step: state.farmBoundary ? "lots" : "boundary" };
    case "locationChangeRequested":
      return { ...state, step: "locate" };
    case "boundaryFinished":
      return { ...state, step: "lots", farmBoundary: toShape(action) };
    case "boundaryReset":
      return { ...initialFarmMappingState, step: "boundary" };
    case "lotAccepted": {
      const number = state.lastLotNumber + 1;
      const lot = toLot(action, number);
      return { ...state, lots: [...state.lots, lot], lastLotNumber: number, rejection: null };
    }
    case "lotRejected":
      return { ...state, rejection: toRejection(action.validation) };
    case "lotRenamed":
      return {
        ...state,
        lots: state.lots.map((lot) =>
          lot.shapeId === action.shapeId ? { ...lot, customName: action.name } : lot,
        ),
      };
    case "lotRemoved":
      return { ...state, lots: state.lots.filter((lot) => lot.shapeId !== action.shapeId) };
    case "rejectionDismissed":
      return { ...state, rejection: null };
    case "lotsReplaced": {
      const lots = action.lots.map((shape, index) => toLot(shape, index + 1));
      return { ...state, lots, lastLotNumber: lots.length, rejection: null };
    }
    case "lotsConfirmed":
      return state.lots.length > 0 ? { ...state, step: "crops" } : state;
    case "lotsEditRequested":
      return { ...state, step: "lots" };
    case "draftRestored":
      return { ...action.draft, rejection: null };
  }
}
