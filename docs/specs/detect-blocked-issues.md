# Détecter les issues bloquées

## Status: implemented

## Contexte
Le tech lead a besoin de savoir quand une issue stagne trop longtemps dans un statut. Sans cette détection, les blocages passent inaperçus jusqu'au standup — voire jusqu'à la fin du cycle.

## Rules
- Chaque statut a un seuil de temps maximum au-delà duquel une issue est considérée bloquée
- Des seuils par défaut sont fournis prêts à l'emploi, l'utilisateur peut les personnaliser par statut
- Le dépassement du seuil produit un warning ; le dépassement du double du seuil produit un critical
- La détection s'exécute automatiquement toutes les heures
- Chaque alerte générée est conservée dans un historique horodaté
- Une issue qui revient sous le seuil après avoir été signalée reste dans l'historique mais n'apparaît plus comme bloquée
- Le lien direct vers l'issue dans Linear est toujours accessible depuis une alerte

## Scenarios
- issue bloquée en warning: {issue en "In Review" depuis 50h, seuil "In Review" = 48h} → sévérité "warning" + durée "50h" + lien vers l'issue Linear
- issue bloquée en critical: {issue en "In Review" depuis 100h, seuil "In Review" = 48h} → sévérité "critical" + durée "100h"
- issue dans les temps: {issue en "In Review" depuis 24h, seuil "In Review" = 48h} → aucune alerte
- plusieurs issues bloquées classées par sévérité: {3 issues bloquées : 1 critical, 2 warnings} → liste triée critical d'abord, puis warning
- seuils personnalisés: {utilisateur définit seuil "In Progress" = 72h, issue en "In Progress" depuis 80h} → sévérité "warning" + durée "80h"
- seuils par défaut: {aucun seuil personnalisé, issue en "In Review" depuis 50h} → détection avec le seuil par défaut du statut "In Review"
- issue redevenue dans les temps: {issue précédemment signalée, maintenant passée au statut suivant} → alerte retirée de la liste active + alerte conservée dans l'historique
- historique des alertes: {5 alertes générées sur les 7 derniers jours} → historique horodaté consultable avec sévérité, durée et issue concernée
- aucune équipe synchronisée: {aucune donnée Linear importée} → reject "Veuillez d'abord synchroniser vos données Linear."
- seuil invalide: {utilisateur saisit un seuil négatif} → reject "Le seuil doit être une durée positive."

## Hors scope
- Notifications push ou email (alerte consultable dans Shiplens uniquement)
- Détection basée sur d'autres critères que la durée dans un statut (ex: nombre de commentaires, taille de la PR)
- Suggestion automatique de résolution du blocage
- Configuration de seuils par équipe ou par projet (seuils globaux par statut uniquement)

## Glossaire
| Terme | Définition |
|-------|------------|
| Issue bloquée | Issue restée dans un même statut au-delà du seuil configuré |
| Seuil | Durée maximale acceptable pour une issue dans un statut donné |
| Sévérité | Niveau de gravité de l'alerte : warning (seuil dépassé) ou critical (double du seuil dépassé) |
| Alerte | Signalement qu'une issue a dépassé le seuil dans son statut actuel |
| Historique des alertes | Table de toutes les alertes générées, conservées même après résolution |
| Statut | Étape du workflow d'une issue dans Linear (ex: Backlog, In Progress, In Review, Done) |

## Implementation

### Bounded Context
Analytics (existant)

### Artefacts
- **Entities** : `StatusThreshold`, `BlockedIssueAlert`
- **Use Cases** : `DetectBlockedIssuesUsecase`, `GetBlockedIssuesUsecase`, `GetAlertHistoryUsecase`, `SetStatusThresholdUsecase`
- **Controller** : `BlockedIssuesController`
- **Scheduler** : `BlockedIssueDetectionScheduler` (cron horaire via `@nestjs/schedule`)
- **Presenters** : `BlockedIssuesPresenter`, `AlertHistoryPresenter`
- **Gateways** : `StatusThresholdInPrismaGateway`, `BlockedIssueAlertInPrismaGateway`, `BlockedIssueDetectionDataInPrismaGateway`
- **Migration** : `add-blocked-issue-detection` (tables `StatusThreshold`, `BlockedIssueAlert`)

### Endpoints
| Méthode | Route | Use Case |
|---------|-------|----------|
| GET | `/analytics/blocked-issues` | `GetBlockedIssuesUsecase` |
| GET | `/analytics/blocked-issues/history` | `GetAlertHistoryUsecase` |
| POST | `/analytics/blocked-issues/thresholds` | `SetStatusThresholdUsecase` |
| POST | `/analytics/blocked-issues/detect` | `DetectBlockedIssuesUsecase` |

### Décisions architecturales
- Seuils par défaut hardcodés dans l'entité `StatusThreshold` (In Progress: 48h, In Review: 48h, Todo: 72h)
- URL Linear construite via UUID : `https://linear.app/issue/{uuid}`
- `@nestjs/schedule` ajouté pour le cron horaire
- Alertes résolues conservées avec `active: false` et `resolvedAt`
