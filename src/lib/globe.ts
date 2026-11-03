import land from "./data/globe-land.json";
import visited from "./data/globe-visited.json";

type CellKind = "space" | "land" | "water" | "visited";
export type GlobeRun = { text: string; kind: CellKind };
type Cell = GlobeRun;
type Mask = { width: number; height: number; data: string };

const radians = Math.PI / 180;
const tilt = 20 * radians;
const landBits = Uint8Array.from(atob(land.data), character => character.charCodeAt(0));
const visitedBits = Uint8Array.from(atob(visited.data), character => character.charCodeAt(0));

function sampleMask(mask: Mask, bits: Uint8Array, latitude: number, longitude: number): boolean {
  const wrapped = ((longitude + 180) % 360 + 360) % 360;
  const column = Math.min(mask.width - 1, Math.floor(wrapped / 360 * mask.width));
  const row = Math.min(mask.height - 1, Math.max(0, Math.floor((90 - latitude) / 180 * mask.height)));
  const index = row * mask.width + column;
  return (bits[index >> 3] & (1 << (index & 7))) !== 0;
}

export function isLand(latitude: number, longitude: number): boolean {
  return sampleMask(land, landBits, latitude, longitude);
}

export function isVisited(latitude: number, longitude: number): boolean {
  return sampleMask(visited, visitedBits, latitude, longitude);
}

function compressRow(cells: Cell[]): GlobeRun[] {
  const runs: GlobeRun[] = [];
  for (const cell of cells) {
    const previous = runs.at(-1);
    if (previous?.kind === cell.kind) previous.text += cell.text;
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
      const visitedArea = isVisited(latitude / radians, longitude / radians);
      if (!visitedArea && !isLand(latitude / radians, longitude / radians)) return { text: ".", kind: "water" };
      const light = -horizontal * 0.3 + vertical * 0.4 + depth * 0.85;
      return { text: light > 0.6 ? "#" : light > 0.15 ? "+" : ":", kind: visitedArea ? "visited" : "land" };
    }),
  );

  return { rows: cells.map(compressRow) };
}
