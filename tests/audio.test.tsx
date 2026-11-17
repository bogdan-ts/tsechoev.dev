import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { IntroAudio } from "../src/components/intro-audio";
import { Terminal } from "../src/components/terminal";
import { executeCommand } from "../src/lib/commands";

let audio: HTMLAudioElement;
const play = vi.fn();
const pause = vi.fn();
beforeEach(() => {
  play.mockResolvedValue(undefined);
  pause.mockReset();
  vi.stubGlobal(
    "Audio",
    vi.fn(function () {
      audio = document.createElement("audio");
      audio.play = play;
      audio.pause = pause;
      audio.load = vi.fn();
      return audio;
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("parses audio actions without accepting arbitrary sudo input", () => {
  expect(executeCommand(" PLAY intro ")).toEqual({ kind: "audio", action: "intro" });
  expect(executeCommand("stop")).toEqual({ kind: "audio", action: "stop" });
  expect(executeCommand("sudo hire me")).toEqual({ kind: "audio", action: "hire" });
  expect(executeCommand("sudo reboot")?.kind).toBe("error");
  expect(executeCommand("play unknown")?.kind).toBe("error");
  expect(executeCommand("stop intro")?.kind).toBe("error");
});

it("loads audio only on demand and supports pause, resume, end and cleanup", async () => {
  const view = render(<IntroAudio />);
  expect(vi.mocked(Audio)).not.toHaveBeenCalled();
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Listen to my intro" })),
  );
  expect(audio.getAttribute("src")).toBe("/audio/intro.mp3");
  audio.currentTime = 12;
  act(() => audio.dispatchEvent(new Event("play")));
  fireEvent.click(screen.getByRole("button", { name: "Pause audio" }));
  act(() => audio.dispatchEvent(new Event("pause")));
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Resume audio" })));
  expect(audio.currentTime).toBe(12);
  act(() => audio.dispatchEvent(new Event("ended")));
  expect(screen.getByRole("button", { name: "Listen to my intro" })).toBeTruthy();
  view.unmount();
  expect(pause).toHaveBeenCalled();
});

it("offers recovery when playback is rejected", async () => {
  play.mockRejectedValue(new Error("blocked"));
  render(<IntroAudio />);
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Listen to my intro" })),
  );
  expect(screen.getByRole("alert").textContent).toContain("Could not play");
  play.mockResolvedValue(undefined);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Retry audio" })));
  expect(play).toHaveBeenCalledTimes(2);
});

it("switches tracks once per command, reveals contacts and stops on clear", async () => {
  const { container } = render(<Terminal />);
  const input = screen.getByRole("textbox");
  const run = async (value: string) => {
    fireEvent.change(input, { target: { value } });
    const form = container.querySelector("form");
    if (!form) throw new Error("Missing prompt form");
    await act(async () => fireEvent.submit(form));
  };
  await run("play intro");
  expect(play).toHaveBeenCalledTimes(1);
  await run("sudo hire me");
  expect(audio.getAttribute("src")).toBe("/audio/hire.mp3");
  expect(play).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("link", { name: /bogdan.tsechoev@gmail.com/ })).toBeTruthy();
  await run("skills");
  expect(play).toHaveBeenCalledTimes(2);
  await run("clear");
  expect(audio.currentTime).toBe(0);
  expect(screen.queryByRole("button", { name: "Pause audio" })).toBeNull();
});

it("keeps an intentional pause when an outstanding play request rejects", async () => {
  let rejectPlayback: (reason: Error) => void = () => {};
  play.mockImplementationOnce(
    () =>
      new Promise<void>((_, reject) => {
        rejectPlayback = reject;
      }),
  );
  render(<IntroAudio />);
  fireEvent.click(screen.getByRole("button", { name: "Listen to my intro" }));
  act(() => audio.dispatchEvent(new Event("play")));
  fireEvent.click(screen.getByRole("button", { name: "Pause audio" }));
  await act(async () => rejectPlayback(new DOMException("Playback paused", "AbortError")));
  expect(screen.getByRole("button", { name: "Resume audio" })).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

it("keeps a compact idle player and an accessible transcript disclosure", () => {
  render(<IntroAudio />);
  expect(screen.getByText("0:52")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Stop audio" })).toBeNull();
  const transcript = screen.getByRole("button", { name: "Read transcript" });
  expect(transcript.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(transcript);
  expect(transcript.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("AI-generated voice · ElevenLabs")).toBeTruthy();
});
