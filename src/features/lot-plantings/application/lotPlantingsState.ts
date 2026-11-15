import {
  emptyLotPlanting,
  type CurrentUse,
  type LotPlanting,
  type PreviousUse,
} from "../domain/lotPlanting";

export type LotPlantingsState = Record<string, LotPlanting>;

export type LotPlantingsAction =
  | { type: "currentUseChosen"; shapeId: string; currentUse: CurrentUse }
  | { type: "plantingMonthChosen"; shapeId: string; plantedOn: string }
  | { type: "previousUseChosen"; shapeId: string; previousUse: PreviousUse }
  | { type: "irrigationChosen"; shapeId: string; hasIrrigation: boolean }
  | { type: "appliedToAllLots"; fromShapeId: string; shapeIds: string[] }
  | { type: "lotsChanged"; shapeIds: string[] }
  | { type: "plantingsRestored"; plantings: LotPlantingsState };

export function planningFor(state: LotPlantingsState, shapeId: string): LotPlanting {
  return state[shapeId] ?? emptyLotPlanting;
}

function updateLot(
  state: LotPlantingsState,
  shapeId: string,
  changes: Partial<LotPlanting>,
): LotPlantingsState {
  return { ...state, [shapeId]: { ...planningFor(state, shapeId), ...changes } };
}

export function lotPlantingsReducer(state: LotPlantingsState, action: LotPlantingsAction): LotPlantingsState {
  switch (action.type) {
    case "currentUseChosen":
      return updateLot(state, action.shapeId, {
        currentUse: action.currentUse,
        ...(action.currentUse.kind === "fallow" ? { plantedOn: null } : {}),
      });
    case "plantingMonthChosen":
      return updateLot(state, action.shapeId, { plantedOn: action.plantedOn });
    case "previousUseChosen":
      return updateLot(state, action.shapeId, { previousUse: action.previousUse });
    case "irrigationChosen":
      return updateLot(state, action.shapeId, { hasIrrigation: action.hasIrrigation });
    case "appliedToAllLots": {
      const source = planningFor(state, action.fromShapeId);
      return Object.fromEntries(action.shapeIds.map((shapeId) => [shapeId, { ...source }]));
    }
    case "lotsChanged":
      return Object.fromEntries(
        Object.entries(state).filter(([shapeId]) => action.shapeIds.includes(shapeId)),
      );
    case "plantingsRestored":
      return action.plantings;
  }
}
