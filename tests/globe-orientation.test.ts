import { describe, expect, it } from "vitest";
import {
  axisRotation,
  initialOrientation,
  multiplyRotation,
  orientationMatrix,
  projectTrackball,
  rotationBetween,
  type Quaternion,
  type Vector3,
} from "../src/lib/globe-orientation";

function rotate(orientation: Quaternion, vector: Vector3) {
  const m = orientationMatrix(orientation);
  return {
    x: m[0] * vector.x + m[1] * vector.y + m[2] * vector.z,
    y: m[3] * vector.x + m[4] * vector.y + m[5] * vector.z,
    z: m[6] * vector.x + m[7] * vector.y + m[8] * vector.z,
  };
}

describe("free globe orientation", () => {
  it("keeps the original Asia-facing tilt as the default", () => {
    const center = rotate(initialOrientation(), { x: 0, y: 0, z: 1 });
    expect((Math.asin(center.y) * 180) / Math.PI).toBeCloseTo(20);
    expect((Math.atan2(center.x, center.z) * 180) / Math.PI).toBeCloseTo(90);
  });
  it("maps trackball gestures onto a unit sphere and rotates between them", () => {
    const from = projectTrackball(0, 0);
    const to = projectTrackball(0.3, 0.7);
    const result = rotate(rotationBetween(from, to), from);
    expect(result.x).toBeCloseTo(to.x);
    expect(result.y).toBeCloseTo(to.y);
    expect(result.z).toBeCloseTo(to.z);
    const rim = projectTrackball(2, 3);
    expect(Math.hypot(rim.x, rim.y, rim.z)).toBeCloseTo(1);
  });
  it("handles pole crossings, opposite vectors and roll without gimbal lock", () => {
    const opposite = rotate(rotationBetween({ x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 }), {
      x: 0,
      y: 1,
      z: 0,
    });
    expect(opposite.y).toBeCloseTo(-1);
    const roll = rotationBetween(projectTrackball(1, 0), projectTrackball(0, 1));
    expect(Math.abs(roll.z)).toBeGreaterThan(0.5);
    let orientation = initialOrientation();
    for (let i = 0; i < 1000; i++)
      orientation = multiplyRotation(orientation, axisRotation({ x: 1, y: 0.3, z: 0.2 }, 0.03));
    expect(Math.hypot(orientation.x, orientation.y, orientation.z, orientation.w)).toBeCloseTo(
      1,
      12,
    );
  });
});
