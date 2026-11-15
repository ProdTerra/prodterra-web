import type { Polygon } from "geojson";
import type { LotValidation } from "../domain/farmGeometry";
import { pickLotColor } from "../domain/lotColors";

export type FarmMappingStep = "locate" | "boundary" | "lots";

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
  | { type: "draftRestored"; draft: FarmMappingState };

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
      const lot: Lot = { ...toShape(action), number, color: pickLotColor(number), customName: "" };
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
    case "draftRestored":
      return { ...action.draft, rejection: null };
  }
}
