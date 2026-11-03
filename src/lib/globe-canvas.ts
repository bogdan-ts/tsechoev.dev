import type { Quaternion } from "./globe-orientation";
import { renderGlobe, type GlobeRun } from "./globe";
import { paintComet, type CometSky } from "./globe-comets";

export type GlobeColors = { land: string; visited: string; water: string };
export type GlobeRenderer = {
  draw: (columns: number, orientation: Quaternion, colors: GlobeColors, sky: CometSky) => void;
  refreshFont: () => void;
  dispose: () => void;
};
const CELL_HEIGHT = 11;
const SKY_PADDING = 24;
const MAX_SPRITES = 512;
const MAX_PIXEL_RATIO = 2;

export function createGlobeRenderer(canvas: HTMLCanvasElement): GlobeRenderer | null {
  const candidate = canvas.getContext("2d");
  if (!candidate) return null;
  const context = candidate;
  const sprites = new Map<string, HTMLCanvasElement>();
  let font = "";
  let cellWidth = 0;
  let signature = "";

  function refreshFont() {
    const style = getComputedStyle(canvas);
    font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.font = font;
    cellWidth = context.measureText("M").width;
    sprites.clear();
  }

  function sprite(run: GlobeRun, color: string, ratio: number) {
    const key = `${run.kind}:${run.text}`;
    const cached = sprites.get(key);
    if (cached) return cached;
    const image = document.createElement("canvas");
    image.width = Math.ceil(run.text.length * cellWidth * ratio);
    image.height = Math.ceil(CELL_HEIGHT * ratio);
    const painter = image.getContext("2d");
    if (!painter) return null;
    painter.scale(ratio, ratio);
    painter.font = font;
    painter.textBaseline = "middle";
    painter.fillStyle = color;
    painter.fillText(run.text, 0, CELL_HEIGHT / 2);
    if (sprites.size >= MAX_SPRITES) {
      const oldest = sprites.keys().next().value;
      if (oldest !== undefined) sprites.delete(oldest);
    }
    sprites.set(key, image);
    return image;
  }

  function draw(columns: number, orientation: Quaternion, colors: GlobeColors, sky: CometSky) {
    if (!context || cellWidth <= 0) return;
    const rows = columns / 2;
    const sphereWidth = columns * cellWidth;
    const sphereHeight = rows * CELL_HEIGHT;
    const width = sphereWidth + SKY_PADDING * 2;
    const height = sphereHeight + SKY_PADDING * 2;
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const nextSignature = `${font}|${ratio}|${colors.land}|${colors.visited}|${colors.water}`;
    if (signature !== nextSignature) {
      signature = nextSignature;
      sprites.clear();
    }
    if (canvas.width !== Math.ceil(width * ratio) || canvas.height !== Math.ceil(height * ratio)) {
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = "auto";
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.font = font;
    context.textBaseline = "middle";
    const radiusX = ((columns - 1) * cellWidth) / 2;
    const radiusY = ((rows - 1) * CELL_HEIGHT) / 2;
    context.save();
    context.translate(SKY_PADDING, SKY_PADDING);
    context.beginPath();
    context.ellipse(sphereWidth / 2, sphereHeight / 2, radiusX, radiusY, 0, 0, Math.PI * 2);
    context.clip();
    const frame = renderGlobe(columns, rows, orientation);
    frame.rows.forEach((row, index) => {
      let column = 0;
      for (const run of row) {
        if (run.kind !== "space") {
          const image = sprite(run, colors[run.kind], ratio);
          context.globalAlpha = 0.16 + run.brightness * 0.84;
          if (image)
            context.drawImage(
              image,
              column * cellWidth,
              index * CELL_HEIGHT,
              image.width / ratio,
              image.height / ratio,
            );
          else {
            context.fillStyle = colors[run.kind];
            context.fillText(run.text, column * cellWidth, (index + 0.5) * CELL_HEIGHT);
          }
        }
        column += run.text.length;
      }
    });
    context.restore();
    paintComet(context, sky, width, height, radiusX, radiusY);
  }

  refreshFont();
  return { draw, refreshFont, dispose: () => sprites.clear() };
}
