import { useEffect, useRef, useState } from "react";
import { advanceRotation, type GlobeMotion } from "../lib/globe-motion";
import { advanceCometSky, createCometSky } from "../lib/globe-comets";
import { useGlobeEnvironment } from "./use-globe-environment";
import { useGlobeCanvas } from "./use-globe-canvas";
import { useGlobePointer } from "./use-globe-pointer";

export function useGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialSky] = useState(createCometSky);
  const motionRef = useRef<GlobeMotion>({ angle: Math.PI / 2, velocity: 0, sky: initialSky });
  const [paused, setPaused] = useState(false);
  const { columns, reducedMotion, visible, documentVisible } = useGlobeEnvironment(containerRef);
  const { canvasRef, redrawRef, available } = useGlobeCanvas(columns, motionRef);
  const { dragRef, ...pointer } = useGlobePointer(motionRef, redrawRef, !paused && !reducedMotion);

  useEffect(() => {
    motionRef.current.velocity = 0;
    if (paused || reducedMotion || !visible || !documentVisible || !available) return;
    let previousTime = performance.now();
    let animationFrame: number;
    const tick = (time: number) => {
      const elapsed = time - previousTime;
      previousTime = time;
      if (!dragRef.current) {
        const next = advanceRotation(motionRef.current.angle, motionRef.current.velocity, elapsed);
        motionRef.current.angle = next.angle;
        motionRef.current.velocity = next.velocity;
        motionRef.current.sky = advanceCometSky(motionRef.current.sky, elapsed);
        redrawRef.current();
      }
      animationFrame = window.requestAnimationFrame(tick);
    };
    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [paused, reducedMotion, visible, documentVisible, available, dragRef, redrawRef]);

  return {
    containerRef,
    canvasRef,
    paused,
    reducedMotion,
    available,
    togglePause: () => setPaused((current) => !current),
    ...pointer,
  };
}
