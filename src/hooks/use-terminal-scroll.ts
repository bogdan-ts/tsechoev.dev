import { useLayoutEffect, useRef } from "react";
import type { TerminalEntry } from "../lib/terminal-state";

export function useTerminalScroll(entries: readonly TerminalEntry[]) {
  const screenRef = useRef<HTMLDivElement>(null);
  const latestEntryRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const latest = latestEntryRef.current;
    const alignOutput = () => {
      const padding = Number.parseFloat(getComputedStyle(screen).paddingTop) || 0;
      screen.scrollTop = latest
        ? screen.scrollTop +
          latest.getBoundingClientRect().top -
          screen.getBoundingClientRect().top -
          padding
        : 0;
    };
    alignOutput();
    if (!latest || typeof ResizeObserver !== "function") return;
    let followLoading = true;
    const stopFollowing = () => {
      followLoading = false;
    };
    const interactions = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    interactions.forEach((event) =>
      screen.addEventListener(event, stopFollowing, { passive: true }),
    );
    const observer = new ResizeObserver(() => {
      if (followLoading) alignOutput();
    });
    observer.observe(latest);
    return () => {
      observer.disconnect();
      interactions.forEach((event) => screen.removeEventListener(event, stopFollowing));
    };
  }, [entries]);

  return { screenRef, latestEntryRef };
}
