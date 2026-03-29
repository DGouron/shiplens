# Identifier les goulots d'étranglement par statut

## Contexte
Le tech lead veut comprendre quelles étapes du workflow ralentissent systématiquement la livraison. Sans cette visibilité, les améliorations de processus se font à l'aveugle — on optimise là où ça ne coince pas.

## Rules
- Le temps passé dans chaque statut est calculé à partir des transitions d'état des issues
- La distribution du temps couvre l'intégralité du workflow : Backlog, Todo, In Progress, In Review, Done
- Le statut goulot est celui avec le temps médian le plus élevé sur la période analysée
- La comparaison entre cycles permet de mesurer l'évolution d'un statut dans le temps
- Le breakdown par assignee montre la répartition individuelle du temps par statut
- Seules les issues terminées (Done) sont prises en compte dans le calcul

## Scenarios
- distribution nominale: {10 issues terminées sur le cycle en cours} → temps médian par statut (Backlog, Todo, In Progress, In Review, Done) + statut goulot identifié
- identification du goulot: {médiane In Review = 36h, médiane In Progress = 12h, médiane Todo = 4h} → goulot "In Review"
- comparaison entre cycles: {cycle 1 : médiane In Review = 48h, cycle 2 : médiane In Review = 30h} → évolution "-37%" pour In Review
- breakdown par assignee: {3 développeurs sur le cycle} → temps médian par statut pour chaque assignee
- assignee souvent bloqué en review: {Alice : médiane In Review = 60h, Bob : médiane In Review = 20h} → Alice identifiée avec le temps en review le plus élevé
- aucune issue terminée: {cycle en cours, 0 issue en Done} → reject "Aucune issue terminée sur cette période. L'analyse nécessite au moins une issue complétée."
- cycle unique sans comparaison: {un seul cycle disponible} → distribution affichée sans comparaison + mention "Pas assez de cycles pour comparer l'évolution."
- aucune donnée synchronisée: {aucune donnée Linear importée} → reject "Veuillez d'abord synchroniser vos données Linear."

## Hors scope
- Analyse des issues non terminées (en cours ou abandonnées)
- Recommandations automatiques d'amélioration du workflow
- Analyse par label, projet ou priorité (uniquement par statut et assignee)
- Personnalisation des statuts du workflow (utilise le workflow tel que défini dans Linear)
- Export des données d'analyse

## Glossaire
| Terme | Définition |
|-------|------------|
| Goulot d'étranglement | Statut du workflow où les issues passent le plus de temps en médiane |
| Distribution du temps | Répartition du temps passé par les issues dans chaque statut |
| Temps médian | Valeur centrale du temps passé dans un statut — plus robuste que la moyenne face aux valeurs extrêmes |
| Cycle | Période de travail itérative (sprint) dans Linear |
| Transition d'état | Changement de statut d'une issue, horodaté, servant de base au calcul du temps par statut |
| Assignee | Personne assignée à une issue dans Linear |
| Breakdown | Ventilation détaillée d'une métrique selon un axe (ici : par assignee) |
| Statut | Étape du workflow d'une issue dans Linear (Backlog, Todo, In Progress, In Review, Done) |
