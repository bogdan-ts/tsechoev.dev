import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Terminal } from "../src/components/terminal";

afterEach(cleanup);

describe("interactive terminal", () => {
  it("starts with a brief introduction and all commands, not whoami output", () => {
    render(<Terminal />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("I’m Bogdan.");
    expect(screen.getByRole("button", { name: /whoami/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /travel/ })).toBeTruthy();
    expect(screen.queryByText("THE PERSON BEHIND THE PROMPT")).toBeNull();
  });

  it("runs typed commands and retains unfinished drafts through history", async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByRole("textbox");
    await user.type(input, "whoami{Enter}");
    expect(screen.getByText("THE PERSON BEHIND THE PROMPT")).toBeTruthy();
    await user.type(input, "unfinished");
    await user.keyboard("{ArrowUp}");
    expect((input as HTMLInputElement).value).toBe("whoami");
    await user.keyboard("{ArrowDown}");
    expect((input as HTMLInputElement).value).toBe("unfinished");
  });

  it("cycles Tab completions and keeps session history after clearing", async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByRole("textbox");
    await user.type(input, "c");
    await user.keyboard("{Tab}");
    expect((input as HTMLInputElement).value).toBe("contact");
    await user.keyboard("{Tab}");
    expect((input as HTMLInputElement).value).toBe("cv");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("link", { name: /Download CV PDF/ })).toBeTruthy();
    await user.type(input, "clear{Enter}");
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    await user.type(input, "history{Enter}");
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["cv", "clear", "history"]);
  });

  it("supports quick commands, theme changes, safe text errors and Ctrl+L", async () => {
    const user = userEvent.setup();
    const { container } = render(<Terminal />);
    await user.click(screen.getByRole("button", { name: /travel/ }));
    expect(screen.getByText(/country list hasn’t been added/)).toBeTruthy();
    const input = screen.getByRole("textbox");
    await user.type(input, "theme light{Enter}");
    expect(container.querySelector("main")?.dataset.theme).toBe("light");
    await user.type(input, "<script>alert(1)</script>{Enter}");
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText(/Command not found/)).toBeTruthy();
    await user.keyboard("{Control>}l{/Control}");
    expect(screen.queryByText(/Command not found/)).toBeNull();
  });
});
