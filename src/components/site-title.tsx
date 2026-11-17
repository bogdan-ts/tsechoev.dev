"use client";

import { TitleAtoms } from "./title-atoms";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const title = "tsechoev.dev";
const effects = ["gravity", "typo", "reboot", "dot", "wave", "reverse", "atoms"] as const;
type Effect = (typeof effects)[number];
const duration = 1800;

export function SiteTitle() {
  const [effect, setEffect] = useState<Effect | null>(null);
  const [text, setText] = useState(title);
  const [reduced, setReduced] = useState(false);
  const previous = useRef<Effect | null>(null);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function play() {
    if (busy.current) return;
    busy.current = true;
    const choices = effects.filter((item) => item !== previous.current);
    const next = choices[Math.floor(Math.random() * choices.length)];
    previous.current = next;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(still);
    setEffect(next);
    const later = (delay: number, value: string) => {
      timers.current.push(setTimeout(() => setText(value), delay));
    };
    if (still)
      setText(next === "reboot" ? "[ reboot ]" : next === "typo" ? "tsechoev.deb" : "hello, dev.");
    else if (next === "typo") {
      later(120, "tsechoev.deb");
      later(650, "tsechoev.de");
      later(900, title);
    } else if (next === "reboot") {
      setText("[ reboot ]");
      later(400, "");
      for (let i = 1; i <= title.length; i++) later(470 + i * 65, title.slice(0, i));
    }
    timers.current.push(
      setTimeout(
        () => {
          setEffect(null);
          setText(title);
          busy.current = false;
          timers.current = [];
        },
        still ? 1000 : next === "atoms" ? 2200 : duration,
      ),
    );
  }

  return (
    <button
      className="site-title title-toy"
      type="button"
      onClick={play}
      aria-label="tsechoev.dev — play a small animation"
      data-effect={effect ?? undefined}
      data-reduced={reduced}
      aria-busy={effect !== null}
    >
      {effect === "atoms" && !reduced && <TitleAtoms />}
      <span className="title-toy-letters" aria-hidden="true">
        {[...text].map((letter, i) => (
          <span
            key={i}
            style={
              {
                "--i": i,
                "--fall": `${8 + (i % 4) * 3}px`,
                "--tilt": `${(i % 2 ? 1 : -1) * (8 + i * 2)}deg`,
              } as CSSProperties
            }
          >
            {letter === " " ? "\u00a0" : letter}
          </span>
        ))}
      </span>
    </button>
  );
}
