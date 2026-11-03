import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Terminal } from "../src/components/terminal";

afterEach(cleanup);

describe("interactive terminal", () => {
  it("starts with a brief introduction and all commands, not whoami output", () => {
    render(<Terminal />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("I’m Bogdan.");
    expect(screen.getByRole("button", { name: /whoami/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /travel/ })).toBeTruthy();
    expect(screen.queryByText("ABOUT ME")).toBeNull();
  });

  it("runs typed commands and retains unfinished drafts through history", async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByRole("textbox");
    await user.type(input, "whoami{Enter}");
    expect(screen.getByText("ABOUT ME")).toBeTruthy();
    await user.type(input, "unfinished");
    await user.keyboard("{ArrowUp}");
    expect((input as HTMLInputElement).value).toBe("whoami");
    await user.keyboard("{ArrowDown}");
    expect((input as HTMLInputElement).value).toBe("unfinished");
  });

  it("appends output and retains previous answers and recall history", async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByRole("textbox");
    await user.type(input, "whoami{Enter}");
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    await user.type(input, "skills{Enter}");
    expect(screen.getByText("ABOUT ME")).toBeTruthy();
    expect(screen.getAllByRole("heading", { name: /Skills/ })).toHaveLength(2);
    await user.type(input, "history{Enter}");
    expect(
      within(screen.getByRole("list", { name: "Command history" }))
        .getAllByRole("listitem")
        .map((entry) => entry.textContent),
    ).toEqual(["whoami", "skills", "history"]);
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
    expect(screen.queryByRole("link", { name: /Download CV PDF/ })).toBeNull();
    await user.type(input, "history{Enter}");
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "cv",
      "clear",
      "history",
    ]);
  });

  it("supports quick commands, theme changes, safe text errors and Ctrl+L", async () => {
    const user = userEvent.setup();
    const { container } = render(<Terminal />);
    await user.click(screen.getByRole("button", { name: /travel/ }));
    expect(screen.getAllByRole("listitem")).toHaveLength(19);
    expect(screen.getByText("Hong Kong")).toBeTruthy();
    expect(screen.getByText("Macau")).toBeTruthy();
    const input = screen.getByRole("textbox");
    await user.type(input, "theme light{Enter}");
    expect(container.querySelector("main")?.dataset.theme).toBe("light");
    await user.type(input, "<script>alert(1)</script>{Enter}");
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText(/Command not found/)).toBeTruthy();
    await user.keyboard("{Control>}l{/Control}");
    expect(screen.queryByText(/Command not found/)).toBeNull();
  });

  it("cancels drafts without execution or history and edits around the cursor", async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.type(input, "whoami");
    await user.keyboard("{Control>}c{/Control}");
    expect(input.value).toBe("");
    expect(screen.getByText("whoami^C")).toBeTruthy();
    expect(screen.queryByText("ABOUT ME")).toBeNull();
    await user.type(input, "history{Enter}");
    expect(
      within(screen.getByRole("list", { name: "Command history" }))
        .getAllByRole("listitem")
        .map((entry) => entry.textContent),
    ).toEqual(["history"]);
    await user.type(input, "hello world");
    input.setSelectionRange(6, 6);
    await user.keyboard("{Control>}u{/Control}");
    expect(input.value).toBe("world");
    input.setSelectionRange(2, 2);
    await user.keyboard("{Control>}k{/Control}");
    expect(input.value).toBe("wo");
  });
  it("leaves composition input and shortcuts to the IME", async () => {
    const user = userEvent.setup();
    const { container } = render(<Terminal />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.type(input, "skills{Enter}whoami");
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "ArrowUp", isComposing: true });
    expect(input.value).toBe("whoami");
    const form = container.querySelector("form");
    if (!form) throw new Error("Missing prompt form");
    fireEvent.submit(form);
    expect(screen.queryByText("ABOUT ME")).toBeNull();
    fireEvent.compositionEnd(input);
    fireEvent.submit(form);
    expect(screen.getByText("ABOUT ME")).toBeTruthy();
  });
});
