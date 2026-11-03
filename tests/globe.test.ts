import { describe, expect, it } from "vitest";
import { renderGlobe, projectLocation, isLand } from "../src/lib/globe";
import { globeLocations } from "../src/lib/globe-locations";
import { countries } from "../src/lib/profile";

describe("ASCII globe geography", () => {
  it("has a reference point for each supplied travel entry", () => {
    expect(Object.keys(globeLocations).sort()).toEqual(countries.map(country => country.code).sort());
  });
  it("projects front-facing locations and clips the far side", () => {
    expect(projectLocation({ latitude: 0, longitude: 0 }, 0, 0)?.x).toBeCloseTo(0);
    expect(projectLocation({ latitude: 0, longitude: 180 }, 0, 0)).toBeNull();
    expect(projectLocation({ latitude: 0, longitude: 90 }, Math.PI / 2, 0)?.x).toBeCloseTo(0);
  });
  it("uses geographic land rather than a random texture", () => {
    expect(isLand(20, 0)).toBe(true);
    expect(isLand(0, -30)).toBe(false);
  });
  it("renders bounded ASCII frames and visible visited markers", () => {
    const frame = renderGlobe(40, 20, Math.PI / 2);
    expect(frame.rows).toHaveLength(20);
    expect(frame.rows.every(row => row.map(run => run.text).join("").length === 40)).toBe(true);
    expect(frame.rows.flat().some(run => run.kind === "visited")).toBe(true);
    expect(frame.rows.flat().map(run => run.text).join("")).toMatch(/^[ -~]+$/);
    const other = renderGlobe(40, 20, Math.PI);
    expect(other.rows).not.toEqual(frame.rows);
  });
});
