# Personal resume website spec

## Product goal

Create a minimal personal resume website for Bogdan, a full stack developer.

The site should be simple enough to host on GitHub Pages and maintain without framework bullshit.

## Style direction

- Minimalist.
- Monospace typography.
- Terminal-inspired visual language.
- Clean and readable, not a fake hacker toy.
- Fast loading.
- Works well on mobile and desktop.

## Content requirements

The page must include:

1. A short hero intro.
2. A clear role line: full stack developer.
3. Skills grouped by category.
4. Experience summary.
5. Selected projects.
6. Contact links.
7. A resume/CV link or placeholder for it.

## Technical requirements

- Use TypeScript.
- Produce a static site deployable to GitHub Pages.
- Avoid backend requirements.
- Keep dependencies minimal.
- Use tests for content/model rendering rules.
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
- Rendered content includes Bogdan's name, full stack developer role, skills, projects, and contact section.
- Visual style uses a monospace font stack.
