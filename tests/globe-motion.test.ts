import { describe, expect, it } from "vitest";
import { advanceRotation } from "../src/lib/globe-motion";
import { initialOrientation, ZERO_VELOCITY } from "../src/lib/globe-orientation";

describe("elapsed-time globe motion", () => {
  it("keeps rotation and multi-axis damping independent of frame rate", () => {
    const orientation = initialOrientation();
    const velocity = { x: 0.001, y: -0.002, z: 0.0005 };
    const first = advanceRotation(orientation, velocity, 32);
    const half = advanceRotation(orientation, velocity, 16);
    const second = advanceRotation(half.orientation, half.velocity, 16);
    for (const key of ["x", "y", "z", "w"] as const)
      expect(first.orientation[key]).toBeCloseTo(second.orientation[key], 10);
    for (const key of ["x", "y", "z"] as const)
      expect(first.velocity[key]).toBeCloseTo(second.velocity[key], 10);
  });
  it("bounds long-frame jumps and dissipates inertia", () => {
    const orientation = initialOrientation();
    expect(advanceRotation(orientation, ZERO_VELOCITY, 5000)).toEqual(
      advanceRotation(orientation, ZERO_VELOCITY, 100),
    );
    let motion = { orientation, velocity: { x: -0.003, y: 0.001, z: 0.002 } };
    for (let i = 0; i < 100; i++) motion = advanceRotation(motion.orientation, motion.velocity, 50);
    expect(motion.velocity).toEqual(ZERO_VELOCITY);
  });
});
