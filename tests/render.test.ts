import { describe, expect, it } from "vitest";
import { profile } from "../src/profile";
import { renderProfile } from "../src/render";

describe("resume website rendering", () => {
  const html = renderProfile(profile);

  it("renders Bogdan's identity and role", () => {
    expect(html).toContain("Bogdan Tsechoev");
    expect(html).toContain("Software Engineer / Full Stack Developer");
  });

  it("renders required sections", () => {
    expect(html).toContain("skills");
    expect(html).toContain("experience");
    expect(html).toContain("education");
    expect(html).toContain("projects");
    expect(html).toContain("contact");
  });

  it("renders current role as the strongest experience block", () => {
    expect(html).toContain("Postgres.ai — Database Lab");
    expect(html).toContain("LLM providers");
    expect(html).toContain("PostgreSQL-first platform");
    expect(html).toContain("one-click monitoring stack");
  });

  it("renders compressed older roles", () => {
    expect(html).toContain("Avanti Pharma");
    expect(html).toContain("Modernized legacy frontend systems");
    expect(html).toContain("House");
    expect(html).toContain("Developed e-commerce websites");
  });

  it("renders education and public links", () => {
    expect(html).toContain("Far Eastern Federal University");
    expect(html).toContain("https://github.com/bogdan-ts");
    expect(html).toContain("linkedin");
  });

  it("renders a semantic main element and one h1", () => {
    expect(html).toContain("<main");
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
  });

  it("renders a resume link", () => {
    expect(html).toContain(">resume</a>");
  });
});
