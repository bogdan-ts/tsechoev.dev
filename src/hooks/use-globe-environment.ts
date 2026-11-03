import { useCallback, useEffect, useState, useSyncExternalStore, type RefObject } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const serverVisible = () => true;
const subscribeToVisibility = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
};
const documentIsVisible = () => document.visibilityState !== "hidden";

export function useGlobeEnvironment(containerRef: RefObject<HTMLDivElement | null>) {
  const [columns, setColumns] = useState(64);
  const [intersects, setIntersects] = useState(false);
  const documentVisible = useSyncExternalStore(
    subscribeToVisibility,
    documentIsVisible,
    serverVisible,
  );
  const subscribeToMotion = useCallback((notify: () => void) => {
    const preference = window.matchMedia?.(REDUCED_MOTION_QUERY);
    preference?.addEventListener("change", notify);
    return () => preference?.removeEventListener("change", notify);
  }, []);
  const prefersReducedMotion = useCallback(
    () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false,
    [],
  );
  const reducedMotion = useSyncExternalStore(
    subscribeToMotion,
    prefersReducedMotion,
    serverVisible,
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? container.getBoundingClientRect().width;
      if (width > 0) setColumns(width < 400 ? 64 : width < 720 ? 96 : 128);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver((entries) =>
      setIntersects(entries.some((entry) => entry.isIntersecting)),
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  return {
    columns,
    reducedMotion,
    documentVisible,
    visible: typeof IntersectionObserver !== "function" || intersects,
  };
}
