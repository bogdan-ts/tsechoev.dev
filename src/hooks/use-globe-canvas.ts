import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createGlobeRenderer, type GlobeColors, type GlobeRenderer } from "../lib/globe-canvas";
import type { GlobeMotion } from "../lib/globe-motion";

export function useGlobeCanvas(columns: number, motionRef: RefObject<GlobeMotion>) {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GlobeRenderer | null>(null);
  const redrawRef = useRef(() => {});
  const [available, setAvailable] = useState(true);
  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    rendererRef.current?.dispose();
    canvasElementRef.current = canvas;
    rendererRef.current = canvas ? createGlobeRenderer(canvas) : null;
    if (canvas) setAvailable(rendererRef.current !== null);
  }, []);

  useEffect(() => {
    const canvas = canvasElementRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return;
    let disposed = false;
    const workspace = canvas.closest(".workspace");
    let colors: GlobeColors = { land: "#e5e8df", visited: "#b3d88e", water: "#68899f" };
    const draw = () =>
      renderer.draw(columns, motionRef.current.orientation, colors, motionRef.current.sky);
    const updateTheme = () => {
      const style = getComputedStyle(canvas);
      const light = style.getPropertyValue("--globe-theme").trim() === "light";
      colors = {
        light,
        land: style.getPropertyValue("--globe-land").trim() || "#e5e8df",
        visited: style.getPropertyValue("--globe-visited").trim() || "#b3d88e",
        water: style.getPropertyValue("--globe-water").trim() || "#68899f",
      };
      renderer.refreshFont();
      draw();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      setAvailable(false);
    };
    redrawRef.current = draw;
    updateTheme();
    const scheme = matchMedia("(prefers-color-scheme: light)");
    scheme.addEventListener("change", updateTheme);
    void document.fonts?.ready.then(() => {
      if (!disposed) {
        renderer.refreshFont();
        draw();
      }
    });
    canvas.addEventListener("contextlost", contextLost);
    const observer = new MutationObserver(updateTheme);
    if (workspace)
      observer.observe(workspace, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      disposed = true;
      observer.disconnect();
      scheme.removeEventListener("change", updateTheme);
      canvas.removeEventListener("contextlost", contextLost);
      redrawRef.current = () => {};
    };
  }, [columns, motionRef, available]);

  return { canvasRef, redrawRef, available };
}
