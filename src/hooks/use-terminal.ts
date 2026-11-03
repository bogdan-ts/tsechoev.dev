import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { completeCommand, executeCommand, type CommandResult } from "../lib/commands";

type Entry = { id: number; input: string; result: CommandResult | null };

const MAX_SCROLLBACK_ENTRIES = 100;

export function useTerminal() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const entrySequence = useRef(0);
  const [history, setHistory] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [status, setStatus] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursor, setCursor] = useState({ offset: 0, scrollLeft: 0, selected: false });
  const pendingCursor = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const latestEntryRef = useRef<HTMLDivElement>(null);
  const historyIndex = useRef<number | null>(null);
  const draft = useRef("");
  const completion = useRef<{ matches: string[]; index: number } | null>(null);

  function syncCursor() {
    const element = inputRef.current;
    if (!element) return;
    setCursor({
      offset: element.selectionStart ?? 0,
      scrollLeft: element.scrollLeft,
      selected: element.selectionStart !== element.selectionEnd,
    });
  }

  useLayoutEffect(() => {
    if (pendingCursor.current !== null) {
      inputRef.current?.setSelectionRange(pendingCursor.current, pendingCursor.current);
      pendingCursor.current = null;
    }
    syncCursor();
  }, [input]);

  useEffect(() => {
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      document.activeElement === document.body
    ) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, []);

  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const latest = latestEntryRef.current;
    screen.scrollTop = latest
      ? screen.scrollTop + latest.getBoundingClientRect().top - screen.getBoundingClientRect().top
      : 0;
  }, [entries]);

  function appendEntry(input: string, result: CommandResult | null) {
    const entry: Entry = { id: ++entrySequence.current, input, result };
    setEntries(current => [...current, entry].slice(-MAX_SCROLLBACK_ENTRIES));
  }

  function resetCompletion() {
    completion.current = null;
    setSuggestions([]);
  }

  function clear() {
    setEntries([]);
    setShowWelcome(false);
    resetCompletion();
    setStatus("Screen cleared. History retained.");
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
    resetCompletion();
    if (result.kind === "clear") {
      clear();
    } else {
      if (result.kind === "theme") {
        setTheme((current) => result.theme ?? (current === "dark" ? "light" : "dark"));
      }
      appendEntry(trimmed, result);
      setStatus(`${trimmed}: output ready.`);
    }
    inputRef.current?.focus({ preventScroll: true });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(input);
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    const key = event.key.toLowerCase();
    if (event.ctrlKey && !event.metaKey && ["c", "u", "k"].includes(key)) {
      const hasSelection = Boolean(window.getSelection()?.toString()) ||
        event.currentTarget.selectionStart !== event.currentTarget.selectionEnd;
      if (key === "c" && hasSelection) return;
      event.preventDefault();
      resetCompletion();
      historyIndex.current = null;
      const cursorOffset = event.currentTarget.selectionStart ?? input.length;
      if (key === "c") {
        appendEntry(`${input}^C`, null);
        setInput("");
        setStatus("Input cancelled.");
      } else if (key === "u") {
        pendingCursor.current = cursorOffset > 0 ? 0 : null;
        setInput(input.slice(cursorOffset));
      } else {
        setInput(input.slice(0, cursorOffset));
      }
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === "l") {
      event.preventDefault();
      clear();
      return;
    }
    if (event.key === "Tab" && !event.shiftKey) {
      const matches = completion.current?.matches ?? completeCommand(input);
      if (!matches.length) return;
      event.preventDefault();
      const index = completion.current ? (completion.current.index + 1) % matches.length : 0;
      completion.current = { matches, index };
      setSuggestions(matches.length > 1 ? matches : []);
      setInput(matches[index]);
      setStatus(
        matches.length > 1 ? `Completions: ${matches.join(", ")}` : `Completed: ${matches[index]}`,
      );
      return;
    }
    resetCompletion();
    if (event.key === "Escape") {
      setInput("");
      historyIndex.current = null;
    }
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    if (!history.length) return;
    if (event.key === "ArrowUp") {
      if (historyIndex.current === null) {
        draft.current = input;
        historyIndex.current = history.length;
      }
      historyIndex.current = Math.max(0, historyIndex.current - 1);
      setInput(history[historyIndex.current]);
    } else if (historyIndex.current !== null) {
      historyIndex.current += 1;
      if (historyIndex.current >= history.length) {
        historyIndex.current = null;
        setInput(draft.current);
      } else {
        setInput(history[historyIndex.current]);
      }
    }
  }

  function focusPrompt(event: MouseEvent<HTMLElement>) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("a, button, input, label") || window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  }

  function changeInput(event: ChangeEvent<HTMLInputElement>) {
    setInput(event.target.value);
    resetCompletion();
    historyIndex.current = null;
  }

  return {
    input,
    entries,
    showWelcome,
    theme,
    status,
    suggestions,
    cursor,
    inputRef,
    screenRef,
    latestEntryRef,
    run,
    submit,
    keyDown,
    focusPrompt,
    syncCursor,
    changeInput,
  };
}
