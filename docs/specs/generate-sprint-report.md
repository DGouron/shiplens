# Generate an AI-powered sprint report

## Status: implemented

## Context
The tech lead spends over 30 minutes manually writing a sprint summary for their stakeholders. Shiplens automatically generates a structured, AI-written report from sprint metrics, issues and audit results, in a professional tone accessible to non-technical readers.

## Rules
- The report must contain: an executive summary, a trends analysis, highlights, risks and warnings, and actionable recommendations
- The executive summary is between 3 and 5 sentences about the overall sprint health
- The trends analysis compares the sprint velocity to the history of previous sprints
- Recommendations are concrete and actionable, not vague generalities
- The report is written in the language chosen by the user (French or English at minimum)
- The report does not exceed a reasonable length to remain readable at a glance
- The user chooses the AI provider used for generation
- The report can only be generated for a sprint whose data is synchronized

## Scenarios
- nominal generation: {synchronized sprint, 45 issues, language "FR", provider "OpenAI"} -> report generated in French + executive summary + trends + highlights + risks + recommendations
- generation in English: {synchronized sprint, 30 issues, language "EN", provider "Anthropic"} -> report generated in English
- generation with self-hosted provider: {synchronized sprint, language "FR", provider "Ollama"} -> report generated via the local provider
- sprint without data: {non-synchronized sprint} -> reject "This sprint's data is not yet synchronized. Please run synchronization first."
- empty sprint: {synchronized sprint, 0 issues} -> reject "This sprint contains no issues. Cannot generate a report."
- provider unavailable: {synchronized sprint, unreachable provider} -> reject "The selected AI provider is unavailable. Please retry or choose another provider."
- trends without history: {synchronized sprint, no previous sprint} -> report generated without trends section + mention "No history available to compare velocity"
- unsupported language: {synchronized sprint, language "JP"} -> reject "This language is not yet supported. Available languages: French, English."

## Out of scope
- Manual modification of the report after generation
- Automatic sending of the report (covered by export)
- User customization of the AI prompt
- Side-by-side comparison of multiple reports
- Report generation for anything other than a sprint (project, milestone)

## Glossary
| Term | Definition |
|------|------------|
| Sprint report | Structured document summarizing the activity, health and trends of a sprint |
| Executive summary | Short paragraph giving an overview of the sprint health |
| Trends | Comparison of current velocity with previous sprints |
| Highlights | Notable issues, achievements or significant events of the sprint |
| Recommendations | Concrete improvement suggestions for upcoming sprints |
| AI provider | External service used for text generation (OpenAI, Anthropic, Ollama) |
| Velocity | Volume of work completed by the team during a sprint |

## Implementation

### Bounded Context
Analytics (`src/modules/analytics/`)

### Artifacts
| Type | File |
|------|------|
| Entity | `entities/sprint-report/sprint-report.ts` |
| Schema | `entities/sprint-report/sprint-report.schema.ts` |
| Guard | `entities/sprint-report/sprint-report.guard.ts` |
| Errors | `entities/sprint-report/sprint-report.errors.ts` |
| Gateway Port | `entities/sprint-report/sprint-report-data.gateway.ts` |
| Gateway Port | `entities/sprint-report/ai-text-generator.gateway.ts` |
| Use Case | `usecases/generate-sprint-report.usecase.ts` |
| Presenter | `interface-adapters/presenters/sprint-report.presenter.ts` |
| Controller | `interface-adapters/controllers/sprint-report.controller.ts` |
| Gateway Prisma | `interface-adapters/gateways/sprint-report-data.in-prisma.gateway.ts` |
| Gateway AI | `interface-adapters/gateways/ai-text-generator.with-provider.gateway.ts` |

### Endpoints
| Method | Route | Use Case |
|--------|-------|----------|
| POST | `/analytics/cycles/:cycleId/report` | GenerateSprintReportUsecase |

### Architectural decisions
- Report not persisted (generated on demand) — no Prisma migration
- A single AiTextGeneratorGateway that dispatches to OpenAI/Anthropic/Ollama via runtime parameter
- SprintReportDataGateway separate from CycleMetricsDataGateway (different data: sync status + raw issues)
- Prompt built in the use case (domain orchestration)
- Supported languages in a simple list (FR, EN) in the use case
