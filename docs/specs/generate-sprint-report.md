# Générer un rapport de sprint par IA

## Status: implemented

## Contexte
Le tech lead passe plus de 30 minutes à rédiger manuellement un bilan de sprint pour ses stakeholders. Shiplens génère automatiquement un rapport structuré et rédigé par IA à partir des métriques du sprint, des issues et des résultats d'audit, dans un ton professionnel accessible aux non-techniques.

## Rules
- Le rapport contient obligatoirement : un résumé exécutif, une analyse des tendances, les faits saillants, les risques et warnings, et des recommandations actionnables
- Le résumé exécutif fait entre 3 et 5 phrases sur la santé globale du sprint
- L'analyse des tendances compare la vélocité du sprint à l'historique des sprints précédents
- Les recommandations sont concrètes et actionnables, pas des généralités vagues
- Le rapport est rédigé dans la langue choisie par l'utilisateur (français ou anglais au minimum)
- Le rapport ne dépasse pas une longueur raisonnable pour rester lisible d'un coup d'oeil
- L'utilisateur choisit le fournisseur d'IA utilisé pour la génération
- Le rapport ne peut être généré que sur un sprint dont les données sont synchronisées

## Scenarios
- génération nominale: {sprint synchronisé, 45 issues, langue "FR", fournisseur "OpenAI"} → rapport généré en français + résumé exécutif + tendances + faits saillants + risques + recommandations
- génération en anglais: {sprint synchronisé, 30 issues, langue "EN", fournisseur "Anthropic"} → rapport généré en anglais
- génération avec fournisseur self-hosted: {sprint synchronisé, langue "FR", fournisseur "Ollama"} → rapport généré via le fournisseur local
- sprint sans données: {sprint non synchronisé} → reject "Les données de ce sprint ne sont pas encore synchronisées. Veuillez lancer la synchronisation d'abord."
- sprint vide: {sprint synchronisé, 0 issue} → reject "Ce sprint ne contient aucune issue. Impossible de générer un rapport."
- fournisseur indisponible: {sprint synchronisé, fournisseur inaccessible} → reject "Le fournisseur d'IA sélectionné est indisponible. Veuillez réessayer ou choisir un autre fournisseur."
- tendances sans historique: {sprint synchronisé, aucun sprint précédent} → rapport généré sans section tendances + mention "Pas d'historique disponible pour comparer la vélocité"
- langue non supportée: {sprint synchronisé, langue "JP"} → reject "Cette langue n'est pas encore supportée. Langues disponibles : français, anglais."

## Hors scope
- Modification manuelle du rapport après génération
- Envoi automatique du rapport (couvert par l'export)
- Personnalisation du prompt IA par l'utilisateur
- Comparaison côte à côte de plusieurs rapports
- Génération de rapports sur autre chose qu'un sprint (projet, milestone)

## Glossaire
| Terme | Définition |
|-------|------------|
| Rapport de sprint | Document structuré résumant l'activité, la santé et les tendances d'un sprint |
| Résumé exécutif | Paragraphe court donnant une vue d'ensemble de la santé du sprint |
| Tendances | Comparaison de la vélocité actuelle avec les sprints précédents |
| Faits saillants | Issues notables, achievements ou événements marquants du sprint |
| Recommandations | Suggestions concrètes d'amélioration pour les prochains sprints |
| Fournisseur d'IA | Service externe utilisé pour la génération du texte (OpenAI, Anthropic, Ollama) |
| Vélocité | Volume de travail accompli par l'équipe pendant un sprint |

## Implementation

### Bounded Context
Analytics (`src/modules/analytics/`)

### Artefacts
| Type | Fichier |
|------|---------|
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
| Methode | Route | Use Case |
|---------|-------|----------|
| POST | `/analytics/cycles/:cycleId/report` | GenerateSprintReportUsecase |

### Decisions architecturales
- Rapport non persiste (genere a la demande) — pas de migration Prisma
- Un seul AiTextGeneratorGateway qui dispatche vers OpenAI/Anthropic/Ollama via parametre runtime
- SprintReportDataGateway separe de CycleMetricsDataGateway (donnees differentes : sync status + issues brutes)
- Prompt construit dans le use case (orchestration domaine)
- Langues supportees en liste simple (FR, EN) dans le use case
