export type Vector3 = Readonly<{ x: number; y: number; z: number }>;
export type Quaternion = Readonly<Vector3 & { w: number }>;
export const IDENTITY: Quaternion = { x: 0, y: 0, z: 0, w: 1 };
export const ZERO_VELOCITY: Vector3 = { x: 0, y: 0, z: 0 };

function normalize(value: Quaternion): Quaternion {
  const length = Math.hypot(value.x, value.y, value.z, value.w);
  if (length < 1e-12) return IDENTITY;
  return { x: value.x / length, y: value.y / length, z: value.z / length, w: value.w / length };
}

export function axisRotation(axis: Vector3, angle: number): Quaternion {
  const length = Math.hypot(axis.x, axis.y, axis.z);
  if (length < 1e-12) return IDENTITY;
  const scale = Math.sin(angle / 2) / length;
  return { x: axis.x * scale, y: axis.y * scale, z: axis.z * scale, w: Math.cos(angle / 2) };
}

export function multiplyRotation(first: Quaternion, second: Quaternion): Quaternion {
  return normalize({
    x: first.w * second.x + first.x * second.w + first.y * second.z - first.z * second.y,
    y: first.w * second.y - first.x * second.z + first.y * second.w + first.z * second.x,
    z: first.w * second.z + first.x * second.y - first.y * second.x + first.z * second.w,
    w: first.w * second.w - first.x * second.x - first.y * second.y - first.z * second.z,
  });
}

export function initialOrientation(yaw = Math.PI / 2, tilt = (20 * Math.PI) / 180): Quaternion {
  return multiplyRotation(
    axisRotation({ x: 0, y: 1, z: 0 }, yaw),
    axisRotation({ x: 1, y: 0, z: 0 }, -tilt),
  );
}

export function projectTrackball(x: number, y: number): Vector3 {
  const length = Math.hypot(x, y);
  if (length > 1) return { x: x / length, y: y / length, z: 0 };
  return { x, y, z: Math.sqrt(Math.max(0, 1 - length * length)) };
}

export function rotationBetween(from: Vector3, to: Vector3): Quaternion {
  const dot = Math.max(-1, Math.min(1, from.x * to.x + from.y * to.y + from.z * to.z));
  if (dot < -0.999999) {
    const perpendicular =
      Math.abs(from.x) < 0.9 ? { x: 0, y: from.z, z: -from.y } : { x: -from.z, y: 0, z: from.x };
    return axisRotation(perpendicular, Math.PI);
  }
  return normalize({
    x: from.y * to.z - from.z * to.y,
    y: from.z * to.x - from.x * to.z,
    z: from.x * to.y - from.y * to.x,
    w: 1 + dot,
  });
}

export function angularVelocity(rotation: Quaternion, elapsed: number): Vector3 {
  const sign = rotation.w < 0 ? -1 : 1;
  const scale = Math.hypot(rotation.x, rotation.y, rotation.z);
  if (scale < 1e-12) return ZERO_VELOCITY;
  const speed = Math.min(
    0.004,
    (2 * Math.atan2(scale, Math.abs(rotation.w))) / Math.max(8, elapsed),
  );
  return {
    x: ((rotation.x * sign) / scale) * speed,
    y: ((rotation.y * sign) / scale) * speed,
    z: ((rotation.z * sign) / scale) * speed,
  };
}

export function orientationMatrix({ x, y, z, w }: Quaternion) {
  return [
    1 - 2 * (y * y + z * z),
    2 * (x * y - z * w),
    2 * (x * z + y * w),
    2 * (x * y + z * w),
    1 - 2 * (x * x + z * z),
    2 * (y * z - x * w),
    2 * (x * z - y * w),
    2 * (y * z + x * w),
    1 - 2 * (x * x + y * y),
  ] as const;
}
