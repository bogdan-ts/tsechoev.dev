import { describe, expect, it } from "vitest";
import { materialPalette } from "../src/lib/globe-materials";
import { glyphForeshortening, LIGHT_LEVELS, surfaceBrightness } from "../src/lib/globe-lighting";
import { forEachGlobeCell, type GlobeCell } from "../src/lib/globe";
import { initialOrientation } from "../src/lib/globe-orientation";

function rgb(color: string) {
  const components = color.match(/\d+/g);
  if (!components) throw new Error("Expected RGB color");
  return components.map(Number);
}

describe("illustration-style globe shading", () => {
  it("keeps sunlit land warm, visited land green and ocean cool", () => {
    const palette = materialPalette({ land: "#e5e8df", visited: "#b3d88e", water: "#477e9e" });
    expect(palette.land).toHaveLength(LIGHT_LEVELS);
    const land = rgb(palette.land[LIGHT_LEVELS - 1]);
    const visited = rgb(palette.visited[LIGHT_LEVELS - 1]);
    const water = rgb(palette.water[LIGHT_LEVELS - 1]);
    expect(land[0]).toBeGreaterThan(land[2] + 40);
    expect(visited[1]).toBeGreaterThan(visited[0]);
    expect(water[2]).toBeGreaterThan(water[0] + 40);
    expect(surfaceBrightness(-0.6, 0.5, Math.sqrt(0.39))).toBeGreaterThan(0.8);
    expect(surfaceBrightness(0.6, -0.5, Math.sqrt(0.39))).toBeLessThan(0.15);
  });
  it("compresses limb glyphs without collapsing the center or edges", () => {
    expect(glyphForeshortening(0, 0)).toEqual({ scaleX: 1, scaleY: 1 });
    expect(glyphForeshortening(0.99, 0).scaleX).toBeLessThan(0.5);
    expect(glyphForeshortening(0, 0.99).scaleY).toBeLessThan(0.65);
    expect(glyphForeshortening(1, 0).scaleX).toBeGreaterThan(0);
  });
  it("reuses cached projected cells while rotating geographic samples", () => {
    const first: GlobeCell[] = [];
    const second: GlobeCell[] = [];
    forEachGlobeCell(48, 24, initialOrientation(), (cell) => first.push(cell));
    forEachGlobeCell(48, 24, initialOrientation(0), (cell) => second.push(cell));
    expect(first.length).toBeGreaterThan(500);
    expect(first[0]).toBe(second[0]);
    expect(first.at(-1)).toBe(second.at(-1));
  });
});
