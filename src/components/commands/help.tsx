import { CommandList, type CommandActionProps } from "../command-list";

export function HelpCommand({ onCommand }: CommandActionProps) {
  return (
    <>
      <h2>Commands</h2>
      <CommandList onCommand={onCommand} />
      <p className="muted small">
        Aliases: about → whoami · oss → opensource · resume → cv · countries → travel · ls → help
      </p>
    </>
  );
}
