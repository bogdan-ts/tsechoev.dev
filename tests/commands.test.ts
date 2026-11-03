import { describe, expect, it } from "vitest";
import { commands, completeCommand, executeCommand } from "../src/lib/commands";
import { profile, countries } from "../src/lib/profile";

describe("terminal command contract", () => {
  it("ignores blank input and normalizes aliases and case", () => {
    expect(executeCommand("   ")).toBeNull();
    expect(executeCommand("  WHOAMI ")).toEqual(executeCommand("about"));
    expect(executeCommand("oss")).toEqual(executeCommand("opensource"));
    expect(executeCommand("travel")).toEqual(executeCommand("atlas"));
    expect(executeCommand("travel --globe")).toEqual(executeCommand("atlas --globe"));
  });
  it("has a result for every documented command", () => {
    for (const command of commands) expect(executeCommand(command.name)).not.toBeNull();
  });
  it("rejects unknown commands and unsupported arguments", () => {
    expect(executeCommand("<script>alert(1)</script>")?.kind).toBe("error");
    expect(executeCommand("whoami --secret")?.kind).toBe("error");
    expect(executeCommand("theme banana")?.kind).toBe("error");
    expect(executeCommand("theme light")).toEqual({ kind: "theme", theme: "light" });
  });
  it("retains history independently of clear", () => {
    expect(executeCommand("history", ["whoami", "history"])).toEqual({
      kind: "history",
      entries: ["whoami", "history"],
    });
    expect(executeCommand("clear")).toEqual({ kind: "clear" });
  });
  it("completes command names and the atlas flag", () => {
    expect(completeCommand("who")).toEqual(["whoami"]);
    expect(completeCommand("c")).toEqual(["contact", "cv", "clear"]);
    expect(completeCommand("whoami arg")).toEqual([]);
    expect(completeCommand("atlas --g")).toEqual(["atlas --globe"]);
    expect(completeCommand("countries ")).toEqual(["countries --globe"]);
  });
  it("treats the globe as a atlas view, not a separate command", () => {
    expect(executeCommand("atlas --globe")).toEqual({
      kind: "content",
      command: "atlas",
      view: "globe",
    });
    expect(executeCommand("countries --globe")).toEqual(executeCommand("atlas --globe"));
    expect(executeCommand("globe")?.kind).toBe("error");
    expect(executeCommand("atlas --unknown")).toEqual({
      kind: "error",
      message: "Usage: atlas [--globe]",
    });
    expect(executeCommand("atlas --globe --globe")?.kind).toBe("error");
    expect(commands.some((command) => String(command.name) === "globe")).toBe(false);
  });
  it("uses the supplied CV and atlas list", () => {
    expect(profile.email).toBe("bogdan.tsechoev@gmail.com");
    expect(profile.location).toBe("Manila, Philippines");
    expect(profile.experience[0].period).toBe("Apr 2024 – Feb 2026");
    expect(profile.education).toHaveLength(2);
    expect(profile.opensource.map((repo) => repo.href)).toEqual([
      "https://github.com/postgres-ai/postgresai",
      "https://github.com/postgres-ai/database-lab-engine",
    ]);
    expect(countries).toHaveLength(19);
    expect(new Set(countries.map((country) => country.code)).size).toBe(19);
  });
});
