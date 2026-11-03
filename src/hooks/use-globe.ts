import { useEffect, useRef, useState } from "react";

export function useGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(40);
  const [rotation, setRotation] = useState(Math.PI / 2);
  const [paused, setPaused] = useState(false);
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
      setColumns(width < 340 ? 32 : width < 480 ? 40 : 56);
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
    if (paused || reducedMotion || !visible || !documentVisible) return;
    const timer = window.setInterval(() => setRotation(angle => (angle + 0.025) % (Math.PI * 2)), 100);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, visible, documentVisible]);

  return { containerRef, columns, rotation, paused, reducedMotion, togglePause: () => setPaused(current => !current) };
}
