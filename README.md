# ios-code-space

A clean Next.js workspace for a browser-based coding dashboard with Projects, Editor, and Console pages.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- npm run dev: start development server
- npm run build: create production build
- npm run start: run production server
- npm run lint: run lint checks

## File map

- .github/workflows/webpack.yml: GitHub Actions CI for lint and build on main PR/push.
- .gitignore: ignore rules for dependencies, build artifacts, env files, and logs.
- .vscode/settings.json: local VS Code editor preferences for this workspace.
- LICENSE: repository license (MIT).
- README.md: project overview, commands, and full file descriptions.
- next-env.d.ts: Next.js generated TypeScript reference declarations.
- next.config.js: Next.js runtime config (strict mode and security-related header setting).
- package.json: npm metadata, scripts, dependencies, and license field.
- postcss.config.js: PostCSS plugin wiring for Tailwind and Autoprefixer.
- tailwind.config.js: Tailwind scan paths and theme extensions.
- tsconfig.json: TypeScript compiler configuration for Next.js app router.
- app/globals.css: global styles and visual base for the app.
- app/layout.tsx: shared app layout with top navigation and metadata.
- app/page.tsx: home page with entry cards for each feature page.
- app/projects/page.tsx: projects list demo page.
- app/editor/page.tsx: interactive editor-like page with file list and simulated run output.
- app/console/page.tsx: terminal-like command simulation page.

## Notes

- This project uses the Next.js App Router.
- UI is intentionally lightweight to keep iteration fast.
