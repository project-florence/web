# Florence — Smart Investment Assistant

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server (proxies `/api` → `VITE_API_URL`) |
| `npm run build` | `tsc -b` (typecheck both tsconfigs) → `vite build` |
| `npm run lint` | `oxlint` (uses `.oxlintrc.json`; not type-aware) |
| `npm run preview` | `vite preview` (serve built output) |

**No tests exist** — no test framework or test files in the repo.

## Repo conventions

- **TypeScript strict**: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly` are errors
- **Path alias**: `@/` → `./src/` (configured in both `tsconfig.app.json` and `vite.config.ts`)
- **Tailwind v4**: no config file — uses `@tailwindcss/vite` plugin; CSS-first setup in `src/index.css`
- **shadcn/ui**: style `base-nova`, base color `neutral`, icon lib `lucide`, aliases in `components.json`
- **State split**: Zustand for client state (auth, nav, theme), TanStack React Query for server/API state
- **i18n**: Turkish primary (`index.html` `lang="tr"`), English secondary. Strings in `src/i18n/locales/{tr,en}.json`
- **Dark-first**: `index.html` has `class="dark"`; all styling is dark-mode-first

## Architecture notes

- **Entrypoint**: `src/main.tsx` → `src/App.tsx` (query client, tooltip provider, router)
- **Auth**: JWT stored in `localStorage` key `auth_token`; Zustand `authStore` manages state; `ProtectedRoute` wraps most pages
- **API client**: Axios instance in `src/lib/api.ts` with JWT interceptor; config in `src/config/api.ts`
- **Proxy**: Vite dev server proxies `/api/*` to `VITE_API_URL` (default `http://localhost:8000`)
- **No formatter config** — only `oxlint` for linting; no Prettier/Biome/dprint
- **No CI/CD** — no GitHub workflows
- **No `.env.example`** — `.env` is gitignored. Create one if adding new env vars.

## Key gotchas

- **Build is two-step**: `tsc -b` then `vite build`. A pure `vite build` skips typechecking.
- **Oxlint is NOT type-aware** — `tsc -b` catches type errors that `oxlint` won't.
- **`.env` is in `.gitignore`** — never commit real `.env` values. The file currently has a live LAN IP.
