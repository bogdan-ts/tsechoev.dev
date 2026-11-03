import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Output } from "../src/components/output";
import { executeCommand } from "../src/lib/commands";

vi.mock("../src/components/lazy-globe", () => ({ LazyGlobe: () => <h2>Travel globe</h2> }));

afterEach(cleanup);

describe("portfolio content commands", () => {
  it.each([
    ["whoami", "Bogdan Tsechoev"],
    ["experience", "Experience"],
    ["skills", "Skills"],
    ["opensource", "Open source"],
    ["education", "Education"],
    ["contact", "Contact"],
    ["cv", "CV"],
    ["travel", "Travel"],
    ["travel --globe", "Travel globe"],
    ["help", "Commands"],
  ])("renders the %s view", (command, heading) => {
    const result = executeCommand(command);
    if (!result) throw new Error(`Missing result for ${command}`);
    render(<Output result={result} />);
    expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
  });

  it("renders both CV contribution links", () => {
    render(<Output result={{ kind: "content", command: "opensource" }} />);
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "https://github.com/postgres-ai/postgresai",
      "https://github.com/postgres-ai/database-lab-engine",
    ]);
  });
});
