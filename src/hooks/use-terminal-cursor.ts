import { useLayoutEffect, useRef, useState } from "react";

export function useTerminalCursor(input: string) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursorRef = useRef<number | null>(null);
  const [cursor, setCursor] = useState({ offset: 0, scrollLeft: 0, selected: false });

  function syncCursor() {
    const element = inputRef.current;
    if (!element) return;
    const next = {
      offset: element.selectionStart ?? 0,
      scrollLeft: element.scrollLeft,
      selected: element.selectionStart !== element.selectionEnd,
    };
    setCursor((previous) =>
      previous.offset === next.offset &&
      previous.scrollLeft === next.scrollLeft &&
      previous.selected === next.selected
        ? previous
        : next,
    );
  }

  useLayoutEffect(() => {
    if (pendingCursorRef.current !== null) {
      inputRef.current?.setSelectionRange(pendingCursorRef.current, pendingCursorRef.current);
      pendingCursorRef.current = null;
    }
    syncCursor();
  }, [input]);

  return { inputRef, cursor, pendingCursorRef, syncCursor };
}
