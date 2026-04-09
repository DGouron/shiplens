# Migrate frontend to React SPA

## Status: planned

Master spec for migrating the Shiplens frontend from server-rendered inline HTML (NestJS template strings) to a React Router v7 SPA. Implementation is split into 6 ordered slices, each with its own spec.

## Context

The current frontend consists of 4 HTML pages generated as TypeScript template literals inside NestJS controllers. Each page embeds the full design system (CSS variables, theme support, glassmorphism, typography), navigation, and data-fetching logic as inline JavaScript. CSS is duplicated verbatim across all 4 files. JS relies on manual DOM manipulation with `innerHTML` string concatenation and raw `fetch` calls. There are no components, no client-side routing, and no frontend tests. The NestJS presenters already format domain data into DTOs that the inline JS consumes via JSON endpoints, but 4 controllers still serve HTML via `text/html` responses.

This migration restructures the repo into a monorepo with `frontend/` and `backend/` directories. The `.claude/` config is shared at the root. The frontend is a React SPA that consumes the existing NestJS JSON API. The backend becomes a pure API server. The design system is centralized. Each page becomes a tested React route.

## Current state

| Page | HTML template | HTML-serving controller | JSON endpoint(s) |
|------|---------------|------------------------|-------------------|
| Dashboard | `workspace-dashboard.html.ts` | `WorkspaceDashboardController.getDashboardPage()` | `GET /dashboard/data` |
| Cycle Report | `cycle-report-page.html.ts` | `CycleReportPageController.getPage()` | `GET /analytics/teams/:teamId/cycles`, `GET /analytics/cycles/:cycleId/issues`, `GET /analytics/cycles/:cycleId/metrics`, `GET /analytics/cycles/:cycleId/bottlenecks`, `GET /analytics/cycles/:cycleId/report`, `POST /analytics/cycles/:cycleId/report` |
| Member Health Trends | `member-health-trends.html.ts` | `MemberHealthTrendsPageController.getPage()` | `GET /api/analytics/teams/:teamId/members/:memberName/health` |
| Settings | `settings-page.html.ts` | `SettingsPageController.getPage()` | `GET /settings/language`, `PUT /settings/language`, `GET /settings/teams/:teamId/timezone`, `PUT /settings/teams/:teamId/timezone`, `GET /settings/teams/:teamId/excluded-statuses`, `PUT /settings/teams/:teamId/excluded-statuses`, `GET /settings/teams/:teamId/available-statuses` |

## Slices

| # | Spec | Scope |
|---|------|-------|
| 1 | [setup-react-spa](setup-react-spa.md) | Scaffold the React SPA project, configure React Router v7, Vitest, Biome, dev proxy, build pipeline |
| 2 | [extract-design-system](extract-design-system.md) | Extract shared CSS (tokens, theme, glassmorphism, nav, typography, buttons) into reusable modules |
| 3 | [migrate-dashboard-page](migrate-dashboard-page.md) | Migrate the dashboard to a React route with ViewModel hook |
| 4 | [migrate-cycle-report-page](migrate-cycle-report-page.md) | Migrate the cycle report page to a React route with ViewModel hook |
| 5 | [migrate-member-health-trends-page](migrate-member-health-trends-page.md) | Migrate the member health trends page to a React route with ViewModel hook |
| 6 | [migrate-settings-page](migrate-settings-page.md) | Migrate the settings page to a React route with ViewModel hook, remove all HTML-serving controllers |

## Dependency order

Slice 1 must be completed first. Slice 2 depends on Slice 1. Slices 3-6 each depend on Slices 1 and 2. Slices 3-5 are independent of each other. Slice 6 is last because it removes the HTML-serving controllers after all pages are migrated.

## Monorepo structure

```
shiplens/
├── .claude/          # shared config (CLAUDE.md, rules, skills, memory)
├── frontend/         # React Router v7 SPA (pnpm workspace)
├── backend/          # NestJS API (moved from root)
├── docs/             # specs, DDD docs, business rules
├── pnpm-workspace.yaml
└── package.json      # root workspace config
```

The backend move to `backend/` happens in Slice 1 alongside the frontend scaffolding. Both packages share the root `.claude/` directory, `docs/`, and git history.

## Out of scope

- Changing the NestJS API contracts (existing JSON endpoints stay as-is)
- Server-side rendering (SSR) with React — this is a client-side SPA
- Authentication or authorization (the app is single-tenant, no auth today)
- New features or pages not already existing
- Migrating the NestJS backend to a different framework
- E2E tests (existing Playwright tests will be adapted separately)
- Deployment pipeline changes (separate concern)
