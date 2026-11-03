import type { CometSky } from "./globe-comets";

export type GlobeMotion = { angle: number; velocity: number; sky: CometSky };

export const AUTO_SPEED = 0.00018;

export function advanceRotation(angle: number, velocity: number, elapsed: number) {
  const duration = Math.max(0, Math.min(elapsed, 100));
  const decay = Math.exp(-duration / 350);
  const inertia = velocity * 350 * (1 - decay);
  return {
    angle: (angle + AUTO_SPEED * duration + inertia) % (Math.PI * 2),
    velocity: Math.abs(velocity * decay) < 0.00001 ? 0 : velocity * decay,
  };
}
