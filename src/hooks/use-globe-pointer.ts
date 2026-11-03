import { useRef, type PointerEvent, type RefObject } from "react";
import type { GlobeMotion } from "../lib/globe-motion";
import {
  angularVelocity,
  axisRotation,
  multiplyRotation,
  projectTrackball,
  rotationBetween,
  ZERO_VELOCITY,
  type Vector3,
} from "../lib/globe-orientation";

type Drag = { id: number; point: Vector3; time: number };
const TRACKBALL_RADIUS_RATIO = 0.45;

function pointerPosition(event: PointerEvent<HTMLCanvasElement>): Vector3 | null {
  const bounds = event.currentTarget.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) return null;
  return projectTrackball(
    (event.clientX - bounds.x - bounds.width / 2) / (bounds.width * TRACKBALL_RADIUS_RATIO),
    (bounds.y + bounds.height / 2 - event.clientY) / (bounds.height * TRACKBALL_RADIUS_RATIO),
  );
}

export function useGlobePointer(
  motionRef: RefObject<GlobeMotion>,
  redrawRef: RefObject<() => void>,
  allowInertia: boolean,
) {
  const dragRef = useRef<Drag | null>(null);
  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    const point = pointerPosition(event);
    if (!point) return;
    motionRef.current.velocity = ZERO_VELOCITY;
    dragRef.current = { id: event.pointerId, point, time: event.timeStamp };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const current = dragRef.current;
    if (!current || current.id !== event.pointerId) return;
    const point = pointerPosition(event);
    if (!point) return;
    const delta = rotationBetween(point, current.point);
    motionRef.current.orientation = multiplyRotation(motionRef.current.orientation, delta);
    motionRef.current.velocity = angularVelocity(delta, event.timeStamp - current.time);
    dragRef.current = { id: current.id, point, time: event.timeStamp };
    redrawRef.current();
  };
  const pointerEnd = (event: PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.id !== event.pointerId) return;
    if (!allowInertia || event.type !== "pointerup" || event.timeStamp - dragRef.current.time > 100)
      motionRef.current.velocity = ZERO_VELOCITY;
    dragRef.current = null;
  };
  const rotateBy = (axis: Vector3, angle: number) => {
    motionRef.current.orientation = multiplyRotation(
      motionRef.current.orientation,
      axisRotation(axis, angle),
    );
    motionRef.current.velocity = ZERO_VELOCITY;
    redrawRef.current();
  };
  return { dragRef, pointerDown, pointerMove, pointerEnd, rotateBy };
}
