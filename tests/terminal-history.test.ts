import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useTerminal } from "../src/hooks/use-terminal";

afterEach(cleanup);

describe("terminal scrollback", () => {
  it("keeps the last 100 outputs without truncating command recall", () => {
    const { result } = renderHook(() => useTerminal());
    for (let index = 0; index < 101; index += 1) {
      act(() => result.current.run(`unknown-${index}`));
    }
    expect(result.current.entries).toHaveLength(100);
    expect(result.current.entries[0].input).toBe("unknown-1");
    expect(result.current.entries.at(-1)?.input).toBe("unknown-100");
    expect(new Set(result.current.entries.map(entry => entry.id)).size).toBe(100);

    act(() => result.current.run("history"));
    const history = result.current.entries.at(-1)?.result;
    expect(history?.kind).toBe("history");
    if (history?.kind !== "history") throw new Error("Expected command history");
    expect(history.entries).toHaveLength(102);
    expect(history.entries[0]).toBe("unknown-0");
  });
});
