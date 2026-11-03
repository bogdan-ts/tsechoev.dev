import type { Quaternion } from "./globe-orientation";
import { forEachGlobeCell, forEachProjectedCell, type CellKind, type GlobeCell } from "./globe";
import { paintComet, type CometSky } from "./globe-comets";
import { LIGHT_LEVELS } from "./globe-lighting";
import { materialPalette, type GlobeColors } from "./globe-materials";
export type { GlobeColors } from "./globe-materials";

export type GlobeRenderer = {
  draw: (columns: number, orientation: Quaternion, colors: GlobeColors, sky: CometSky) => void;
  refreshFont: () => void;
  dispose: () => void;
};
type Material = Exclude<CellKind, "space">;
type Textures = Record<Material, HTMLCanvasElement>;
const MATERIALS: readonly Material[] = ["water", "land", "visited"];
const SKY_PADDING = 24;
const MAX_PIXEL_RATIO = 2;
// Share camera-fixed lighting across history entries without retaining unbounded bitmaps.
const textureCache = new Map<string, Textures>();
const MAX_TEXTURE_SETS = 2;

export function createGlobeRenderer(canvas: HTMLCanvasElement): GlobeRenderer | null {
  const candidate = canvas.getContext("2d");
  if (!candidate) return null;
  const context = candidate;
  let font = "";
  let cellWidth = 0;
  let disposed = false;
  let fontRevision = 0;

  function refreshFont() {
    const style = getComputedStyle(canvas);
    font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.font = font;
    cellWidth = context.measureText("M").width;
    fontRevision++;
  }

  function draw(columns: number, orientation: Quaternion, colors: GlobeColors, sky: CometSky) {
    if (disposed || cellWidth <= 0) return;
    const cellHeight = cellWidth * 2;
    const rows = columns / 2;
    const sphereWidth = columns * cellWidth;
    const sphereHeight = rows * cellHeight;
    const width = sphereWidth + SKY_PADDING * 2;
    const height = sphereHeight + SKY_PADDING * 2;
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    if (canvas.width !== Math.ceil(width * ratio) || canvas.height !== Math.ceil(height * ratio)) {
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = "auto";
    }
    const key = `${columns}|${font}|${fontRevision}|${cellWidth}|${ratio}|${colors.land}|${colors.visited}|${colors.water}`;
    const palette = materialPalette(colors);
    function paintGlyph(painter: CanvasRenderingContext2D, cell: GlobeCell, kind: Material) {
      const level = Math.round(cell.brightness * (LIGHT_LEVELS - 1));
      painter.save();
      painter.translate(
        SKY_PADDING + (cell.column + 0.5) * cellWidth,
        SKY_PADDING + (cell.row + 0.5) * cellHeight,
      );
      painter.scale(cell.scaleX, cell.scaleY);
      painter.globalAlpha =
        kind === "water" ? 0.22 + cell.brightness * 0.78 : 0.1 + cell.brightness * 0.9;
      painter.fillStyle = palette[kind][level];
      if (kind !== "water" && level >= LIGHT_LEVELS * 0.65) {
        painter.shadowColor = palette[kind][level];
        painter.shadowBlur = 3;
      }
      painter.fillText(
        kind === "water" ? cell.waterCharacter : cell.landCharacter,
        -cellWidth / 2,
        0,
      );
      painter.restore();
    }
    let textures = textureCache.get(key);
    if (!textures) {
      const images = {} as Textures;
      let complete = true;
      for (const kind of MATERIALS) {
        const image = document.createElement("canvas");
        image.width = canvas.width;
        image.height = canvas.height;
        const painter = image.getContext("2d");
        if (!painter) {
          complete = false;
          break;
        }
        painter.scale(ratio, ratio);
        painter.font = font;
        painter.textBaseline = "middle";
        forEachProjectedCell(columns, rows, (cell) => paintGlyph(painter, cell, kind));
        images[kind] = image;
      }
      if (complete) {
        textures = images;
        if (textureCache.size >= MAX_TEXTURE_SETS) {
          const oldest = textureCache.keys().next().value;
          if (oldest !== undefined) textureCache.delete(oldest);
        }
        textureCache.set(key, textures);
      }
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.font = font;
    context.textBaseline = "middle";
    const radiusX = ((columns - 1) * cellWidth) / 2;
    const radiusY = ((rows - 1) * cellHeight) / 2;
    context.save();
    context.beginPath();
    context.ellipse(width / 2, height / 2, radiusX, radiusY, 0, 0, Math.PI * 2);
    context.clip();
    const images = textures;
    if (images) {
      let activeRow = -1;
      let start = 0;
      let end = -1;
      let material: Material = "water";
      function flush(source: Textures) {
        if (activeRow < 0) return;
        const x = SKY_PADDING + start * cellWidth;
        const y = SKY_PADDING + activeRow * cellHeight;
        const runWidth = (end - start + 1) * cellWidth;
        context.drawImage(
          source[material],
          x * ratio,
          y * ratio,
          runWidth * ratio,
          cellHeight * ratio,
          x,
          y,
          runWidth,
          cellHeight,
        );
      }
      forEachGlobeCell(columns, rows, orientation, (cell, _character, kind) => {
        if (cell.row !== activeRow || kind !== material || cell.column !== end + 1) {
          flush(images);
          activeRow = cell.row;
          start = cell.column;
          material = kind;
        }
        end = cell.column;
      });
      flush(images);
    } else {
      // An unavailable offscreen context must not leave an otherwise usable canvas blank.
      forEachGlobeCell(columns, rows, orientation, (cell, _character, kind) =>
        paintGlyph(context, cell, kind),
      );
    }
    context.restore();
    paintComet(context, sky, width, height, radiusX, radiusY);
  }
  refreshFont();
  return {
    draw,
    refreshFont,
    dispose: () => {
      disposed = true;
    },
  };
}
