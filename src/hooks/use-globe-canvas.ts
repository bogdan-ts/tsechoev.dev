import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createGlobeRenderer, type GlobeRenderer } from "../lib/globe-canvas";
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
    let colors = { land: "#e5e8df", visited: "#b3d88e", water: "#679bb8" };
    const draw = () =>
      renderer.draw(columns, motionRef.current.orientation, colors, motionRef.current.sky);
    const updateTheme = () => {
      const style = getComputedStyle(canvas);
      colors = {
        land: style.getPropertyValue("--text").trim() || "#e5e8df",
        visited: style.getPropertyValue("--accent").trim() || "#b3d88e",
        water: workspace?.getAttribute("data-theme") === "light" ? "#3d5e74" : "#679bb8",
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
      canvas.removeEventListener("contextlost", contextLost);
      redrawRef.current = () => {};
    };
  }, [columns, motionRef, available]);

  return { canvasRef, redrawRef, available };
}
