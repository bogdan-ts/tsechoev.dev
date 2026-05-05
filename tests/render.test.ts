import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import App from "../src/App.svelte";

describe("resume website rendering", () => {
  const html = render(App).body;

  it("renders Bogdan's identity and role", () => {
    expect(html).toContain("Bogdan Tsechoev");
    expect(html).toContain("Senior Fullstack Engineer with backend and platform focus");
    expect(html).toContain("Bangkok, Thailand");
  });

  it("renders required sections", () => {
    expect(html).toContain("skills");
    expect(html).toContain("backend");
    expect(html).toContain("frontend");
    expect(html).toContain("platform");
    expect(html).toContain("ai");
    expect(html).toContain("experience");
    expect(html).toContain("education");
    expect(html).toContain("contact");
    expect(html).toContain("languages");
  });

  it("renders current role as the strongest experience block", () => {
    expect(html).toContain("Postgres.ai — Database Lab");
    expect(html).toContain("Developed real-time AI chat interface");
    expect(html).toContain("Postgres-centric APIs");
    expect(html).toContain("single-action self-service deployment flow");
    expect(html).toContain("Stripe-based billing system from scratch");
  });

  it("renders compressed older roles", () => {
    expect(html).toContain("Avanti Pharma");
    expect(html).toContain("reducing page load time by ~50%");
    expect(html).toContain("House VL");
    expect(html).toContain("Developed e-commerce and corporate websites using Next.js");
  });

  it("renders education and public links", () => {
    expect(html).toContain("Far Eastern Federal University");
    expect(html).toContain("English");
    expect(html).toContain("Russian");
    expect(html).toContain("mailto:tsechoev.bogdan@gmail.com");
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

  it("does not render projects section", () => {
    expect(html).not.toContain("projects-title");
  });
});
