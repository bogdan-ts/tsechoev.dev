# Personal resume website spec

## Product goal

Create a minimal personal resume website for Bogdan Tsechoev, a full stack engineer.

The site should be simple enough to host on GitHub Pages and maintain without framework bullshit.

## Style direction

- Minimalist.
- Monospace typography with JetBrains Mono.
- Terminal-inspired visual language.
- Clean and readable, not a fake hacker toy.
- Fast loading.
- Works well on mobile and desktop.

## Content strategy

The page should be short, sharp, and recruiter-readable.

- Keep the latest role as the main selling point.
- Compress older roles heavily.
- Avoid LinkedIn-style long responsibility dumps.
- Prefer outcome-oriented bullets over generic responsibilities.
- Emphasize full-stack product ownership, PostgreSQL-heavy systems, AI/LLM integration, React + TypeScript, infrastructure automation, and production delivery.

## Content requirements

The page must include:

1. A short hero intro.
2. A clear role line: software engineer / full stack developer.
3. A compact summary based on current work.
4. Skills grouped by category.
5. Concise experience entries:
   - Postgres.ai — Database Lab: current role, strongest detail.
   - Avanti Pharma: compressed frontend/product engineering role.
   - House: compressed junior role.
6. Education.
7. Contact links.
8. A resume/CV link or placeholder for it.

## Technical requirements

- Use TypeScript.
- Use Svelte with Vite.
- Produce a static site deployable to GitHub Pages.
- Avoid backend requirements.
- Keep dependencies minimal and framework-native where possible.
- Use tests for content and component rendering rules.
- The build output must be static files in `dist/`.

## Accessibility requirements

- Use semantic HTML.
- Keep sufficient contrast.
- Ensure the page has one `h1`.
- Main content must be inside a `main` element.
- Links must have meaningful labels.

## Initial acceptance criteria

- `npm test` passes.
- `npm run build` produces `dist/index.html`.
- Rendered content includes Bogdan's name, role, current company, compressed previous roles, skills, education, and contact section.
- The app mounts through a Svelte root component.
- Visual style uses JetBrains Mono with monospace fallback.
