import { describe, expect, it } from "vitest";
import { profile } from "../src/profile";
import { renderProfile } from "../src/render";

describe("resume website rendering", () => {
  const html = renderProfile(profile);

  it("renders Bogdan's identity and role", () => {
    expect(html).toContain("Bogdan");
    expect(html).toContain("Full Stack Developer");
  });

  it("renders required sections", () => {
    expect(html).toContain("skills");
    expect(html).toContain("experience");
    expect(html).toContain("projects");
    expect(html).toContain("contact");
  });

  it("renders a semantic main element and one h1", () => {
    expect(html).toContain("<main");
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
  });

  it("renders a resume link", () => {
    expect(html).toContain(">resume</a>");
  });
});
