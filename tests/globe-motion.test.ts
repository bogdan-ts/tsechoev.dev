import { describe, expect, it } from "vitest";
import { advanceRotation } from "../src/lib/globe-motion";

describe("elapsed-time globe motion", () => {
  it("keeps rotation and damping independent of frame rate", () => {
    const first = advanceRotation(1, 0.002, 32);
    const half = advanceRotation(1, 0.002, 16);
    const second = advanceRotation(half.angle, half.velocity, 16);
    expect(first.angle).toBeCloseTo(second.angle, 10);
    expect(first.velocity).toBeCloseTo(second.velocity, 10);
  });
  it("bounds long-frame jumps and dissipates inertia", () => {
    expect(advanceRotation(0, 0, 5000)).toEqual(advanceRotation(0, 0, 100));
    let motion = { angle: 0, velocity: -0.003 };
    for (let i = 0; i < 100; i++) motion = advanceRotation(motion.angle, motion.velocity, 50);
    expect(motion.velocity).toBe(0);
  });
});
