"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { completeCommand, executeCommand, type CommandResult } from "../lib/commands";
import { CommandList, Output } from "./output";
import { profile } from "../lib/profile";

type Entry = { id: number; input: string; result: CommandResult };

export function Terminal() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const latestRef = useRef<HTMLDivElement>(null);
  const sequence = useRef(0);
  const historyIndex = useRef<number | null>(null);
  const draft = useRef("");
  const completion = useRef<{ matches: string[]; index: number } | null>(null);

  useEffect(() => {
    if (entries.length) latestRef.current?.scrollIntoView?.({ block: "start", behavior: "instant" });
  }, [entries]);

  function clear() {
    setEntries([]);
    setShowWelcome(false);
    setStatus("Terminal cleared. Command history is still available.");
  }

  function run(command: string) {
    const trimmed = command.trim();
    if (!trimmed) return;
    const nextHistory = [...history, trimmed];
    const result = executeCommand(trimmed, nextHistory);
    if (!result) return;
    setHistory(nextHistory);
    setInput("");
    historyIndex.current = null;
    completion.current = null;
    if (result.kind === "clear") clear();
    else {
      if (result.kind === "theme") setTheme((current) => result.theme ?? (current === "dark" ? "light" : "dark"));
      setEntries((current) => [...current, { id: ++sequence.current, input: trimmed, result }].slice(-100));
      setStatus(`Command ${trimmed} completed. Output is above the command input.`);
    }
    inputRef.current?.focus({ preventScroll: true });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(input);
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l") {
      event.preventDefault(); clear(); return;
    }
    if (event.key === "Tab" && !event.shiftKey) {
      const matches = completion.current?.matches ?? completeCommand(input);
      if (!matches.length) return;
      event.preventDefault();
      const index = completion.current ? (completion.current.index + 1) % matches.length : 0;
      completion.current = { matches, index };
      setInput(matches[index]);
      setStatus(matches.length > 1 ? `Completions: ${matches.join(", ")}` : `Completed: ${matches[index]}`);
      return;
    }
    completion.current = null;
    if (event.key === "Escape") { setInput(""); historyIndex.current = null; }
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    if (!history.length) return;
    if (event.key === "ArrowUp") {
      if (historyIndex.current === null) { draft.current = input; historyIndex.current = history.length; }
      historyIndex.current = Math.max(0, historyIndex.current - 1);
      setInput(history[historyIndex.current]);
    } else if (historyIndex.current !== null) {
      historyIndex.current += 1;
      if (historyIndex.current >= history.length) { historyIndex.current = null; setInput(draft.current); }
      else setInput(history[historyIndex.current]);
    }
  }

  return <main className="workspace" data-theme={theme}>
      <section className="terminal-window" aria-label="Interactive portfolio terminal">
        <div className="terminal-body">
          {showWelcome && <div className="welcome">
            <div className="intro"><h1>I’m Bogdan<span className="accent">.</span></h1><p className="intro-role">Senior Full-Stack Engineer · 7+ years</p><p className="intro-description">I build SaaS, AI, and web products — from the interface to the database and everything in between.</p></div>
            <div className="welcome-help"><p className="section-label">Available commands:</p><CommandList onCommand={run} /></div>
            <noscript><p>Enable JavaScript to use the interactive terminal. You can still <a href={profile.resumeHref}>download my CV</a> or <a href={`mailto:${profile.email}`}>email me</a>.</p></noscript>
          </div>}
          <div className="transcript" role="region" aria-label="Command output">{entries.map((entry, index) => <div className="transcript-entry" key={entry.id} ref={index === entries.length - 1 ? latestRef : undefined}><p className="executed-command"><span className="accent">visitor</span><span className="muted">@tsechoev.dev</span> <span className="prompt-path">~</span> <span className="accent">❯</span> <span>{entry.input}</span></p><div className="command-output"><Output result={entry.result} onCommand={run} /></div></div>)}</div>
          <form className="prompt" onSubmit={submit}><label htmlFor="command" className="prompt-prefix"><span className="accent">visitor</span><span className="prompt-host">@tsechoev.dev</span> <span className="prompt-path">~</span> <span className="accent">❯</span><span className="sr-only"> Enter a portfolio command</span></label><input id="command" ref={inputRef} value={input} onChange={(event) => { setInput(event.target.value); completion.current = null; historyIndex.current = null; }} onKeyDown={keyDown} placeholder="Try whoami…" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="send" maxLength={500} /><button className="enter-button" type="submit" aria-label="Run command">↵</button></form>
          <p className="sr-only" role="status" aria-live="polite">{status}</p>
        </div>
      </section>
  </main>;
}
