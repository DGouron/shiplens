# Set workspace language

## Status: implemented (slice 1/3)

Slice 1 of the i18n feature. Slice 2: translate remaining pages. Slice 3: unify SprintReport language.

## Context

Shiplens serves teams across multiple language backgrounds (francophone, anglophone, mixed). All UI text is currently hardcoded without translation support. Users need a workspace-wide language preference so the entire interface displays in a consistent language. This first slice delivers the i18n infrastructure and proves it on the Settings page.

## Rules

- The workspace has a single language preference shared across all pages and all teams
- Supported languages: English (EN) and French (FR)
- Default language when no preference is stored: English
- Changing the language persists the preference server-side and takes effect immediately
- The language selector is a dedicated section on the Settings page, visible without selecting a team
- The Settings page adapts all visible text to the selected language: navigation, section titles, descriptions, form labels, placeholders, toasts, loading states
- The HTML lang attribute reflects the selected language ("en" or "fr")
- Drift grid labels adapt to the selected language

## Scenarios

- default language: {no stored preference} → settings page in English + lang="en"
- switch to french: {select "Francais"} → settings page in French + lang="fr" + preference saved
- switch back to english: {select "English"} → settings page in English + lang="en" + preference saved
- persistence: {preference: FR, reload page} → page in French
- section titles in english: {language: EN} → "Timezone", "Blocked issues — Excluded statuses", "Drift grid — Points to duration mapping"
- section titles in french: {language: FR} → "Fuseau horaire", "Issues bloquees — Statuts exclus", "Grille de derive — Correspondance points / duree"
- team selector empty in english: {language: EN, no team selected} → "Select a team..."
- team selector empty in french: {language: FR, no team selected} → "Selectionnez une equipe..."
- team selector loading in english: {language: EN, teams loading} → "Loading teams..."
- team selector loading in french: {language: FR, teams loading} → "Chargement des equipes..."
- toast timezone saved in english: {language: EN, save timezone} → toast "Timezone saved"
- toast timezone saved in french: {language: FR, save timezone} → toast "Fuseau horaire sauvegarde"
- toast status saved in english: {language: EN, toggle excluded status} → toast "Settings saved"
- toast status saved in french: {language: FR, toggle excluded status} → toast "Parametres sauvegardes"
- drift grid in english: {language: EN} → rows "8h (1 day)", "20h (2-3 days)" + note "Tickets estimated at 8 points or more are flagged 'Needs splitting' as soon as they move to in progress."
- drift grid in french: {language: FR} → rows "8h (1 jour)", "20h (2-3 jours)" + note "Les tickets estimes a 8 points ou plus sont signales 'A redecouper' des qu'ils passent en cours."
- excluded status labels in english: {language: EN, status included} → "Analyzed" | {status excluded} → "Excluded"
- excluded status labels in french: {language: FR, status included} → "Analyse" | {status excluded} → "Exclu"
- empty statuses in english: {language: EN, no statuses synced} → "No synced statuses for this team."
- empty statuses in french: {language: FR, no statuses synced} → "Aucun statut synchronise pour cette equipe."
- theme toggle tooltip in english: {language: EN} → title "Toggle theme"
- theme toggle tooltip in french: {language: FR} → title "Changer de theme"
- page title in english: {language: EN} → "Settings"
- .todo page title in french: {language: FR} → "Parametres"

## Implementation Progress

- [x] Slice 1: i18n infrastructure + language selector + settings page ([set-workspace-language](set-workspace-language.md))
- [ ] Slice 2: translate remaining pages ([translate-remaining-pages](translate-remaining-pages.md))
- [ ] Slice 3: unify SprintReport language ([unify-sprint-report-language](unify-sprint-report-language.md))

## Out of scope

- Translating pages other than Settings (Slice 2)
- Translating backend error messages (BusinessRuleViolation, GatewayError stay in English)
- Per-user or per-team language preference
- Languages beyond EN and FR
- SprintReport language field unification (Slice 3)
- Locale-aware date/number formatting via Intl API (Slice 2)
- Right-to-left (RTL) layout support

## Implementation

- **Bounded Context**: Analytics
- **Schema**: `src/modules/analytics/entities/workspace-settings/workspace-language.schema.ts` — Zod enum `'en' | 'fr'`, type `Locale`
- **Gateway port**: `src/modules/analytics/entities/workspace-settings/workspace-settings.gateway.ts` — `getLanguage()`, `setLanguage()`
- **Gateway impl**: `src/modules/analytics/interface-adapters/gateways/workspace-settings.in-file.gateway.ts` — file-based (`data/workspace-settings.json`)
- **Use cases**: `get-workspace-language.usecase.ts`, `set-workspace-language.usecase.ts`
- **Controller**: `src/modules/analytics/interface-adapters/controllers/workspace-language.controller.ts` — `GET /settings/language`, `PUT /settings/language`
- **Translations**: `src/modules/analytics/interface-adapters/presenters/settings-page.translations.ts` — `Record<Locale, SettingsPageTranslationKeys>`
- **HTML**: `settings-page.html.ts` transformed from static `const` to `buildSettingsPageHtml(locale)` function
- **Error**: `workspace-settings.errors.ts` — `UnsupportedLocaleError extends BusinessRuleViolation`

### Architectural decisions
- No entity class for workspace language (Zod schema sufficient for a typed string)
- No Prisma migration (file-based storage like team-settings)
- Translation dictionary is presentation data (not an entity)
- Client-side JS receives translations via injected JSON object

## Glossary

| Term | Definition |
|------|------------|
| Workspace language | Single language preference applied workspace-wide to all UI pages |
| Translation dictionary | Structured collection of translated UI strings keyed by locale code |
| Locale | Language identifier (EN or FR) used to resolve the correct translation |
