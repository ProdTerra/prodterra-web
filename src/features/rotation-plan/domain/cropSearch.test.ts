import { describe, expect, it } from "vitest";
import { searchCrops } from "./cropSearch";

const crops = [
  { key: "broccoli", name: "Brócoli" },
  { key: "cabbage", name: "Repollo" },
  { key: "potato", name: "Papa" },
  { key: "sweet-potato", name: "Camote" },
  { key: "papaya", name: "Papaya" },
];

describe("searchCrops", () => {
  it("finds crops ignoring accents and capital letters, best matches first", () => {
    expect(searchCrops(crops, "broco").map((crop) => crop.key)).toEqual(["broccoli"]);
    expect(searchCrops(crops, "PAPA").map((crop) => crop.key)).toEqual(["potato", "papaya"]);
    expect(searchCrops(crops, "llo").map((crop) => crop.key)).toEqual(["cabbage"]);
  });

  it("lists every crop alphabetically when the search is empty", () => {
    expect(searchCrops(crops, "  ").map((crop) => crop.name)).toEqual(["Brócoli", "Camote", "Papa", "Papaya", "Repollo"]);
  });
});
