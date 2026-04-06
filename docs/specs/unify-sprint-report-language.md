# Unify sprint report language with workspace preference

## Status: ready (slice 3/3)

Slice 3 of the i18n feature. Depends on Slice 1 (set-workspace-language) for workspace language infrastructure.

## Context

Sprint reports currently carry their own language field, hardcoded to "FR" in the cycle report page. This creates an inconsistency: the workspace may be set to English but reports are always generated in French. The report language should derive from the workspace preference so the experience is unified.

## Rules

- Report generation uses the workspace language instead of a client-provided language parameter
- The language parameter is removed from the report generation API request body
- The report entity retains a language field as a historical record of the generation language
- Existing reports keep their original language — no retroactive change
- The workspace language is injected into the AI prompt as a language instruction so the generated content matches the workspace preference
- AI-generated report content (summary, trends, highlights, risks, recommendations) is produced in the workspace language
- Section labels in the report display (Summary, Trends, etc.) follow the workspace language, not the report's stored language
- The NO_TREND_MESSAGE fallback follows the workspace language
- The report detail presenter uses workspace language for section labels and formatting
- Audit section labels in report export adapt to the workspace language

## Scenarios

- generate report in english workspace: {workspace language: EN, generate report} → report.language = "EN" + AI content in English
- generate report in french workspace: {workspace language: FR, generate report} → report.language = "FR" + AI content in French
- no language in request body: {generate report, body without language field} → uses workspace language
- existing french report in english workspace: {workspace: EN, display report generated in FR} → section labels in English + report content in French (as generated)
- existing english report in french workspace: {workspace: FR, display report generated in EN} → section labels in French + report content in English (as generated)
- no trend message in english workspace: {workspace: EN, report has no trends} → "No historical data available to compare velocity"
- no trend message in french workspace: {workspace: FR, report has no trends} → "Pas d'historique disponible pour comparer la velocite"
- export report labels in english: {workspace: EN, export report} → markdown headers "Summary", "Trends", "Highlights", "Risks", "Recommendations"
- export report labels in french: {workspace: FR, export report} → markdown headers "Resume", "Tendances", "Points forts", "Risques", "Recommandations"
- audit section in english: {workspace: EN, report with audit} → "Practice audit", "Adherence score", "Trend"
- audit section in french: {workspace: FR, report with audit} → "Audit des pratiques", "Score d'adherence", "Tendance"

## Out of scope

- Dropping the language column from the Prisma schema (the field stays as historical record)
- Translating UI text on the cycle report page (already done in Slice 2)
- Retroactive re-generation of existing reports in the new workspace language
- Per-report language override (always uses workspace language)

## Glossary

| Term | Definition |
|------|------------|
| Generation language | The language in which the AI produced the report content — stored as a historical record on the report entity |
| Display language | The workspace language used for UI labels around the report (section headers, fallback messages) — may differ from the generation language on older reports |
