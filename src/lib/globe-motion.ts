import type { CometSky } from "./globe-comets";
import {
  axisRotation,
  multiplyRotation,
  ZERO_VELOCITY,
  type Quaternion,
  type Vector3,
} from "./globe-orientation";

export type GlobeMotion = { orientation: Quaternion; velocity: Vector3; sky: CometSky };
export const AUTO_SPEED = 0.00018;

export function advanceRotation(orientation: Quaternion, velocity: Vector3, elapsed: number) {
  const duration = Math.max(0, Math.min(elapsed, 100));
  const decay = Math.exp(-duration / 350);
  const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
  const inertia = axisRotation(velocity, speed * 350 * (1 - decay));
  const auto = axisRotation({ x: 0, y: 1, z: 0 }, AUTO_SPEED * duration);
  return {
    orientation: multiplyRotation(auto, multiplyRotation(orientation, inertia)),
    velocity:
      speed * decay < 0.00001
        ? ZERO_VELOCITY
        : { x: velocity.x * decay, y: velocity.y * decay, z: velocity.z * decay },
  };
}
