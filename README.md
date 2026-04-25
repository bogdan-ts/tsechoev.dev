# tsechoev.dev

❤️ Made with love and vibecode.

## Stack

- TypeScript
- Vite
- Vitest
- GitHub Pages (auto deploy via GitHub Actions)

## Local development

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

## Scripts

- `npm run dev` — start dev server
- `npm run test` — run tests
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build

## Deploy

Push to `main` branch. GitHub Actions workflow builds/tests and deploys `dist/` to GitHub Pages.

## Project structure

- `src/profile.ts` — profile content (experience, skills, links)
- `src/render.ts` — HTML rendering helpers
- `src/styles.css` — UI styles
- `tests/render.test.ts` — rendering tests

## Customization

1. Edit data in `src/profile.ts`
2. Adjust markup in `src/render.ts`
3. Tweak styles in `src/styles.css`

## License

The Unlicense (public domain)
