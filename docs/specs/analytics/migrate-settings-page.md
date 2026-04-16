# Migrate settings page

## Status: implemented (frontend only — backend cleanup pending)

Slice 6 of the frontend migration. Depends on Slices 1-5. This is the final slice: after it, all HTML-serving controllers are removed.

## Implementation

### Bounded Context
Analytics

### Artifacts
- **Gateways**: WorkspaceLanguageGateway (GET/PUT language), TeamSettingsGateway (timezone, available/excluded statuses), DriftGridGateway (grid entries)
- **Use cases**: GetWorkspaceLanguage, SetWorkspaceLanguage, GetTeamTimezone, SetTeamTimezone, GetTeamStatusSettings, SetTeamExcludedStatuses, GetDriftGridEntries
- **Presenter**: SettingsPresenter (transforms raw data → SettingsViewModel with semantic booleans)
- **Translations**: settings.translations.ts (ported from backend settings-page.translations.ts)
- **Hook**: useSettings (orchestrates 7 use cases, 3 mutations, team selection state, toast auto-dismiss)
- **Views**: 9 humble views in views/settings/ (route-level + ready + 5 sections + toggle + toast)
- **Route**: /settings in main.tsx

### Architectural Decisions
- LocaleContext enhanced with setLocale for immediate app-wide language switch
- 3 separate gateways (SRP) instead of one composite gateway
- Reused existing ListAvailableTeamsUsecase for team selector
- Drift grid durations use locale-keyed label maps instead of fragile string comparison

## Context

The settings page allows the tech lead to configure workspace-wide preferences: language (EN/FR), timezone per team, blocked issue exclusion statuses per team, and the drift grid mapping. It also houses the language selector that drives the i18n system. The current implementation is an inline HTML template (`settings-page.html.ts`) with form controls, team selectors, toggle switches, and toast notifications. This is the last page to migrate. Once migrated, all 4 HTML template files and their HTML-serving controller methods are deleted, completing the backend's transition to a pure JSON API.

## Rules

- The settings page is a React route at `/settings`
- Data fetching uses a `useSettingsViewModel` hook that orchestrates multiple endpoints
- The language section is always visible (no team selection needed): displays a language selector with EN and FR options
- Changing the language calls `PUT /settings/language` and updates the entire app's locale immediately
- The team selector dropdown lists synced teams; selecting a team loads team-specific settings
- The timezone section displays a timezone selector for the selected team
- Saving a timezone calls `PUT /settings/teams/:teamId/timezone` and shows a success toast
- The excluded statuses section lists all available statuses for the selected team (via `GET /settings/teams/:teamId/available-statuses`)
- Each status has a toggle (analyzed/excluded); toggling calls `PUT /settings/teams/:teamId/excluded-statuses`
- The drift grid section displays the points-to-duration mapping table (read from `GET /analytics/drifting-issues/drift-grid/entries`)
- The drift grid includes the "8 points needs splitting" note
- Toast notifications confirm successful saves (matching current toast behavior)
- Loading states display appropriate placeholders per section
- All user-facing text comes from the translation system (matching `SettingsPageTranslationKeys`)
- Breadcrumbs show: Shiplens / Settings (active)

### Backend cleanup (final step of Slice 6)

- Remove `GET /dashboard` from `WorkspaceDashboardController` (keep `GET /dashboard/data`)
- Remove `GET /cycle-report` from `CycleReportPageController` (keep JSON endpoints)
- Remove `GET /member-health-trends` from `MemberHealthTrendsPageController`
- Remove `GET /settings` from `SettingsPageController`
- Delete all 4 HTML template files: `workspace-dashboard.html.ts`, `cycle-report-page.html.ts`, `member-health-trends.html.ts`, `settings-page.html.ts`
- Delete the `favicon.ts` file (favicon moves to the React app's `index.html`)
- Delete the 4 translation files (`*.translations.ts`) — translations move to the React frontend
- Remove empty controllers that only served HTML (e.g., `SettingsPageController`, `MemberHealthTrendsPageController`)
- Keep controllers that serve both HTML and JSON (e.g., `WorkspaceDashboardController`, `CycleReportPageController`) but only their JSON endpoints
- Verify all existing JSON endpoints still function correctly after cleanup
- Verify `@nestjs/serve-static` correctly serves the React build and falls back to `index.html`

## Scenarios

### Settings page

- language selector: {current language EN, user selects FR} -> PUT sent + app switches to French immediately
- language persistence: {language set to FR, page reloaded} -> page renders in French
- team selector: {3 synced teams} -> dropdown with 3 options + "Select a team..." placeholder
- team selector loading: {teams being fetched} -> "Loading teams..." placeholder
- timezone change: {team selected, user changes timezone} -> PUT sent + toast "Timezone saved"
- excluded statuses: {team selected, 5 statuses available, 2 excluded} -> 5 toggles, 2 in "Excluded" state
- toggle status: {user clicks a status toggle} -> PUT sent + toggle updates + toast "Settings saved"
- no statuses: {team selected, no statuses synced} -> "No synced statuses for this team" message
- drift grid: {drift grid entries loaded} -> table with points-to-duration rows + splitting note
- loading state: {team settings loading} -> skeleton placeholders
- toast displays: {save succeeds} -> toast appears briefly then fades
- locale french: {workspace language is FR} -> all section titles, labels, toasts in French
- locale english: {workspace language is EN} -> all section titles, labels, toasts in English

### Backend cleanup

- html endpoints removed: {after cleanup, GET /dashboard requested} -> NestJS serves React `index.html` (SPA fallback)
- json endpoints preserved: {after cleanup, GET /dashboard/data requested} -> JSON response returned normally
- html templates deleted: {after cleanup} -> no `.html.ts` files remain in controllers directory
- translation files deleted: {after cleanup} -> no `.translations.ts` files remain in presenters directory
- empty controllers removed: {after cleanup} -> `SettingsPageController` and `MemberHealthTrendsPageController` deleted
- mixed controllers cleaned: {after cleanup} -> `WorkspaceDashboardController` and `CycleReportPageController` retain only JSON endpoints

## Out of scope

- Adding new settings not present in the current page
- Modifying settings-related use cases or gateways
- Changing API response shapes
- Team settings CRUD (create/delete teams from settings)
- Drift grid editing (currently read-only)

## Glossary

| Term | Definition |
|------|------------|
| Backend cleanup | The removal of HTML-serving controller methods, template files, and translation files once all pages are migrated to React |
| SPA fallback | After HTML endpoints are removed, NestJS serves `index.html` for any non-API route, letting React Router handle the path |
| Toast notification | A temporary message that appears briefly to confirm a successful action, then auto-dismisses |
