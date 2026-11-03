import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { GlobeBoundary } from "../src/components/globe-boundary";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("isolates renderer errors without removing surrounding content", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  function BrokenGlobe(): never {
    throw new Error("Renderer failed");
  }
  render(
    <>
      <h1>Travel</h1>
      <GlobeBoundary>
        <BrokenGlobe />
      </GlobeBoundary>
      <p>Cambodia</p>
    </>,
  );
  expect(screen.getByRole("alert").textContent).toContain("The globe could not load");
  expect(screen.getByRole("button", { name: "Reload page" })).toBeTruthy();
  expect(screen.getByText("Cambodia")).toBeTruthy();
});
