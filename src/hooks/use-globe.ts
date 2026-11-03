import { useEffect, useRef, useState, type PointerEvent } from "react";
import { advanceRotation } from "../lib/globe-motion";
import { paintGlobe } from "../lib/globe-canvas";

export function useGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angle = useRef(Math.PI / 2);
  const velocity = useRef(0);
  const drag = useRef<{ id: number; x: number; time: number } | null>(null);
  const redraw = useRef(() => {});
  const [columns, setColumns] = useState(56);
  const [paused, setPaused] = useState(false);
  const [fps, setFps] = useState(60);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference?.matches ?? false);
    const updateVisibility = () => setDocumentVisible(document.visibilityState !== "hidden");
    updatePreference();
    updateVisibility();
    preference?.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      preference?.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resize = () => {
      const width = container.getBoundingClientRect().width;
      if (width > 0) setColumns(width < 340 ? 48 : width < 480 ? 56 : 80);
    };
    resize();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    observer?.observe(container);
    return () => observer?.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof IntersectionObserver !== "function") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(entries => setVisible(entries.some(entry => entry.isIntersecting)));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    const workspace = canvas.closest(".workspace");
    let colors = { land: "#e5e8df", visited: "#b3d88e", water: "#68899f" };
    const draw = () => paintGlobe(canvas, columns, angle.current, colors);
    const updateTheme = () => {
      const style = getComputedStyle(canvas);
      colors = {
        land: style.getPropertyValue("--text").trim() || "#e5e8df",
        visited: style.getPropertyValue("--accent").trim() || "#b3d88e",
        water: workspace?.getAttribute("data-theme") === "light" ? "#3d5e74" : "#68899f",
      };
      draw();
    };
    redraw.current = draw;
    updateTheme();
    void document.fonts?.ready.then(() => { if (!disposed) draw(); });
    const observer = new MutationObserver(updateTheme);
    if (workspace) observer.observe(workspace, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      disposed = true;
      observer.disconnect();
      redraw.current = () => {};
    };
  }, [columns]);

  useEffect(() => {
    velocity.current = 0;
    if (paused || reducedMotion || !visible || !documentVisible) return;
    let previousTime = performance.now();
    let animationFrame: number;
    const tick = (time: number) => {
      const elapsed = time - previousTime;
      if (elapsed >= 1000 / fps - 0.5) {
        previousTime = time;
        if (!drag.current) {
          const next = advanceRotation(angle.current, velocity.current, elapsed);
          angle.current = next.angle;
          velocity.current = next.velocity;
          redraw.current();
        }
      }
      animationFrame = window.requestAnimationFrame(tick);
    };
    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [paused, reducedMotion, visible, documentVisible, fps]);

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    velocity.current = 0;
    drag.current = { id: event.pointerId, x: event.clientX, time: event.timeStamp };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const movement = (event.clientX - current.x) * 0.008;
    angle.current -= movement;
    velocity.current = Math.max(-0.004, Math.min(0.004, -movement / Math.max(8, event.timeStamp - current.time)));
    drag.current = { id: current.id, x: event.clientX, time: event.timeStamp };
    redraw.current();
  };
  const pointerEnd = (event: PointerEvent<HTMLCanvasElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    if (paused || reducedMotion || event.type !== "pointerup" || event.timeStamp - drag.current.time > 100) velocity.current = 0;
    drag.current = null;
  };

  return {
    containerRef, canvasRef, paused, reducedMotion, fps, setFps,
    togglePause: () => setPaused(current => !current),
    pointerDown, pointerMove, pointerEnd,
    rotateBy: (amount: number) => { angle.current += amount; velocity.current = 0; redraw.current(); },
  };
}
