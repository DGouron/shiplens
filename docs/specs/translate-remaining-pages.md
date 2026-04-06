# Translate remaining pages

## Status: ready (slice 2/3)

Slice 2 of the i18n feature. Depends on Slice 1 (set-workspace-language) for i18n infrastructure.

## Context

Slice 1 delivered the i18n infrastructure and translated the Settings page. The three remaining pages (Dashboard, Cycle Report, Member Health Trends) still contain hardcoded text. Users expect the entire application to respect the workspace language preference, not just Settings.

## Rules

- All user-facing text on Dashboard, Cycle Report, and Member Health Trends adapts to the workspace language
- The shared navbar (brand, breadcrumbs, theme toggle, Settings link) is translated on every page
- Dates follow locale convention: EN "Apr 6, 2026" / FR "6 avr. 2026"
- Numbers follow locale convention: EN "1,234.56" / FR "1 234,56"
- Durations follow locale convention: EN "2.5 days" / FR "2,5 jours"
- Percentages follow locale convention: EN "85.3%" / FR "85,3 %"
- Metric tooltips and descriptions adapt to the workspace language
- Loading states, empty states, and error messages adapt to the workspace language
- The HTML lang attribute reflects the workspace language on every page

## Scenarios

### Dashboard

- dashboard title in english: {language: EN} → page title "Dashboard"
- dashboard title in french: {language: FR} → page title "Dashboard"
- sync status in english: {language: EN} → "Last sync: " + formatted date
- sync status in french: {language: FR} → "Derniere sync : " + formatted date
- never synced in english: {language: EN, no sync} → "Never synced"
- never synced in french: {language: FR, no sync} → "Jamais synchronise"
- resync button in english: {language: EN} → "Resynchronize"
- resync button in french: {language: FR} → "Resynchroniser"
- kpi labels in english: {language: EN} → "Completion", "Velocity", "Blocked issues"
- kpi labels in french: {language: FR} → "Completion", "Velocite", "Issues bloquees"
- report link in english: {language: EN, report exists} → "View report"
- report link in french: {language: FR, report exists} → "Voir le rapport"
- no report in english: {language: EN, no report} → "No report available"
- no report in french: {language: FR, no report} → "Aucun rapport disponible"
- sync in progress in english: {language: EN, syncing} → "Synchronization in progress..."
- sync in progress in french: {language: FR, syncing} → "Synchronisation en cours..."

### Cycle Report

- page title in english: {language: EN} → "Cycle Report"
- page title in french: {language: FR} → "Rapport de cycle"
- cycle selector loading in english: {language: EN} → "Loading cycles..."
- cycle selector loading in french: {language: FR} → "Chargement des cycles..."
- all team option in english: {language: EN} → "Whole team"
- all team option in french: {language: FR} → "Toute l'equipe"
- section titles in english: {language: EN} → "Metrics", "Bottlenecks", "Blocked issues", "Estimation accuracy", "AI Report"
- section titles in french: {language: FR} → "Metriques", "Goulots d'etranglement", "Issues bloquees", "Precision d'estimation", "Rapport IA"
- metric labels in english: {language: EN} → "Velocity", "Throughput", "Completion rate", "Scope creep", "Average cycle time", "Average lead time"
- metric labels in french: {language: FR} → "Velocite", "Throughput", "Taux de completion", "Scope creep", "Cycle time moyen", "Lead time moyen"
- bottleneck headers in english: {language: EN} → "Status", "Median time"
- bottleneck headers in french: {language: FR} → "Statut", "Temps median"
- estimation labels in english: {language: EN} → "Well estimated", "Over-estimated", "Under-estimated"
- estimation labels in french: {language: FR} → "Bien estimee", "Sur-estimee", "Sous-estimee"
- generate report in english: {language: EN} → "Generate report"
- generate report in french: {language: FR} → "Generer le rapport"
- export button in english: {language: EN} → "Export"
- copy button in english: {language: EN} → "Copy"
- copy button in french: {language: FR} → "Copier"
- report copied toast in english: {language: EN} → "Report copied!"
- report copied toast in french: {language: FR} → "Rapport copie !"
- report sections in english: {language: EN} → "Summary", "Trends", "Highlights", "Risks", "Recommendations"
- report sections in french: {language: FR} → "Resume", "Tendances", "Points forts", "Risques", "Recommandations"

### Member Health Trends

- page title in english: {language: EN} → "Health Trends"
- page title in french: {language: FR} → "Tendances de sante"
- back link in english: {language: EN} → "Back to cycle report"
- back link in french: {language: FR} → "Retour au rapport de cycle"
- cycles label in english: {language: EN} → "Completed sprints to analyze:"
- cycles label in french: {language: FR} → "Sprints termines a analyser :"
- signal labels in english: {language: EN} → "Estimation Score", "Underestimation Ratio", "Average Cycle Time", "Drifting Tickets", "Median Review Time"
- signal labels in french: {language: FR} → "Score d'estimation", "Ratio de sous-estimation", "Cycle time moyen", "Tickets en derive", "Temps median de review"
- indicators in english: {language: EN} → "Favorable trend", "First deviation or mixed", "Unfavorable for 2+ sprints", "Not enough data"
- indicators in french: {language: FR} → "Tendance favorable", "Premiere deviation ou mixte", "Defavorable depuis 2+ sprints", "Pas assez de donnees"
- no data in english: {language: EN} → "No data available for this member"
- no data in french: {language: FR} → "Aucune donnee disponible pour ce membre"

### Locale-aware formatting

- date in english: {language: EN, date: "2026-04-06"} → "Apr 6, 2026"
- date in french: {language: FR, date: "2026-04-06"} → "6 avr. 2026"
- number in english: {language: EN, value: 1234.5} → "1,234.5"
- number in french: {language: FR, value: 1234.5} → "1 234,5"
- duration in english: {language: EN, value: 2.5} → "2.5 days"
- duration in french: {language: FR, value: 2.5} → "2,5 jours"
- percentage in english: {language: EN, value: 85.3} → "85.3%"
- percentage in french: {language: FR, value: 85.3} → "85,3 %"

## Out of scope

- Settings page (already translated in Slice 1)
- Backend error messages (stay in English)
- SprintReport generation language (Slice 3)
- AI-generated report content language (Slice 3)
- Languages beyond EN and FR

## Glossary

| Term | Definition |
|------|------------|
| Locale-aware formatting | Rendering dates, numbers, durations, and percentages according to the locale convention (EN vs FR) |
