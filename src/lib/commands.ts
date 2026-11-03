export const commands = [
  { name: "whoami", description: "About me", aliases: ["about"] },
  { name: "experience", description: "Work experience", aliases: [] },
  { name: "skills", description: "Technical skills", aliases: [] },
  { name: "opensource", description: "Open-source contributions", aliases: ["oss"] },
  { name: "education", description: "Degrees and university", aliases: [] },
  { name: "contact", description: "Email, GitHub and LinkedIn", aliases: [] },
  { name: "cv", description: "Download CV (PDF)", aliases: ["resume"] },
  { name: "travel", description: "Countries and territories I’ve visited", aliases: ["countries"] },
  { name: "globe", description: "Rotating ASCII globe with visited places", aliases: [] },
  { name: "help", description: "List commands", aliases: ["ls"] },
  { name: "history", description: "Command history", aliases: [] },
  { name: "clear", description: "Clear the screen", aliases: [] },
  { name: "theme", description: "Set theme: theme [dark|light]", aliases: [] },
  { name: "pwd", description: "Print the current directory", aliases: [] },
] as const;

export type ContentCommand = "whoami" | "experience" | "skills" | "opensource" | "education" | "contact" | "cv" | "travel" | "globe" | "help";
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
  if (!command) return { kind: "error", message: `Command not found: ${input.trim()}. Type help for commands.` };
  if (command.name === "theme") {
    if (args.length > 1 || (args.length === 1 && args[0] !== "dark" && args[0] !== "light")) return { kind: "error", message: "Usage: theme [dark|light]" };
    return args.length ? { kind: "theme", theme: args[0] as "dark" | "light" } : { kind: "theme" };
  }
  if (args.length) return { kind: "error", message: `${command.name} does not take arguments. Type help for available commands.` };
  if (command.name === "clear") return { kind: "clear" };
  if (command.name === "history") return { kind: "history", entries: [...history] };
  if (command.name === "pwd") return { kind: "text", message: "/home/visitor/bogdan" };
  return { kind: "content", command: command.name };
}

export function completeCommand(input: string): string[] {
  if (!input || /\s/.test(input)) return [];
  return commands.map((entry) => entry.name).filter((name) => name.startsWith(input.toLowerCase()));
}
