import { useRef, type PointerEvent, type RefObject } from "react";
import type { GlobeMotion } from "../lib/globe-motion";

export function useGlobePointer(
  motionRef: RefObject<GlobeMotion>,
  redrawRef: RefObject<() => void>,
  allowInertia: boolean,
) {
  const dragRef = useRef<{ id: number; x: number; time: number } | null>(null);
  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    motionRef.current.velocity = 0;
    dragRef.current = { id: event.pointerId, x: event.clientX, time: event.timeStamp };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const current = dragRef.current;
    if (!current || current.id !== event.pointerId) return;
    const movement = (event.clientX - current.x) * 0.008;
    motionRef.current.angle -= movement;
    motionRef.current.velocity = Math.max(
      -0.004,
      Math.min(0.004, -movement / Math.max(8, event.timeStamp - current.time)),
    );
    dragRef.current = { id: current.id, x: event.clientX, time: event.timeStamp };
    redrawRef.current();
  };
  const pointerEnd = (event: PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.id !== event.pointerId) return;
    if (!allowInertia || event.type !== "pointerup" || event.timeStamp - dragRef.current.time > 100)
      motionRef.current.velocity = 0;
    dragRef.current = null;
  };
  const rotateBy = (amount: number) => {
    motionRef.current.angle += amount;
    motionRef.current.velocity = 0;
    redrawRef.current();
  };
  return { dragRef, pointerDown, pointerMove, pointerEnd, rotateBy };
}
