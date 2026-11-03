import type { ComponentType } from "react";
import type { CommandResult, ContentCommand } from "../lib/commands";
import type { CommandActionProps } from "./command-list";
import { WhoamiCommand } from "./commands/whoami";
import { ContactCommand } from "./commands/contact";
import { CvCommand } from "./commands/cv";
import { EducationCommand } from "./commands/education";
import { ExperienceCommand } from "./commands/experience";
import { HelpCommand } from "./commands/help";
import { OpenSourceCommand } from "./commands/opensource";
import { SkillsCommand } from "./commands/skills";
import { TravelCommand } from "./commands/travel";

type ContentViewProps = CommandActionProps & { view?: "globe" };

const commandViews: Record<ContentCommand, ComponentType<ContentViewProps>> = {
  whoami: WhoamiCommand,
  experience: ExperienceCommand,
  skills: SkillsCommand,
  opensource: OpenSourceCommand,
  education: EducationCommand,
  contact: ContactCommand,
  cv: CvCommand,
  travel: TravelCommand,
  help: HelpCommand,
};

type OutputProps = CommandActionProps & { result: CommandResult };

export function Output({ result, onCommand }: OutputProps) {
  switch (result.kind) {
    case "content": {
      const CommandView = commandViews[result.command];
      return <CommandView onCommand={onCommand} view={result.command === "travel" ? result.view : undefined} />;
    }
    case "error":
      return <p className="error">{result.message}</p>;
    case "text":
      return <p>{result.message}</p>;
    case "history":
      return (
        <ol className="history-list">
          {result.entries.map((command, index) => <li key={index}>{command}</li>)}
        </ol>
      );
    case "theme":
      return <p>Theme changed.</p>;
    case "clear":
      return null;
    default: {
      const unreachable: never = result;
      throw new Error(`Unhandled command result: ${JSON.stringify(unreachable)}`);
    }
  }
}
