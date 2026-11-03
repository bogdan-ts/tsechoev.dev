import { renderGlobe } from "./globe";

export type GlobeColors = { land: string; visited: string; water: string };
type GlyphAtlas = { signature: string; glyphs: Map<string, HTMLCanvasElement> };
const atlases = new WeakMap<HTMLCanvasElement, GlyphAtlas>();

export function paintGlobe(
  canvas: HTMLCanvasElement,
  columns: number,
  rotation: number,
  colors: GlobeColors,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const font = getComputedStyle(canvas).font;
  context.font = font;
  const cellWidth = context.measureText("M").width;
  const cellHeight = 11;
  const rows = columns / 2;
  const width = columns * cellWidth;
  const height = rows * cellHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const signature = `${font}|${ratio}|${colors.land}|${colors.visited}|${colors.water}`;
  let atlas = atlases.get(canvas);
  if (atlas?.signature !== signature) {
    atlas = { signature, glyphs: new Map() };
    atlases.set(canvas, atlas);
  }
  if (canvas.width !== Math.ceil(width * ratio) || canvas.height !== Math.ceil(height * ratio)) {
    canvas.width = Math.ceil(width * ratio);
    canvas.height = Math.ceil(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  context.font = font;
  context.textBaseline = "middle";
  context.save();
  context.beginPath();
  context.ellipse(width / 2, height / 2, (columns - 1) * cellWidth / 2, (rows - 1) * cellHeight / 2, 0, 0, Math.PI * 2);
  context.clip();
  const frame = renderGlobe(columns, rows, rotation);
  frame.rows.forEach((row, index) => {
    let column = 0;
    for (const run of row) {
      if (run.kind !== "space") {
        context.globalAlpha = 0.16 + run.brightness * 0.84;
        const key = `${run.kind}:${run.text}`;
        let glyph = atlas!.glyphs.get(key);
        if (!glyph) {
          glyph = document.createElement("canvas");
          glyph.width = Math.ceil(run.text.length * cellWidth * ratio);
          glyph.height = Math.ceil(cellHeight * ratio);
          const glyphContext = glyph.getContext("2d")!;
          glyphContext.scale(ratio, ratio);
          glyphContext.font = font;
          glyphContext.textBaseline = "middle";
          glyphContext.fillStyle = colors[run.kind];
          glyphContext.fillText(run.text, 0, cellHeight / 2);
          if (atlas!.glyphs.size >= 512) {
            const oldest = atlas!.glyphs.keys().next().value;
            if (oldest !== undefined) atlas!.glyphs.delete(oldest);
          }
          atlas!.glyphs.set(key, glyph);
        }
        context.drawImage(glyph, column * cellWidth, index * cellHeight, glyph.width / ratio, glyph.height / ratio);
      }
      column += run.text.length;
    }
  });
  context.restore();
}
