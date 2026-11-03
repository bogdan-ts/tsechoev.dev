export const commands = [
  { name: "whoami", description: "The person behind the prompt", aliases: ["about"] },
  { name: "experience", description: "Where I’ve worked & what I’ve shipped", aliases: [] },
  { name: "skills", description: "My tools of the trade", aliases: [] },
  { name: "opensource", description: "Contributions to the PostgreSQL ecosystem", aliases: ["oss"] },
  { name: "education", description: "A little academic background", aliases: [] },
  { name: "contact", description: "Let’s start a conversation", aliases: [] },
  { name: "cv", description: "Download my résumé as a PDF", aliases: ["resume"] },
  { name: "travel", description: "Places beyond the keyboard", aliases: ["countries"] },
  { name: "help", description: "Explore all available commands", aliases: ["ls"] },
  { name: "history", description: "Commands from this session", aliases: [] },
  { name: "clear", description: "A fresh terminal, same session", aliases: [] },
  { name: "theme", description: "Switch appearance: theme [dark|light]", aliases: [] },
  { name: "pwd", description: "You are here", aliases: [] },
] as const;

export type ContentCommand = "whoami" | "experience" | "skills" | "opensource" | "education" | "contact" | "cv" | "travel" | "help";
export type CommandResult =
  | { kind: "content"; command: ContentCommand }
  | { kind: "error"; message: string }
  | { kind: "history"; entries: string[] }
  | { kind: "clear" }
  | { kind: "theme"; theme?: "dark" | "light" }
  | { kind: "text"; message: string };

export function executeCommand(input: string, history: string[] = []): CommandResult | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;
  const [name, ...args] = normalized.split(/\s+/);
  const command = commands.find((entry) => entry.name === name || (entry.aliases as readonly string[]).includes(name));
  if (!command) return { kind: "error", message: `Command not found: ${input.trim()}. Type help to see what’s available.` };
  if (command.name === "theme") {
    if (args.length > 1 || (args.length === 1 && args[0] !== "dark" && args[0] !== "light")) return { kind: "error", message: "Usage: theme [dark|light]" };
    return args.length ? { kind: "theme", theme: args[0] as "dark" | "light" } : { kind: "theme" };
  }
  if (args.length) return { kind: "error", message: `${command.name} does not take arguments. Type help for available commands.` };
  if (command.name === "clear") return { kind: "clear" };
  if (command.name === "history") return { kind: "history", entries: [...history] };
  if (command.name === "pwd") return { kind: "text", message: "/home/visitor/bogdan — a small corner of the internet." };
  return { kind: "content", command: command.name };
}

export function completeCommand(input: string): string[] {
  if (!input || /\s/.test(input)) return [];
  return commands.map((entry) => entry.name).filter((name) => name.startsWith(input.toLowerCase()));
}
