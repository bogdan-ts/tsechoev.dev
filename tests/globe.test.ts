import { describe, expect, it } from "vitest";
import { renderGlobe, isLand, isVisited } from "../src/lib/globe";
import visited from "../src/lib/data/globe-visited.json";
import { countries } from "../src/lib/profile";

describe("ASCII globe geography", () => {
  it("generates visited polygons for the supplied travel entries", () => {
    expect([...visited.codes].sort()).toEqual(countries.map(country => country.code).sort());
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
  it("renders bounded ASCII frames with filled areas rather than stars", () => {
    const frame = renderGlobe(40, 20, Math.PI / 2);
    expect(frame.rows).toHaveLength(20);
    expect(frame.rows.every(row => row.map(run => run.text).join("").length === 40)).toBe(true);
    const highlighted = frame.rows.flat().filter(run => run.kind === "visited").map(run => run.text).join("");
    expect(highlighted.length).toBeGreaterThan(30);
    expect(highlighted).not.toContain("*");
    expect(frame.rows[0].every(run => run.kind === "space")).toBe(true);
    const other = renderGlobe(40, 20, -Math.PI / 2);
    expect(other.rows).not.toEqual(frame.rows);
    const farSideFill = other.rows.flat().filter(run => run.kind === "visited").map(run => run.text).join("");
    expect(farSideFill.length).toBeLessThan(highlighted.length);
  });
});
