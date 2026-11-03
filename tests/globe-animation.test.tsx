import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGlobeRenderer, type GlobeRenderer } from "../src/lib/globe-canvas";
const paintGlobe = vi.fn<GlobeRenderer["draw"]>();

vi.mock("../src/lib/globe-canvas", () => ({ createGlobeRenderer: vi.fn() }));

import { AtlasGlobe } from "../src/components/commands/globe";

beforeEach(() => {
  paintGlobe.mockClear();
  vi.mocked(createGlobeRenderer).mockReturnValue({
    draw: paintGlobe,
    refreshFont: vi.fn(),
    dispose: vi.fn(),
  });
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("globe animation lifecycle", () => {
  it("rotates, pauses, resumes and releases timers when cleared", () => {
    const { unmount } = render(<AtlasGlobe />);
    const frame = () => vi.mocked(paintGlobe).mock.calls.at(-1)?.[1];
    const initial = frame();
    act(() => vi.advanceTimersByTime(500));
    expect(frame()).not.toBe(initial);
    fireEvent.click(screen.getByRole("button", { name: "Pause rotation" }));
    const paused = frame();
    act(() => vi.advanceTimersByTime(1000));
    expect(frame()).toBe(paused);
    fireEvent.click(screen.getByRole("button", { name: "Resume rotation" }));
    act(() => vi.advanceTimersByTime(500));
    expect(frame()).not.toBe(paused);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not animate for reduced-motion users", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<AtlasGlobe />);
    const draws = vi.mocked(paintGlobe).mock.calls.length;
    act(() => vi.advanceTimersByTime(3000));
    expect(vi.mocked(paintGlobe).mock.calls.length).toBe(draws);
    expect(
      (screen.getByRole("button", { name: "Pause rotation" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops work when offscreen or the browser tab is hidden", () => {
    let notify: IntersectionObserverCallback;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(<AtlasGlobe />);
    expect(vi.getTimerCount()).toBe(0);
    act(() =>
      notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
    );
    expect(vi.getTimerCount()).toBe(1);
    act(() =>
      notify([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver),
    );
    expect(vi.getTimerCount()).toBe(0);
    act(() =>
      notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
    );
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(vi.getTimerCount()).toBe(0);
  });
  it("uses every high-refresh frame and supports keyboard rotation while paused", () => {
    let frame: FrameRequestCallback;
    let sequence = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frame = callback;
      return ++sequence;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    render(<AtlasGlobe />);
    const start = performance.now();
    vi.mocked(paintGlobe).mockClear();
    for (let i = 1; i <= 12; i++) act(() => frame(start + (i * 1000) / 120));
    expect(vi.mocked(paintGlobe).mock.calls.length).toBe(12);
    expect(screen.queryByRole("combobox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Pause rotation" }));
    const before = vi.mocked(paintGlobe).mock.calls.at(-1)?.[1];
    if (before === undefined) throw new Error("Missing painted frame");
    fireEvent.keyDown(screen.getByRole("img"), { key: "ArrowRight" });
    expect(vi.mocked(paintGlobe).mock.calls.at(-1)?.[1]).not.toEqual(before);
  });
});
