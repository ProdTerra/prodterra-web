import { describe, expect, it } from "vitest";
import { tileAt } from "./mapTiles";

describe("tileAt", () => {
  it("finds the web mercator tile that contains a point", () => {
    expect(tileAt({ longitude: -83.892, latitude: 9.918 }, 17)).toEqual({ zoom: 17, column: 34991, row: 61906 });
    expect(tileAt({ longitude: 0, latitude: 0 }, 1)).toEqual({ zoom: 1, column: 1, row: 1 });
  });
});
