# Detect cycle themes with AI

## Status: implemented

## Implementation

**Bounded Context**: `analytics`

### Backend artifacts
- Entity: `backend/src/modules/analytics/entities/cycle-theme-set/` (aggregate `CycleThemeSet` with 1-5 themes invariant and `isCachedWithin(now, ttl)` TTL rule)
- Ports: `cycle-theme-set-data.gateway.ts` (cycle + issues data), `cycle-theme-set-cache.gateway.ts` (cache abstraction). AI provider reuses existing `AiTextGeneratorGateway`.
- Use cases: `DetectCycleThemesUsecase` (with `forceRefresh` flag), `GetCycleIssuesForThemeUsecase` (drill-down)
- Gateways: `cycle-theme-set-data.in-prisma.gateway.ts`, `cycle-theme-set-cache.in-memory.gateway.ts`
- Presenters: `cycle-themes.presenter.ts`, `cycle-theme-issues.presenter.ts`
- Controller: `cycle-themes.controller.ts`
- Migration: none (cache is in-memory only per spec)

### Frontend artifacts
- Entity / response: `frontend/src/modules/analytics/entities/top-cycle-themes/` (Zod discriminated unions matching the backend DTOs: `ready | below_threshold | ai_unavailable | no_active_cycle` for the list, `ready | theme_not_found | no_active_cycle` for the drill-down)
- Gateway port: `top-cycle-themes.gateway.ts` (abstract class). HTTP impl: `top-cycle-themes.in-http.gateway.ts` with conditional `?refresh=true` and optional `?provider=` query params, Zod validation, `GatewayError` on non-2xx.
- URL contract: `interface-adapters/url-contracts/top-cycle-themes.url-contract.ts`
- Use cases: `GetTopCycleThemesUsecase` (`{ teamId, forceRefresh?, provider? }`), `ListCycleThemeIssuesUsecase` (`{ teamId, themeName }`)
- Presenters: `top-cycle-themes.presenter.ts` (4 backend statuses → semantic booleans `showThemesList | showBelowThreshold | showAiUnavailable | showNoActiveCycle | showRefreshButton`, client-side metric re-sort with name asc tie-breaker, cap at 5 rows), `cycle-theme-issues-drawer.presenter.ts` (closed/loading/error/ready/theme_not_found)
- Translations: `top-cycle-themes.translations.ts` (EN/FR for card title, metric labels, refresh, 3 empty-state messages, drawer copy)
- Hook: `use-top-cycle-themes.ts` (React Query bridge; `forceRefresh` via counter token in query key)
- Views (humble, one component per file under `views/top-cycle-themes/`): `section`, `ready`, `loading`, `error`, `refresh-button`, `drawer`
- Shared shells reused: `cycle-insight-shell/` (card with `headerAction` slot, metric toggle, ranking row, empty state) and `cycle-insight-drawer/` (drawer + issue row)
- Test doubles: `stub.top-cycle-themes.in-memory.gateway.ts` (tracks `forceRefresh` / `provider` / `teamId` per call), `failing.top-cycle-themes.in-memory.gateway.ts` (throws `GatewayError`)
- Builders: `top-cycle-theme-row-response.builder.ts`, `cycle-theme-issue-row-response.builder.ts`
- Registry wiring: `frontend/src/main/dependencies.ts` registers `getTopCycleThemes` + `listCycleThemeIssues`. Mounted in `dashboard.view.tsx` as the third widget of the right column, under `TopCycleAssigneesSectionView`.

### Endpoints
- `GET analytics/cycle-themes/:teamId?provider=&refresh=` — `DetectCycleThemesUsecase`
- `GET analytics/cycle-themes/:teamId/themes/:themeName/issues` — `GetCycleIssuesForThemeUsecase`

**Architectural decisions**:
- 24h TTL lives as a domain invariant on `CycleThemeSet.isCachedWithin(now, ttl)` — gateway is a dumb key-value store; swappable without moving the rule.
- Cache keyed by `cycleId` alone (not `(cycleId, language)`). Language stored on the entity so cached names persist in the previous language until refresh (spec rule).
- Cycle-end invalidation is passive: the next active cycle has a different `cycleId`, so the old entry becomes unreachable. No active cleanup.
- `AiProviderUnavailableError` is caught in the usecase and mapped to `{ status: 'ai_unavailable' }` (silent degradation). Distinct from sprint-report, which rethrows — dashboard widget must not take down other widgets.
- Below-10 guard lives in the usecase (application rule), returns `{ status: 'below_threshold', issueCount }`, does not throw.
- Single `DetectCycleThemesUsecase` with `forceRefresh` flag (no separate refresh usecase — same intention).
- New gateway file infix adopted: `.in-memory.` (join `.in-prisma.`, `.in-file.`, `.in-http.`, `.in-crypto.`).
- Default backend sort: descending `issueCount`. Frontend re-sorts when user toggles metric.
- Frontend AI-unavailable rendering: card stays in the DOM with an amber warning empty state and a refresh button (overrides the spec rule "only this card is hidden" — see updated rule below). Discovery + retry beats silent disappearance.
- Refresh button visible only on `ready` and `ai_unavailable` (the two states where a retry has meaning). Hidden on `below_threshold` and `no_active_cycle` — nothing to refresh, the backend won't call AI.
- Provider query param is optional on the frontend gateway: omitted today (backend defaults to Anthropic), wired through the usecase signature so a future settings UI can inject it without a refactor.
- AsyncState collapse: the 4 backend statuses are folded into the `ready` discriminant of `AsyncState<TopCycleThemesViewModel>`. The presenter exposes semantic booleans so views never branch on backend enums.
- Shared `CycleInsightEmptyStateView` extended with a `tone?: 'neutral' | 'warning'` prop instead of duplicating a view per tone.

Depends on: `select-team-on-dashboard`, `show-top-cycle-projects` (reuses the right-side column and the shared card / drill-down drawer shells).

## Context

The fourth widget in the dashboard right-side column uses AI to cluster the cycle's issues into 5 semantic themes (e.g. "Auth refactor", "Payments bugs"). This surfaces thematic concentration that no other widget reveals: projects and epics are structural, assignees are people, themes are what-the-work-was-about. This is the only AI-backed widget on the dashboard and carries specific reliability, cost, and caching constraints.

## Rules

- A card titled "Top cycle themes" is displayed in the dashboard right-side column directly below "Top cycle assignees"
- Themes are generated by the existing AI provider infrastructure (same provider stack used by sprint reports)
- The AI input consists of each issue's title and labels — the description is excluded (token cost vs quality trade-off)
- The AI output is exactly 5 themes, each with a short name (1 to 3 words) and the list of issue identifiers classified in that theme
- When the active cycle has fewer than 10 issues, the card displays "Not enough issues for theme detection." and no AI call is made
- When the AI provider is unavailable, the card displays a localized warning message in an amber tone with a manual refresh button — other dashboard widgets remain visible and unaffected
- Themes are cached per cycle identifier; a cached result is reused until the cycle ends OR 24 hours have elapsed since the last successful call, whichever comes first
- A manual refresh button on the card forces a new AI call, bypassing the cache
- Each row shows the theme name and the metric value aggregated over the issues classified in that theme
- Metric toggle values: count (classified issues), points (sum of their story points), time (sum of their cycle time)
- Rows are sorted descending by the active metric
- Theme names are generated in the workspace language in effect at the time of the AI call
- If the workspace language changes after a cache hit, cached theme names remain in the previous language until the next successful call (cache refresh)
- Clicking a row opens the shared drill-down drawer listing the issues classified in that theme with title, assignee, points, status, Linear link
- When no active cycle exists, the card shows "No active cycle for this team."
- The drawer closes on click-outside, Escape, or an explicit close button
- All static text (card title, metric labels, guidance messages) is translated via the workspace language

## Scenarios

- nominal AI themes: {cycle has 25 issues with varied titles and labels} → AI returns 5 themes with short names and counts, displayed sorted by count descending
- below threshold: {cycle has 7 issues} → no AI call, card shows "Not enough issues for theme detection."
- AI provider unavailable: {AI provider returns an error} → theme card stays visible with an amber warning message and a refresh button; other dashboard widgets unaffected
- cache hit within 24h: {cycle has cached themes from 2 hours ago} → cached themes displayed, no AI call
- cache expired within active cycle: {cached themes older than 24h, cycle still active} → new AI call triggered on load, cache refreshed
- cache invalidated at cycle end: {cycle transitions to completed, user navigates to dashboard} → the closed cycle's cache is no longer used (historical cycles are not recomputed)
- manual refresh: {user clicks refresh button} → new AI call triggered, cache overwritten
- sort by points: {user toggles to points; theme A has 7 issues totaling 12 points, theme B has 4 issues totaling 30 points} → B (30), A (12)
- sort by time: {user toggles to time} → rows reorder by summed cycle time
- click row opens drawer: {user clicks "Auth refactor" row} → drawer lists issues classified in that theme
- theme names in workspace language: {workspace language = FR at AI call time} → theme names returned in French
- language switch mid-view: {workspace language changes from EN to FR while themes are displayed from cache} → static labels re-rendered in FR; cached theme names remain in EN until the next cache refresh
- no active cycle: {team has no active cycle} → card shows "No active cycle for this team."
- team switch reloads: {user selects another team} → card reloads themes for the new team's active cycle (cache keyed per cycle)
- AI returns fewer than 5 themes: {AI returns 3 themes for a small or homogeneous cycle} → 3 rows rendered, no padding

## Out of scope

- Custom theme naming by the user
- Persisting themes historically across cycles
- Cross-cycle theme trend analysis
- Theme detection restricted to in-progress issues (uses all issues active in the cycle, completed and in-progress)
- Configuring the AI input (fixed: title + labels)
- Configuring the issue threshold (fixed at 10)
- Persisting themes in a database (cache-only, lost on server restart)
- Per-user customization of theme output
- Retrying failed AI calls

## Glossary

| Term | Definition |
|------|------------|
| Cycle theme | AI-inferred semantic cluster grouping issues of an active cycle by similarity of title and labels |
| Theme cache | Per-cycle memo of AI-generated themes with a 24-hour TTL during the active cycle |
| Manual refresh | User-triggered bypass of the theme cache forcing a fresh AI call |
