import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobeRenderer } from "../src/lib/globe-canvas";
import { createCometSky } from "../src/lib/globe-comets";

afterEach(() => vi.restoreAllMocks());

describe("Canvas resource ownership", () => {
  it("returns a fallback signal when a 2D context is unavailable", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(createGlobeRenderer(document.createElement("canvas"))).toBeNull();
  });

  it("measures fonts outside the frame loop and refreshes them explicitly", () => {
    const context = {
      measureText: vi.fn(() => ({ width: 5.6 })),
      scale: vi.fn(),
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
      beginPath: vi.fn(),
      ellipse: vi.fn(),
      clip: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      restore: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    const style = vi.spyOn(window, "getComputedStyle");
    const renderer = createGlobeRenderer(document.createElement("canvas"));
    if (!renderer) throw new Error("Missing Canvas renderer");
    expect(style).toHaveBeenCalledTimes(1);
    const colors = { land: "#fff", visited: "#0f0", water: "#888" };
    const sky = createCometSky(() => 0.5);
    renderer.draw(48, 0, colors, sky);
    renderer.draw(48, 0.1, colors, sky);
    expect(style).toHaveBeenCalledTimes(1);
    expect(context.measureText).toHaveBeenCalledTimes(1);
    renderer.refreshFont();
    expect(context.measureText).toHaveBeenCalledTimes(2);
    renderer.dispose();
  });
});
