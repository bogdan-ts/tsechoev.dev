import { executeCommand, type CommandResult } from "./commands";

export type TerminalEntry = { id: number; input: string; result: CommandResult | null };
export type TerminalState = {
  entries: TerminalEntry[];
  history: string[];
  nextId: number;
  showWelcome: boolean;
  theme: "dark" | "light";
  status: string;
};
type TerminalAction =
  | { type: "set-theme"; theme: "dark" | "light" }
  | { type: "run"; command: string }
  | { type: "announce"; message: string }
  | { type: "clear" }
  | { type: "cancel"; input: string };
const MAX_SCROLLBACK_ENTRIES = 100;

export function createTerminalState(): TerminalState {
  return { entries: [], history: [], nextId: 1, showWelcome: true, theme: "dark", status: "" };
}

function append(state: TerminalState, input: string, result: CommandResult | null): TerminalState {
  return {
    ...state,
    nextId: state.nextId + 1,
    entries: [...state.entries, { id: state.nextId, input, result }].slice(-MAX_SCROLLBACK_ENTRIES),
  };
}

function clear(state: TerminalState): TerminalState {
  return { ...state, entries: [], showWelcome: false, status: "Screen cleared. History retained." };
}

export function terminalReducer(state: TerminalState, action: TerminalAction): TerminalState {
  switch (action.type) {
    case "set-theme":
      return { ...state, theme: action.theme };
    case "announce":
      return { ...state, status: action.message };
    case "clear":
      return clear(state);
    case "cancel":
      return { ...append(state, `${action.input}^C`, null), status: "Input cancelled." };
    case "run": {
      const command = action.command.trim();
      if (!command) return state;
      const history = [...state.history, command];
      const result = executeCommand(command, history);
      if (!result) return state;
      const next = { ...state, history };
      if (result.kind === "clear") return clear(next);
      if (result.kind === "theme") {
        next.theme = result.theme ?? (state.theme === "dark" ? "light" : "dark");
      }
      return { ...append(next, command, result), status: `${command}: output ready.` };
    }
  }
}
