# ios-code-space

Browser coding workspace (Termux-inspired) — works on desktop and mobile Safari.

## Features

- **Editor** — multi-file workspace, Run, Guess deps
- **Console** — commands: `help`, `ls`, `guess`, `run`, `new <file>`, `clear`, `status`
- **Python** — in-browser via **Pyodide** (Web Worker + CDN)
- **JavaScript** — sandboxed Web Worker
- **Persistence** — project + terminal log in `localStorage`
- **Guess deps** — UPM-style import → package detection (`lib/deps`)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Python (Pyodide)

First **Run** on a `.py` file downloads the Pyodide runtime from jsDelivr (~10MB).  
Worker: `public/pyodide-worker.js`.  
Optional packages (numpy, pandas, …) install via `micropip` when detected by Guess.

## Project layout

```
app/                 Next.js App Router pages + api/guess
components/          (reserved)
lib/
  types.ts           File / Project types
  storage.ts         localStorage
  project-context.tsx
  commands.ts        Console command registry
  deps/guess.ts      Dependency guessing
  deps/map.ts        Module → package maps
  runner/            Pyodide + JS runners
public/pyodide-worker.js
```

## API

`POST /api/guess` body `{ "files": [{ "name", "language", "content", "id" }] }`  
→ `{ packages, modules, language }`

## Scripts

- `npm run dev` — development
- `npm run build` / `npm start` — production
- `npm run lint` — ESLint

## License

MIT
