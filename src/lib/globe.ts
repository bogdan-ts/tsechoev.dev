import land from "./data/globe-land.json";
import { globeLocations, type GeoLocation } from "./globe-locations";
import { countries } from "./profile";

type CellKind = "space" | "land" | "water" | "visited";
export type GlobeRun = { text: string; kind: CellKind; label?: string };
type Cell = { text: string; kind: CellKind; label?: string };

const radians = Math.PI / 180;
const tilt = 20 * radians;
const landBits = Uint8Array.from(atob(land.data), character => character.charCodeAt(0));

export function isLand(latitude: number, longitude: number): boolean {
  const wrapped = ((longitude + 180) % 360 + 360) % 360;
  const column = Math.min(land.width - 1, Math.floor(wrapped / 360 * land.width));
  const row = Math.min(land.height - 1, Math.max(0, Math.floor((90 - latitude) / 180 * land.height)));
  const index = row * land.width + column;
  return (landBits[index >> 3] & (1 << (index & 7))) !== 0;
}

export function projectLocation(location: GeoLocation, rotation: number, inclination = tilt) {
  const latitude = location.latitude * radians;
  const longitude = location.longitude * radians - rotation;
  const horizontal = Math.cos(latitude) * Math.cos(longitude);
  const depth = Math.sin(latitude) * Math.sin(inclination) + horizontal * Math.cos(inclination);
  if (depth <= 0.025) return null;
  return {
    x: Math.cos(latitude) * Math.sin(longitude),
    y: Math.sin(latitude) * Math.cos(inclination) - horizontal * Math.sin(inclination),
  };
}

function compressRow(cells: Cell[]): GlobeRun[] {
  const runs: GlobeRun[] = [];
  for (const cell of cells) {
    const previous = runs.at(-1);
    if (previous?.kind === cell.kind && previous.label === cell.label) previous.text += cell.text;
    else runs.push({ ...cell });
  }
  return runs;
}

export function renderGlobe(columns: number, rows: number, rotation: number) {
  const centerX = (columns - 1) / 2;
  const centerY = (rows - 1) / 2;
  const radiusX = (columns - 2) / 2;
  const radiusY = (rows - 2) / 2;
  const cells: Cell[][] = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => {
      const horizontal = (column - centerX) / radiusX;
      const vertical = (centerY - row) / radiusY;
      const distance = horizontal ** 2 + vertical ** 2;
      if (distance > 1) return { text: " ", kind: "space" };
      const depth = Math.sqrt(1 - distance);
      const latitude = Math.asin(vertical * Math.cos(tilt) + depth * Math.sin(tilt));
      const longitude = Math.atan2(horizontal, depth * Math.cos(tilt) - vertical * Math.sin(tilt)) + rotation;
      if (!isLand(latitude / radians, longitude / radians)) return { text: ".", kind: "water" };
      const light = -horizontal * 0.3 + vertical * 0.4 + depth * 0.85;
      return { text: light > 0.6 ? "#" : light > 0.15 ? "+" : ":", kind: "land" };
    }),
  );

  for (const country of countries) {
    const location = globeLocations[country.code];
    if (!location) continue;
    const projected = projectLocation(location, rotation);
    if (!projected) continue;
    const column = Math.round(centerX + projected.x * radiusX);
    const row = Math.round(centerY - projected.y * radiusY);
    const cell = cells[row]?.[column];
    if (!cell || cell.kind === "space") continue;
    cell.text = "*";
    cell.kind = "visited";
    cell.label = cell.label ? `${cell.label}, ${country.name}` : country.name;
  }

  return { rows: cells.map(compressRow) };
}
