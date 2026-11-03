import { describe, expect, it, vi } from "vitest";
import { advanceCometSky, createCometSky, paintComet, type CometSky } from "../src/lib/globe-comets";

describe("rare comet sky", () => {
  it("waits at least 45 active seconds and schedules a quiet gap after a pass", () => {
    let sky = createCometSky(() => 0);
    for (let i = 0; i < 449; i++) sky = advanceCometSky(sky, 100, () => 0);
    expect(sky.comet).toBeNull();
    sky = advanceCometSky(sky, 100, () => 0);
    expect(sky.comet).not.toBeNull();
    for (let i = 0; i < 28; i++) sky = advanceCometSky(sky, 100, () => 0);
    expect(sky.comet).toBeNull();
    expect(sky.nextAt - sky.time).toBe(45000);
  });
  it("varies orientation, tint and front/back depth without overlapping passes", () => {
    const spawn = (value: number) => advanceCometSky({ time: 0, nextAt: 1, comet: null }, 16, () => value);
    const first = spawn(0.1);
    const second = spawn(0.9);
    expect(first.comet?.front).not.toBe(second.comet?.front);
    expect(first.comet?.angle).not.toBe(second.comet?.angle);
    expect(first.comet?.warm).not.toBe(second.comet?.warm);
    expect(advanceCometSky(first, 16).comet).toBe(first.comet);
  });
  it("does not jump through inactive time or consume random values every frame", () => {
    const random = vi.fn(() => 0.5);
    const initial = createCometSky(random);
    const next = advanceCometSky(initial, 10000, random);
    expect(next.time).toBe(100);
    expect(random).toHaveBeenCalledTimes(1);
  });
  it("masks background sparks with the full sphere and leaves foreground unmasked", () => {
    const context = { save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), rect: vi.fn(), ellipse: vi.fn(), clip: vi.fn(), fillText: vi.fn() };
    const sky: CometSky = { time: 1000, nextAt: Infinity, comet: { startedAt: 0, duration: 3000, angle: 0, offset: 0, front: false, warm: true, seed: 1 } };
    paintComet(context as unknown as CanvasRenderingContext2D, sky, 400, 400, 180, 180);
    expect(context.clip).toHaveBeenCalledWith("evenodd");
    expect(context.fillText.mock.calls.length).toBeGreaterThan(20);
    context.clip.mockClear();
    paintComet(context as unknown as CanvasRenderingContext2D, { ...sky, comet: { ...sky.comet!, front: true } }, 400, 400, 180, 180);
    expect(context.clip).not.toHaveBeenCalled();
  });
});
