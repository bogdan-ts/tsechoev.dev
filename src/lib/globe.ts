import land from "./data/globe-land.json";
import visited from "./data/globe-visited.json";
import { glyphForeshortening, LIGHT_LEVELS, surfaceBrightness } from "./globe-lighting";
import { orientationMatrix, type Quaternion } from "./globe-orientation";

export type CellKind = "space" | "land" | "water" | "visited";
export type GlobeRun = { text: string; kind: CellKind; brightness: number };
type Cell = GlobeRun;
type Mask = { width: number; height: number; data: string };
export type GlobeCell = Readonly<{
  column: number;
  row: number;
  scaleX: number;
  scaleY: number;
  brightness: number;
  landCharacter: string;
  waterCharacter: string;
}>;
type SurfaceSample = GlobeCell & { x: number; y: number; z: number; light: number };

const radians = Math.PI / 180;
const landBits = Uint8Array.from(atob(land.data), (character) => character.charCodeAt(0));
const visitedBits = Uint8Array.from(atob(visited.data), (character) => character.charCodeAt(0));
const geometryCache = new Map<string, (SurfaceSample | null)[][]>();
const landPalette = ".,:;=+x#%@";
const waterPalette = "....::::";

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
        column,
        row,
        landCharacter:
          landPalette[Math.min(landPalette.length - 1, Math.floor(light * landPalette.length))],
        waterCharacter:
          waterPalette[Math.min(waterPalette.length - 1, Math.floor(light * waterPalette.length))],
        ...glyphForeshortening(horizontal, vertical),
        x: horizontal,
        y: vertical,
        z: depth,
        brightness: Math.round(light * (LIGHT_LEVELS - 1)) / (LIGHT_LEVELS - 1),
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

export function forEachProjectedCell(
  columns: number,
  rows: number,
  visit: (cell: GlobeCell) => void,
) {
  for (const row of sphereGeometry(columns, rows)) {
    for (const sample of row) if (sample) visit(sample);
  }
}

export function forEachGlobeCell(
  columns: number,
  rows: number,
  orientation: Quaternion,
  visit: (cell: GlobeCell, character: string, kind: Exclude<CellKind, "space">) => void,
) {
  const matrix = orientationMatrix(orientation);
  for (const row of sphereGeometry(columns, rows)) {
    for (const sample of row) {
      if (!sample) continue;
      const worldX = matrix[0] * sample.x + matrix[1] * sample.y + matrix[2] * sample.z;
      const worldY = matrix[3] * sample.x + matrix[4] * sample.y + matrix[5] * sample.z;
      const worldZ = matrix[6] * sample.x + matrix[7] * sample.y + matrix[8] * sample.z;
      const latitude = Math.asin(Math.max(-1, Math.min(1, worldY))) / radians;
      const longitude = Math.atan2(worldX, worldZ) / radians;
      const visitedArea = isVisited(latitude, longitude);
      const landArea = visitedArea || isLand(latitude, longitude);
      const character = landArea ? sample.landCharacter : sample.waterCharacter;
      visit(sample, character, visitedArea ? "visited" : landArea ? "land" : "water");
    }
  }
}

export function renderGlobe(columns: number, rows: number, orientation: Quaternion) {
  const cells: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({ text: " ", kind: "space", brightness: 0 })),
  );
  forEachGlobeCell(columns, rows, orientation, (cell, text, kind) => {
    cells[cell.row][cell.column] = { text, kind, brightness: cell.brightness };
  });
  return { rows: cells.map(compressRow) };
}
