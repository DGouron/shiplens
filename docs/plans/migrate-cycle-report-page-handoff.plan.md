# Cycle Report Migration — Handoff Plan (after 4.5)

## Branch state

Branch: `feat/analytics-migrate-cycle-report-page` (local, never pushed yet per user preference).

Commits (13+ total on the branch, ahead of master after 4.5):

1. `86857ab` refactor(analytics): return cycle status as English enum
2. `3ee603c` feat(analytics): add cycle-report page shell with team and cycle selectors — **4.1**
3. `e394c85` refactor(analytics): publish cycle-report URL contract with ubiquitous language
4. `8abe914` refactor(analytics): return cycle metrics as raw numeric DTO
5. `3044317` feat(analytics): render cycle-report metrics section with 6 KPI cards — **4.2**
6. `1149142` refactor(analytics): return bottleneck and blocked-issue durations as raw numerics
7. `7a43e33` fix(analytics): auto-select the most recent completed cycle instead of the latest
8. `37d7e0d` feat(analytics): render cycle-report bottlenecks and blocked-issues sections — **4.3**
9. `8499aab` refactor(analytics): return drifting-issue durations as raw numerics
10. `bcf8108` refactor(analytics): split cycle-report views into one-component-per-file with feature subfolders
11. `3f4fbe0` feat(analytics): render cycle-report estimation and drifting sections — **4.4**
12. `afb638d` refactor(analytics): drop french empty-message from report-history dto — **4.5 prep**
13. `(next)` feat(analytics): render cycle-report ai-report section — **4.5**

Tests: 317 frontend (+33 from 4.5) / 947 backend / typecheck clean / biome clean.
New dependency: `react-markdown@^9.1.0` wrapped behind `frontend/src/components/markdown-content.tsx`.

## Remaining work (task numbers)

- **#6 Sub-slice 4.6** — Member filter + navigation + digest
- **#7** Update spec + feature-tracker + event storming + open PR (run after 4.6)
- **#8 Sub-slice 4.7** — Custom React Router ErrorBoundary / errorElement
- **#9 Sub-slice 4.8** — UI/UX polish pass (CSS for the cycle-report sections — currently unstyled, including the new ai-report section)
- **#10** Investigate backend 500 on `GET /analytics/drifting-issues/:teamId` for team Produit (`d04d134b-2e71-4a34-a10f-dba512e42b53`). Other teams return 200 `[]`. Likely data-specific crash in `DetectDriftingIssuesUsecase`.
- **#11** Cosmetic: `generatedAtLabel` in ai-report shows raw ISO `2026-04-10T12:29:42.041Z`. Format via `Intl.DateTimeFormat` in the presenter.
- **#12** Brittle: ai-report cycle matching uses `cycleName` (legacy limitation). Expose `cycleId` in `ReportHistoryItemDto` to avoid mismatch on duplicate names.

## Recommended order for next session

1. **4.6 (Member filter + navigation + digest)** — cross-cutting: adds URL param `memberName` (extend the Published Language URL contract), affects existing blocked + drifting sections (filter by member), adds member-digest POST, adds link to `/member-health-trends`. Reuse the `MarkdownContent` wrapper in `frontend/src/components/markdown-content.tsx` for the digest output.
2. **#7 finalization** — update `docs/specs/analytics/migrate-cycle-report-page.md` status to `implemented`, update `docs/feature-tracker.md`, run `/event-storming analytics`, open PR.
3. **4.7 / 4.8 / #10 / #11 / #12** — polish / tech debt, can ship as follow-up PRs on master after the main PR merges.

## Mandatory rules (enforced by hooks + memories)

- **One component per `.view.tsx`** file. Multi-component blocked by `scripts/hooks/no-logic-in-views.sh`.
- **Views in per-feature subfolders**: `views/<feature>/<component>.view.tsx` (see `cycle-metrics/`, `bottleneck-analysis/`, `blocked-issues/`, `estimation-accuracy/`, `drifting-issues/`, `cycle-report/` for examples).
- **Zero domain logic in JSX** — no `> 0`, `=== null`, `!== null`, `.length >`, `.filter(`, `.reduce(`, `.some(`, `.every(` inside JSX. Presenter computes semantic booleans (`showX`, `hasX`, `isX`). View writes `{showX && ...}`.
- **AsyncState discriminant exception**: `state.status === 'loading' | 'ready' | 'error'` IS allowed (framework-level).
- **Humble view**: no hooks (`useState`, `useEffect`, etc.), no `fetch`, no gateway/usecase imports.
- **Published Language for URLs**: query params live in `interface-adapters/url-contracts/<feature>.url-contract.ts`. Never inline string literals like `'teamId'`.
- **Backend DTOs are raw numerics** (no formatted strings). Frontend does i18n and formatting. If you see a French string in a backend presenter, refactor it first in a dedicated prep commit before consuming from the frontend.
- **Naming audit**: run `/naming-audit <scope>` on new files before each commit. Act on Weak/Fail verdicts.
- **Chrome MCP browser validation**: after each sub-slice, validate in a real browser (MCP extension on Chromium is connected; `http://localhost:5173/cycle-report`). Select team "Produit" + cycle "Cycle 5" to see a completed cycle with real data.

## Architecture pattern per section (canonical)

Each data section (metrics, bottlenecks, blocked, estimation, drifting, ai-report) follows:

- **Entity**: `entities/<feature>/<feature>.response.ts` + `.response.schema.ts` (Zod strict) + `.gateway.ts` (abstract class port)
- **Gateway**: `interface-adapters/gateways/<feature>.in-http.gateway.ts` + `.response.guard.ts`
- **Usecase**: `usecases/<verb>-<feature>.usecase.ts`
- **Presenter**: `interface-adapters/presenters/<feature>.view-model.schema.ts` + `.presenter.ts` + `.translations.ts`
- **Hook**: `interface-adapters/hooks/use-<feature>.ts` (TanStack Query + presenter, `enabled: Boolean(teamId [&& cycleId])`)
- **Views**: `interface-adapters/views/<feature>/` — one component per file, humble
- **Stubs**: `testing/good-path/stub.<feature>.in-memory.gateway.ts` + `testing/bad-path/failing.<feature>.in-memory.gateway.ts`
- **Builder**: `tests/builders/<feature>-response.builder.ts`
- **Tests**: gateway / usecase / presenter / translations / hook specs + acceptance spec for the sub-slice
- **DI wiring**: `frontend/src/main/dependencies.ts` (register gateway + usecase, update `resetUsecases`)
- **Composition**: `use-cycle-report-page.ts` composes the new state + `cycle-report-section-renderer.view.tsx` dispatches on `placeholder.id`

## Key files to grep for patterns

- Reference implementation (clean): `frontend/src/modules/analytics/interface-adapters/views/cycle-metrics/`, `views/bottleneck-analysis/`, `views/blocked-issues/`, `views/estimation-accuracy/`, `views/drifting-issues/`
- Shell composition: `views/cycle-report/cycle-report.view.tsx` (route), `cycle-report-ready.view.tsx`, `cycle-report-section-renderer.view.tsx`
- Shell presenter and its `canRenderContent` per-section flag: `presenters/cycle-report-shell.presenter.ts`
- URL contract: `interface-adapters/url-contracts/cycle-report.url-contract.ts`

## 4.5 — DONE

Implemented in commits `afb638d` (backend prep) + the next feat commit. Final shape:

- **Backend prep**: `ReportHistoryDto.emptyMessage` removed (was hardcoded french). Frontend computes empty messages via translations.
- **Endpoints used**:
  - `GET /analytics/teams/:teamId/reports` → history list `{reports: [{id, cycleName, language, generatedAt}]}`
  - `GET /analytics/reports/:reportId` → detail `{id, cycleName, language, generatedAt, markdown, plainText}` (already-assembled markdown, locale-aware backend-side)
  - `POST /analytics/cycles/:cycleId/report` body `{teamId, provider: 'Anthropic'}` → returns `SprintReportDto` (no id field; we ignore the body and refetch history instead)
- **Cycle matching**: by `cycleName` (brittle, see #12). After POST-generate, history is invalidated → refetch finds the new report by name → detail query auto-fires.
- **Markdown renderer**: `react-markdown@^9.1.0` wrapped in `frontend/src/components/markdown-content.tsx` (UI primitive, tested).
- **Provider**: hardcoded `'Anthropic'` in the gateway HTTP impl (matches legacy `cycle-report-page.html.ts:917`). Provider selector deferred.
- **Hook**: `useAiReport({teamId, cycleId, cycleName})` exposes `state + generate + exportMarkdown + copyToClipboard`. Uses `useMutation` for POST, chained `useQuery` for read flow, `useState + useRef + setTimeout` for the 2s copy-confirmation banner.
- **Views** (one component per file, `views/ai-report/`): `ai-report-section.view.tsx` (AsyncState dispatch), `ai-report-ready.view.tsx` (markdown + 3 inline buttons + confirmation), `ai-report-empty.view.tsx` (empty state + Generate button).
- **Browser-validated**: copy ✓ (clipboard contains markdown, "Rapport copie !" banner visible 50→1800ms), export ✓ (Blob 3KB `text/markdown`, filename `sprint-report-cycle-5.md`), markdown rendered with proper h1/h2/emojis. Generate not browser-tested (would consume Anthropic API) — covered by acceptance test.

## 4.6 scope (Member filter + navigation + digest)

Spec lines 36–38, 59–61 of the spec.

- URL param `memberName` in `cycle-report.url-contract.ts` (extend the contract).
- Member list derives from blocked-issues + drifting (union of assignees). Compute in the shell presenter or a dedicated hook.
- Filter applied to blocked-issues + drifting (and maybe bottleneck.assigneeBreakdown if we render it later).
- Navigation: clicking a member name → React Router `navigate('/member-health-trends?teamId=xxx&memberName=xxx')`. No deep-link contract file yet — create `/member-health-trends.url-contract.ts` if 4.6 pattern repeats.
- Digest: `POST /analytics/cycles/:cycleId/member-digest` with `{ teamId, memberName, provider }`. Same pattern as AI report generation but smaller scope.

## Known open items (non-blocking)

- **Backend 500 on drifting for Produit team** (#10) — does not block 4.6 (other teams work). Flag to user when testing.
- **Design is unstyled** (#9) — purely CSS work, doesn't affect code correctness.
- **AI report `generatedAtLabel` raw ISO** (#11) — cosmetic, format via `Intl.DateTimeFormat` in presenter.
- **AI report cycle-name matching brittle** (#12) — duplicate cycle names would mismatch. Same flaw as legacy. Expose `cycleId` in `ReportHistoryItemDto` to fix.
- **Spec wording on scope creep** says "30%" but legacy and code both use count > 30 issues. Update spec wording in step #7.
- **Spec wording on blocked issues** says query params `?cycleId&teamId` that don't exist — update spec in step #7 to reflect client-side teamId filter.

## How to pick up cleanly after compact/reset

1. Open `docs/plans/migrate-cycle-report-page-handoff.plan.md` (this file).
2. `git log --oneline master..HEAD` to confirm branch state.
3. `cd frontend && pnpm test` and backend `pnpm test` to confirm baseline (284 / 947).
4. Start next sub-slice (recommend 4.5) by invoking `/implement-feature-frontend` with the spec path and the "4.5 only" scope directive. Paste the mandatory rules summary from this file into the orchestrator prompt if needed.
5. Always mirror an existing clean subfolder (`views/cycle-metrics/` is the simplest canonical example) rather than inventing a new structure.

## Quality gates reminders

- `cd /home/damien/Documents/Projets/shiplens && npx tsc --noEmit -p frontend/tsconfig.json`
- `cd /home/damien/Documents/Projets/shiplens/frontend && pnpm lint:ci` (run `npx @biomejs/biome check --write src/ tests/` first if it fails on formatting)
- `cd /home/damien/Documents/Projets/shiplens/frontend && pnpm test`
- `cd /home/damien/Documents/Projets/shiplens/backend && pnpm test` (only if backend touched)

The pre-commit hook (`lefthook`) also runs biome + pnpm typecheck; it blocks the commit on any gate failure.
