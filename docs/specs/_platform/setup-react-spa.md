# Setup React SPA

## Status: implemented (slice 1/6)

## Implementation

**Workspace**: pnpm workspace with `frontend/` package (`@shiplens/frontend`).

**Artifacts**:
- `pnpm-workspace.yaml` — declares `frontend/` as a workspace package
- `frontend/package.json` — React 19, React Router v7, Vite 7, Vitest 4, Biome 2.4
- `frontend/vite.config.ts` — dev server on port 5173 with API proxy for `/dashboard/data`, `/analytics`, `/api`, `/settings`, `/sync`, `/linear`, `/webhooks`, `/notifications`
- `frontend/src/main.tsx` — `createBrowserRouter` + `RouterProvider` wrapped in `LocaleProvider`
- `frontend/src/app.tsx` — `App` layout with `Outlet`, `ShiplensShell` for index + catch-all routes
- `frontend/src/locale-context.tsx` — React context fetching `GET /settings/language` on mount
- `frontend/tests/app.test.tsx` — 2 tests proving the shell renders on root and unknown routes
- `frontend/tests/vitest.d.ts` — augments Vitest `Assertion` with `@testing-library/jest-dom` matchers

**Backend integration**:
- `src/main/app.module.ts` — `ServeStaticModule.forRoot` serves `frontend/dist/` for non-API routes (SPA fallback)
- Added `@nestjs/serve-static` as a dependency

**Root tsconfig**: excludes `frontend/` so backend compilation ignores it.

**Architectural decisions**:
- Frontend lives alongside backend at root level (`frontend/` + `src/`), not in a `backend/` subdirectory. The monorepo split to `frontend/` + `backend/` is deferred to a separate concern.
- Vitest and Biome versions aligned between root and frontend to avoid resolution conflicts.
- React Router v7 used in SPA mode (`createBrowserRouter`), not framework mode.
- Index route and catch-all route both render `ShiplensShell` to guarantee the minimal shell is visible at any path.



Slice 1 of the frontend migration. No dependencies on other slices.

## Context

Shiplens is currently a single-package NestJS project with no frontend tooling. To migrate the 4 inline HTML pages to React, the project needs a frontend workspace with its own build pipeline, dev server with API proxy, testing setup, and linting. The React app will be served as static files by NestJS in production and via a dev proxy during development.

## Rules

- The frontend lives in a `frontend/` directory at the project root, as a pnpm workspace package
- The frontend uses React 19 with React Router v7 (framework mode disabled, SPA mode)
- The frontend uses TypeScript with strict mode enabled
- The frontend uses Vite as the build tool and dev server
- The dev server proxies all API requests (`/dashboard/data`, `/analytics/*`, `/api/*`, `/settings/*`, `/sync/*`, `/linear/*`, `/webhooks/*`, `/notifications/*`) to the NestJS backend at `http://localhost:3000`
- The production build outputs static files to `frontend/dist/`
- NestJS serves the `frontend/dist/` directory as static files via `@nestjs/serve-static` in production
- NestJS returns `index.html` for all non-API routes (SPA fallback)
- The frontend uses Vitest for testing with `@testing-library/react` and `jsdom` environment
- The frontend uses Biome for linting and formatting (shared `biome.json` or extended config)
- The root `pnpm-workspace.yaml` declares `frontend/` as a workspace package
- The root `package.json` gains scripts to run frontend commands: `pnpm --filter frontend dev`, `pnpm --filter frontend build`, `pnpm --filter frontend test`
- The React app renders a minimal shell (empty layout with `<Outlet />`) and a catch-all route that displays "Shiplens" to prove the setup works
- i18n support is preserved: the React app fetches the workspace language from `GET /settings/language` on startup

## Scenarios

- dev server starts: {`pnpm --filter frontend dev` executed} -> Vite dev server starts on port 5173 + API requests proxied to port 3000
- api proxy works: {dev server running, fetch `/dashboard/data`} -> request proxied to NestJS backend + JSON response returned
- production build: {`pnpm --filter frontend build` executed} -> static files generated in `frontend/dist/` with `index.html`
- nestjs serves spa: {production mode, browser navigates to `/dashboard`} -> NestJS serves `frontend/dist/index.html`
- spa fallback: {production mode, browser navigates to unknown route `/foo`} -> NestJS serves `frontend/dist/index.html` (React Router handles 404)
- vitest runs: {`pnpm --filter frontend test` executed} -> Vitest discovers and runs tests in `frontend/tests/`
- biome lints: {`pnpm --filter frontend lint:ci` executed} -> Biome checks `frontend/src/` with zero errors
- typescript compiles: {`pnpm --filter frontend typecheck` executed} -> `tsc --noEmit` passes with zero errors
- minimal shell renders: {browser opens `http://localhost:5173`} -> page displays "Shiplens" text
- workspace language loaded: {app starts, backend returns `{ "language": "fr" }`} -> app stores locale as "fr"

## Out of scope

- Migrating any existing page (Slices 3-6)
- Design system extraction (Slice 2)
- Removing HTML-serving controllers (Slice 6)
- CI/CD pipeline changes
- SSR or pre-rendering
- Adding React dependencies beyond the core setup (charting libraries, etc.)

## Glossary

| Term | Definition |
|------|------------|
| SPA fallback | Server configuration that returns `index.html` for any route not matching a static file or API endpoint, letting the client-side router handle navigation |
| Workspace package | A directory declared in `pnpm-workspace.yaml` that pnpm treats as a separate package within the same repository |
| API proxy | Vite dev server feature that forwards matching requests to another server (the NestJS backend) to avoid CORS issues during development |
