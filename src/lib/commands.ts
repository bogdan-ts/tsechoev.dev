type CommandDefinition = { name: string; description: string; aliases: readonly string[] };

export const commands = [
  { name: "whoami", description: "About me", aliases: ["about"] },
  { name: "experience", description: "Work experience", aliases: [] },
  { name: "skills", description: "Technical skills", aliases: [] },
  { name: "opensource", description: "Open-source contributions", aliases: ["oss"] },
  { name: "education", description: "Degrees and university", aliases: [] },
  { name: "contact", description: "Email, GitHub and LinkedIn", aliases: [] },
  { name: "cv", description: "Download CV (PDF)", aliases: ["resume"] },
  {
    name: "travel",
    description: "Visited places; --globe for ASCII Earth",
    aliases: ["countries"],
  },
  { name: "help", description: "List commands", aliases: ["ls"] },
  { name: "history", description: "Command history", aliases: [] },
  { name: "clear", description: "Clear the screen", aliases: [] },
  { name: "theme", description: "Set theme: theme [dark|light]", aliases: [] },
  { name: "pwd", description: "Print the current directory", aliases: [] },
] as const satisfies readonly CommandDefinition[];

type CommandName = (typeof commands)[number]["name"];
export type ContentCommand = Exclude<CommandName, "history" | "clear" | "theme" | "pwd">;
export type CommandResult =
  | { kind: "content"; command: Exclude<ContentCommand, "travel"> }
  | { kind: "content"; command: "travel"; view?: "globe" }
  | { kind: "error"; message: string }
  | { kind: "history"; entries: string[] }
  | { kind: "clear" }
  | { kind: "theme"; theme?: "dark" | "light" }
  | { kind: "text"; message: string };

export function executeCommand(input: string, history: string[] = []): CommandResult | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;
  const [name, ...args] = normalized.split(/\s+/);
  const command = commands.find(
    (entry: CommandDefinition) => entry.name === name || entry.aliases.includes(name),
  );
  if (!command)
    return {
      kind: "error",
      message: `Command not found: ${input.trim()}. Type help for commands.`,
    };
  if (command.name === "travel") {
    if (!args.length) return { kind: "content", command: "travel" };
    if (args.length === 1 && args[0] === "--globe")
      return { kind: "content", command: "travel", view: "globe" };
    return { kind: "error", message: "Usage: travel [--globe]" };
  }
  if (command.name === "theme") {
    const theme = args[0];
    if (args.length > 1 || (theme !== undefined && theme !== "dark" && theme !== "light"))
      return { kind: "error", message: "Usage: theme [dark|light]" };
    return theme ? { kind: "theme", theme } : { kind: "theme" };
  }
  if (args.length)
    return {
      kind: "error",
      message: `${command.name} does not take arguments. Type help for available commands.`,
    };
  if (command.name === "clear") return { kind: "clear" };
  if (command.name === "history") return { kind: "history", entries: [...history] };
  if (command.name === "pwd") return { kind: "text", message: "/home/visitor/bogdan" };
  return { kind: "content", command: command.name };
}

export function completeCommand(input: string): string[] {
  if (!input) return [];
  if (/\s/.test(input)) {
    return ["travel --globe", "countries --globe"].filter((command) =>
      command.startsWith(input.toLowerCase()),
    );
  }
  return commands.map((entry) => entry.name).filter((name) => name.startsWith(input.toLowerCase()));
}
