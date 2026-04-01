# Afficher les résultats d'audit dans le sprint report

## Status: implemented

## Contexte
Le tech lead veut voir d'un coup d'oeil quelles pratiques de son équipe sont respectées et lesquelles dérivent. Sans cette visibilité intégrée au rapport de cycle, les règles d'audit seraient définies mais personne n'en verrait les résultats au bon moment.

## Rules
- Le rapport de cycle contient une section dédiée "Audit des pratiques"
- Chaque règle évaluée affiche son statut (pass, warn, fail), la valeur mesurée et le seuil attendu
- Le score global d'adhérence est le pourcentage de règles ayant le statut pass
- La tendance compare le score d'adhérence sur les 3 derniers cycles terminés
- La tendance nécessite au moins 3 cycles terminés pour être affichée
- L'IA formule une recommandation pour chaque règle en échec
- Les éléments de checklist issus de pratiques qualitatives sont listés séparément, sans statut automatique
- La section d'audit n'apparaît que si au moins une règle est définie

## Scenarios
- rapport nominal: {cycle terminé, 10 règles évaluées dont 8 pass, 1 warn, 1 fail} → section "Audit des pratiques" + score d'adhérence "80%" + détail par règle avec statut, valeur et seuil
- recommandation sur échec: {règle "cycle time > 5 jours" en fail, cycle time mesuré de 8 jours} → recommandation IA expliquant les causes probables et pistes d'amélioration
- tendance affichée: {cycle terminé, 3 cycles précédents avec scores 60%, 70%, 75%} → tendance affichée "60% → 70% → 75% → 80%"
- tendance insuffisante: {cycle terminé, moins de 3 cycles précédents} → tendance masquée + mention "Pas assez d'historique pour afficher la tendance."
- checklist qualitative: {2 pratiques qualitatives importées de Packmind} → 2 éléments de checklist affichés sans statut automatique
- aucune règle définie: {cycle terminé, aucune règle d'audit configurée} → section "Audit des pratiques" absente du rapport
- toutes les règles passent: {cycle terminé, 5 règles évaluées toutes en pass} → score d'adhérence "100%" + aucune recommandation
- toutes les règles échouent: {cycle terminé, 5 règles évaluées toutes en fail} → score d'adhérence "0%" + recommandation IA pour chaque règle

## Hors scope
- Modification des règles depuis le rapport
- Notifications ou alertes en cas d'échec
- Export de la section d'audit séparément du rapport
- Comparaison de l'adhérence entre équipes

## Glossaire
| Terme | Définition |
|-------|------------|
| Section d'audit | Partie du rapport de cycle dédiée aux résultats d'évaluation des règles d'audit |
| Score d'adhérence | Pourcentage de règles ayant le statut pass sur le total des règles évaluées |
| Tendance | Évolution du score d'adhérence sur les 3 derniers cycles terminés |
| Recommandation | Analyse générée par l'IA pour expliquer un échec et proposer des pistes d'amélioration |
| Checklist | Liste de pratiques qualitatives à vérifier manuellement, affichées sans statut automatique |

## Implementation

### Bounded Context
Analytics (primary), Audit (dependency)

### Artefacts
- **Entity** : SprintReport étendu avec `auditSection` nullable (Zod schema)
- **Use Case** : GenerateSprintReportUsecase étendu (évaluation des règles, score d'adhérence, tendance, recommandations IA)
- **Presenters** : SprintReportPresenter (DTO), ReportDetailPresenter (markdown avec section audit)
- **Gateway** : SprintReportInPrismaGateway (sérialisation JSON auditSection)
- **Migration** : `add-audit-section-to-sprint-report` (colonne `auditSection String?`)

### Endpoints
| Méthode | Route | Use Case |
|---------|-------|----------|
| POST | /analytics/cycles/:cycleId/report | GenerateSprintReportUsecase (étendu) |

### Décisions architecturales
- Pas de nouvelle entité : auditSection est un champ nullable JSON dans SprintReport (projection, pas d'identité propre)
- Extension du usecase existant plutôt qu'un nouveau usecase (l'audit fait partie du rapport)
- Un seul appel IA pour toutes les recommandations (performance)
- Tendance calculée depuis les rapports précédents via findByTeamId (YAGNI)
- AnalyticsModule importe AuditModule pour accéder aux gateways d'audit
