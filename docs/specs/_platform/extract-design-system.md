# Extract design system

## Status: implemented (slice 2/6)

## Implementation

**Scope**: Centralize all shared CSS and UI primitives as reusable React components inside `frontend/src/`. The 4 legacy HTML templates remain untouched — this slice builds the foundation for slices 3-6 to consume.

**Artifacts**:

CSS modules (`frontend/src/styles/`):
- `tokens.css` — shared vars + `[data-theme="dark"]` and `[data-theme="light"]` definitions
- `global.css` — body reset, DM Sans, body::before gradients per theme, `.app` + `.container` + `.page-title`
- `animations.css` — `fadeSlideIn` and `pulse` keyframes
- `app-navbar.css` — nav layout, brand, separators, breadcrumbs
- `theme-toggle.css` — toggle pill with animated knob + sun/moon icons
- `glass-card.css` — `.glass` frosted container
- `button.css` — `.btn` default and `.btn-accent` variants
- `skeleton.css` — pulsing placeholders for loading states

React components (`frontend/src/components/`):
- `app-layout.tsx` — imports tokens/global/animations CSS, renders `AppNavbar` + `Outlet`
- `app-navbar.tsx` — brand link, breadcrumbs, optional Settings link, theme toggle
- `breadcrumb.tsx` — renders breadcrumb items with `/` separators, active state
- `theme-toggle.tsx` — `useState` + `useEffect` wiring to `data-theme` attribute + localStorage
- `glass-card.tsx` — glassmorphism wrapper with optional className
- `button.tsx` — default/accent variants with proper button props
- `skeleton-card.tsx` — configurable number of pulsing lines

Updates:
- `frontend/src/app.tsx` — re-exports `AppLayout` as `App`
- `frontend/src/main.tsx` — router uses `App` which is now the `AppLayout`
- `frontend/tests/app.test.tsx` — updated to assert navbar brand link instead of paragraph text

**Tests**: 31 tests across 9 files (`tests/components/*.test.tsx` + updated `app.test.tsx`)

**Architectural decisions**:
- Plain CSS files imported from TSX components (no CSS-in-JS, no Tailwind) — matches the rules in the spec and the legacy stack.
- Theme toggle reads localStorage in the initial state via lazy `useState` initializer — avoids a double-render flash.
- `AppLayout` is the single source of truth for CSS imports (tokens/global/animations) — child pages do not re-import these.
- React Router v7 `Link` used for the brand link; the `Settings` link is also a React Router `Link`.
- `ShiplensShell` is now a placeholder `<p>Shiplens</p>` — slices 3-6 will replace it with real pages.
- FOUC note: theme is applied after React mount via `useEffect`, so a first-paint flash is possible on slow networks. Acceptable for this slice — can be fixed with an inline script in `index.html` if needed later.

**Out of scope (deferred to later slices)**: page-specific components (team cards, metric values, charts), responsive refinements, Storybook.


## Context

The 4 HTML template files duplicate approximately 200 lines of identical CSS: design tokens (CSS custom properties), dark/light theme definitions, glassmorphism effects, navigation bar styles, button variants, typography, layout utilities, skeleton loaders, and animations. This duplication makes visual changes error-prone and inconsistent. Extracting these into a centralized design system provides the foundation for all React page migrations.

## Rules

- CSS custom properties (design tokens) are defined in a single `tokens.css` file imported at the app root
- Dark and light theme definitions are part of `tokens.css`, toggled via `[data-theme]` attribute on `<html>`
- The theme toggle persists the user preference in `localStorage` under the key `shiplens-theme` (matching current behavior)
- The default theme is `dark` (matching current behavior)
- Shared CSS for body background gradients, reset, and base typography lives in `global.css`
- The navigation bar is a React component (`AppNavbar`) that renders the brand link, breadcrumbs, settings link, and theme toggle
- Breadcrumbs are passed as props to `AppNavbar` — each page defines its own breadcrumb trail
- The theme toggle is a React component (`ThemeToggle`) used inside `AppNavbar`
- Glass card, button variants (`.btn`, `.btn-accent`), and skeleton loaders are React components
- The `AppLayout` component wraps every page: renders `AppNavbar` at the top and `<Outlet />` for route content
- All components support the existing i18n pattern: translation keys are passed as props or consumed from a React context
- Font loading (DM Sans, JetBrains Mono from Google Fonts) is declared once in `index.html`
- Every React component has at least one Vitest + Testing Library test proving its render behavior
- Visual output matches the current HTML pages pixel-for-pixel (same tokens, same spacing, same effects)

## Scenarios

- dark theme by default: {no localStorage value, app loads} -> `data-theme="dark"` on `<html>` + dark colors applied
- persisted light theme: {localStorage `shiplens-theme` = "light", app loads} -> `data-theme="light"` on `<html>` + light colors applied
- toggle theme: {current theme is dark, user clicks theme toggle} -> theme switches to light + localStorage updated to "light"
- navbar renders brand: {any page} -> "Shiplens" brand link visible, links to `/dashboard`
- navbar renders breadcrumbs: {dashboard page} -> breadcrumb trail shows "Dashboard" as active
- navbar renders settings link: {any page} -> "Settings" link visible in nav-right area
- glass card renders: {component receives children} -> children wrapped in glassmorphism container with border, blur, shadow
- button default renders: {component receives label "Resynchronize"} -> button with glass background, border, hover effect
- button accent renders: {component receives label "Generate report", variant "accent"} -> button with gradient background, white text
- skeleton card renders: {loading state} -> animated skeleton placeholder with pulsing lines
- layout wraps page: {browser navigates to any route} -> navbar at top + page content below

## Out of scope

- Page-specific components (team cards, KPI rows, charts) — those belong in Slices 3-6
- i18n infrastructure changes (the existing `GET /settings/language` endpoint and translation dictionaries are reused)
- Responsive/mobile layout improvements beyond matching current behavior
- Component documentation or Storybook
- CSS-in-JS or Tailwind — plain CSS with custom properties (matching current approach)

## Glossary

| Term | Definition |
|------|------------|
| Design token | A CSS custom property (e.g. `--accent-1`, `--bg-surface`) that encodes a design decision reusable across components |
| Glassmorphism | Visual effect combining a semi-transparent background, backdrop blur, and subtle border to create a frosted glass appearance |
| AppLayout | The root layout component that wraps all routes with shared navigation and structure |
