import { initialOrientation } from "../src/lib/globe-orientation";
import { describe, expect, it } from "vitest";
import { renderGlobe, isLand, isVisited } from "../src/lib/globe";
import visited from "../src/lib/data/globe-visited.json";
import { countries } from "../src/lib/profile";
import { surfaceBrightness } from "../src/lib/globe-lighting";

describe("ASCII globe geography", () => {
  it("generates visited polygons for the supplied travel entries", () => {
    expect([...visited.codes].sort()).toEqual(countries.map((country) => country.code).sort());
  });
  it("colours visited interiors without marking unvisited land or ocean", () => {
    expect(isVisited(35, 105)).toBe(true);
    expect(isVisited(60, 100)).toBe(true);
    expect(isVisited(22, 79)).toBe(true);
    expect(isVisited(48, 2)).toBe(false);
    expect(isVisited(0, -30)).toBe(false);
  });
  it("uses geographic land rather than a random texture", () => {
    expect(isLand(20, 0)).toBe(true);
    expect(isLand(0, -30)).toBe(false);
  });
  it("lights the upper-left surface and darkens the limb and night side", () => {
    const upperLeft = surfaceBrightness(-0.5, 0.5, Math.sqrt(0.5));
    const lowerRight = surfaceBrightness(0.5, -0.5, Math.sqrt(0.5));
    expect(upperLeft).toBeGreaterThan(lowerRight + 0.3);
    expect(surfaceBrightness(0, 0, 1)).toBeGreaterThan(
      surfaceBrightness(-0.99, 0, Math.sqrt(1 - 0.99 ** 2)),
    );
    expect(lowerRight).toBeGreaterThanOrEqual(0);
    expect(upperLeft).toBeLessThanOrEqual(1);
  });
  it("keeps lighting fixed while both ocean and visited surfaces rotate", () => {
    const first = renderGlobe(40, 20, initialOrientation(Math.PI / 2));
    const second = renderGlobe(40, 20, initialOrientation(-Math.PI / 2));
    const brightness = (frame: ReturnType<typeof renderGlobe>) =>
      frame.rows.flatMap((row) =>
        row.flatMap((run) => Array.from({ length: run.text.length }, () => run.brightness)),
      );
    expect(brightness(first)).toEqual(brightness(second));
    for (const kind of ["water", "land", "visited"]) {
      const levels = new Set(
        first.rows
          .flat()
          .filter((run) => run.kind === kind)
          .map((run) => run.brightness),
      );
      expect(levels.size).toBeGreaterThan(2);
    }
  });
  it("renders bounded ASCII frames with filled areas rather than stars", () => {
    const frame = renderGlobe(40, 20, initialOrientation(Math.PI / 2));
    expect(frame.rows).toHaveLength(20);
    expect(frame.rows.every((row) => row.map((run) => run.text).join("").length === 40)).toBe(true);
    const highlighted = frame.rows
      .flat()
      .filter((run) => run.kind === "visited")
      .map((run) => run.text)
      .join("");
    expect(highlighted.length).toBeGreaterThan(30);
    expect(highlighted).not.toContain("*");
    expect(frame.rows[0].every((run) => run.kind === "space")).toBe(true);
    const other = renderGlobe(40, 20, initialOrientation(-Math.PI / 2));
    expect(other.rows).not.toEqual(frame.rows);
    const farSideFill = other.rows
      .flat()
      .filter((run) => run.kind === "visited")
      .map((run) => run.text)
      .join("");
    expect(farSideFill.length).toBeLessThan(highlighted.length);
  });
});
