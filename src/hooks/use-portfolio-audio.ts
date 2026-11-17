import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioTrack } from "../lib/audio";

type Playback = {
  track: AudioTrack | null;
  status: "idle" | "loading" | "playing" | "paused" | "error";
};
const idle: Playback = { track: null, status: "idle" };

// Media resources are mutable browser objects, not React state.
function preparePlayer(player: HTMLAudioElement, track: AudioTrack, resume: boolean) {
  player.onplay = null;
  player.onpause = null;
  player.onended = null;
  player.onerror = null;
  player.pause();
  if (!resume || player.getAttribute("src") !== `/audio/${track}.mp3`) {
    player.src = `/audio/${track}.mp3`;
    player.currentTime = 0;
  }
}

function attachPlayer(
  player: HTMLAudioElement,
  update: (status: Playback["status"]) => void,
  finish: () => void,
) {
  player.onplay = () => update("playing");
  player.onpause = () => {
    if (player.paused) update("paused");
  };
  player.onended = finish;
  player.onerror = () => update("error");
}

export function usePortfolioAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const request = useRef(0);
  const [playback, setPlayback] = useState<Playback>(idle);

  const stop = useCallback(() => {
    request.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlayback(idle);
  }, []);

  const play = useCallback(async (track: AudioTrack, resume = false) => {
    const id = ++request.current;
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audio.preload = "none";
      audioRef.current = audio;
    }
    const player = audio;
    preparePlayer(player, track, resume);
    const update = (status: Playback["status"]) => {
      if (request.current === id) setPlayback({ track, status });
    };
    attachPlayer(player, update, () => {
      if (request.current === id) setPlayback(idle);
    });
    update("loading");
    try {
      await player.play();
    } catch {
      update("error");
    }
  }, []);

  const pause = useCallback(() => {
    // A user pause may reject an outstanding play() promise with AbortError.
    // Invalidate that request so an intentional pause never becomes an error.
    request.current += 1;
    audioRef.current?.pause();
    setPlayback((current) => (current.track ? { ...current, status: "paused" } : current));
  }, []);

  useEffect(
    () => () => {
      request.current += 1;
      const audio = audioRef.current;
      if (audio) {
        audio.onplay = null;
        audio.onpause = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
    },
    [],
  );

  return { playback, play, pause, stop };
}
export type PortfolioAudio = ReturnType<typeof usePortfolioAudio>;
