import {
  useEffect,
  useCallback,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { readTheme, setTheme, subscribeTheme } from "../lib/theme";
import { completeCommand } from "../lib/commands";
import { createTerminalState, terminalReducer } from "../lib/terminal-state";
import { useTerminalCursor } from "./use-terminal-cursor";
import { useTerminalScroll } from "./use-terminal-scroll";

export function useTerminal() {
  const [state, dispatch] = useReducer(terminalReducer, undefined, createTerminalState);
  const { entries, history, showWelcome, theme, status } = state;
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { inputRef, cursor, pendingCursorRef, syncCursor } = useTerminalCursor(input);
  const { screenRef, latestEntryRef } = useTerminalScroll(entries);
  const composing = useRef(false);
  const historyIndex = useRef<number | null>(null);
  const draft = useRef("");
  const completion = useRef<{ matches: string[]; index: number } | null>(null);

  useEffect(() => {
    const sync = () => dispatch({ type: "set-theme", theme: readTheme() });
    sync();
    return subscribeTheme(sync);
  }, []);

  useEffect(() => {
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      document.activeElement === document.body
    ) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [inputRef]);

  function resetCompletion() {
    completion.current = null;
    setSuggestions([]);
  }

  function clear() {
    dispatch({ type: "clear" });
    resetCompletion();
  }

  const run = useCallback(
    (command: string) => {
      if (!command.trim()) return;
      dispatch({ type: "run", command });
      if (/^theme(?:\s+(dark|light))?\s*$/.test(command.trim())) {
        const requested = command.trim().split(/\s+/)[1];
        setTheme(
          requested === "dark" || requested === "light"
            ? requested
            : readTheme() === "dark"
              ? "light"
              : "dark",
        );
      }
      setInput("");
      historyIndex.current = null;
      completion.current = null;
      setSuggestions([]);
      inputRef.current?.focus({ preventScroll: true });
    },
    [inputRef],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!composing.current) run(input);
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (composing.current || event.nativeEvent.isComposing) return;
    const key = event.key.toLowerCase();
    if (event.ctrlKey && !event.metaKey && ["a", "e", "w"].includes(key)) {
      event.preventDefault();
      resetCompletion();
      historyIndex.current = null;
      const start = event.currentTarget.selectionStart ?? input.length;
      const end = event.currentTarget.selectionEnd ?? start;
      if (key === "a" || key === "e") {
        const offset = key === "a" ? 0 : input.length;
        event.currentTarget.setSelectionRange(offset, offset);
        syncCursor();
      } else {
        const boundary =
          start === end ? input.slice(0, start).replace(/\S+\s*$/, "").length : start;
        pendingCursorRef.current = boundary;
        setInput(input.slice(0, boundary) + input.slice(end));
      }
      return;
    }
    if (event.ctrlKey && !event.metaKey && ["c", "u", "k"].includes(key)) {
      const hasSelection =
        Boolean(window.getSelection()?.toString()) ||
        event.currentTarget.selectionStart !== event.currentTarget.selectionEnd;
      if (key === "c" && hasSelection) return;
      event.preventDefault();
      resetCompletion();
      historyIndex.current = null;
      const cursorOffset = event.currentTarget.selectionStart ?? input.length;
      if (key === "c") {
        dispatch({ type: "cancel", input });
        setInput("");
      } else if (key === "u") {
        pendingCursorRef.current = cursorOffset > 0 ? 0 : null;
        setInput(input.slice(cursorOffset));
      } else {
        setInput(input.slice(0, cursorOffset));
      }
      return;
    }
    if (event.ctrlKey && !event.metaKey && key === "l") {
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
      dispatch({
        type: "announce",
        message:
          matches.length > 1
            ? `Completions: ${matches.join(", ")}`
            : `Completed: ${matches[index]}`,
      });
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
    if (
      target.closest("a, button, input, label, select, canvas, summary") ||
      window.getSelection()?.toString()
    )
      return;
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
    startComposition: () => {
      composing.current = true;
    },
    endComposition: () => {
      composing.current = false;
    },
  };
}
