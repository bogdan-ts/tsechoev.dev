import land from "./data/globe-land.json";
import visited from "./data/globe-visited.json";
import { surfaceBrightness } from "./globe-lighting";

type CellKind = "space" | "land" | "water" | "visited";
export type GlobeRun = { text: string; kind: CellKind; brightness: number };
type Cell = GlobeRun;
type Mask = { width: number; height: number; data: string };
type SurfaceSample = { latitude: number; longitude: number; brightness: number; light: number };

const radians = Math.PI / 180;
const tilt = 20 * radians;
const landBits = Uint8Array.from(atob(land.data), (character) => character.charCodeAt(0));
const visitedBits = Uint8Array.from(atob(visited.data), (character) => character.charCodeAt(0));
const geometryCache = new Map<string, (SurfaceSample | null)[][]>();
const landPalette = ".,:;=+x#%@";
const waterPalette = ".,:;-~=+";

function sphereGeometry(columns: number, rows: number) {
  const key = `${columns}x${rows}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;
  const centerX = (columns - 1) / 2;
  const centerY = (rows - 1) / 2;
  const radiusX = (columns - 2) / 2;
  const radiusY = (rows - 2) / 2;
  const geometry = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column): SurfaceSample | null => {
      const horizontal = (column - centerX) / radiusX;
      const vertical = (centerY - row) / radiusY;
      const distance = horizontal ** 2 + vertical ** 2;
      if (distance > 1) return null;
      const depth = Math.sqrt(1 - distance);
      const light = surfaceBrightness(horizontal, vertical, depth);
      return {
        latitude: Math.asin(vertical * Math.cos(tilt) + depth * Math.sin(tilt)) / radians,
        longitude:
          Math.atan2(horizontal, depth * Math.cos(tilt) - vertical * Math.sin(tilt)) / radians,
        brightness: Math.round(light * 12) / 12,
        light,
      };
    }),
  );
  if (geometryCache.size >= 4) {
    const oldest = geometryCache.keys().next().value;
    if (oldest !== undefined) geometryCache.delete(oldest);
  }
  geometryCache.set(key, geometry);
  return geometry;
}

function sampleMask(mask: Mask, bits: Uint8Array, latitude: number, longitude: number): boolean {
  const wrapped = (((longitude + 180) % 360) + 360) % 360;
  const column = Math.min(mask.width - 1, Math.floor((wrapped / 360) * mask.width));
  const row = Math.min(
    mask.height - 1,
    Math.max(0, Math.floor(((90 - latitude) / 180) * mask.height)),
  );
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
    if (previous?.kind === cell.kind && previous.brightness === cell.brightness)
      previous.text += cell.text;
    else runs.push({ ...cell });
  }
  return runs;
}

export function renderGlobe(columns: number, rows: number, rotation: number) {
  const cells: Cell[][] = sphereGeometry(columns, rows).map((row) =>
    row.map((sample) => {
      if (!sample) return { text: " ", kind: "space", brightness: 0 };
      const longitude = sample.longitude + rotation / radians;
      const visitedArea = isVisited(sample.latitude, longitude);
      const landArea = visitedArea || isLand(sample.latitude, longitude);
      const palette = landArea ? landPalette : waterPalette;
      return {
        text: palette[Math.min(palette.length - 1, Math.floor(sample.light * palette.length))],
        kind: visitedArea ? "visited" : landArea ? "land" : "water",
        brightness: sample.brightness,
      };
    }),
  );

  return { rows: cells.map(compressRow) };
}
