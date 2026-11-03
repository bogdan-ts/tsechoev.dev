import { commands } from "../lib/commands";

export type CommandActionProps = {
  onCommand?: (command: string) => void;
};

export function CommandList({ onCommand }: CommandActionProps) {
  return (
    <div className="command-list">
      {commands.map(({ name, description }) => (
        <div className="command-item" key={name}>
          {onCommand ? (
            <button type="button" onClick={() => onCommand(name)}>
              {name}
            </button>
          ) : (
            <code>{name}</code>
          )}
          <span>{description}</span>
        </div>
      ))}
    </div>
  );
}
