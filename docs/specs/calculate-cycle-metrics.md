# Calculer les métriques d'un cycle terminé

## Contexte
À la fin d'un cycle, le tech lead a besoin d'un bilan chiffré pour comprendre ce qui s'est réellement passé. Sans métriques fiables, les rétrospectives restent subjectives et les mêmes problèmes se répètent cycle après cycle.

## Rules
- Les métriques ne sont calculables que pour un cycle dont le statut est terminé
- La vélocité compare les points complétés aux points planifiés au démarrage du cycle
- Le cycle time se mesure entre le passage en cours de traitement et la complétion
- Le lead time se mesure entre la création de l'issue et sa complétion
- Le scope creep ne comptabilise que les issues ajoutées après la date de début du cycle
- Le taux de complétion se base sur le périmètre initial du cycle, pas sur le périmètre final
- La tendance nécessite au moins 3 cycles terminés pour être affichée

## Scenarios
- métriques nominales: {cycle terminé avec 8 issues complétées sur 10 planifiées, 21 points complétés sur 25 planifiés} → vélocité "21/25 points" + throughput "8 issues" + taux de complétion "80%"
- cycle time et lead time: {cycle terminé, issues avec historique de transitions complet} → cycle time moyen calculé + lead time moyen calculé
- scope creep détecté: {cycle terminé, 10 issues au démarrage, 13 issues à la fin} → scope creep "3 issues ajoutées"
- tendance avec historique suffisant: {cycle terminé, 3 cycles précédents disponibles} → comparaison avec les 3 derniers cycles affichée
- tendance sans historique suffisant: {cycle terminé, moins de 3 cycles précédents} → reject "Pas assez d'historique pour afficher la tendance. Minimum 3 cycles terminés requis."
- cycle non terminé: {cycle en cours} → reject "Les métriques ne sont disponibles que pour les cycles terminés."
- cycle sans issue: {cycle terminé, aucune issue} → reject "Ce cycle ne contient aucune issue. Impossible de calculer les métriques."
- issue sans transition de statut: {cycle terminé, issue jamais passée en cours de traitement} → issue exclue du calcul du cycle time

## Hors scope
- Métriques en temps réel pendant un cycle en cours
- Objectifs ou cibles de performance à atteindre
- Comparaison entre équipes
- Export des métriques

## Glossaire
| Terme | Définition |
|-------|------------|
| Cycle | Période de travail définie avec une date de début et de fin (sprint dans Linear) |
| Vélocité | Rapport entre les points complétés et les points planifiés au démarrage |
| Throughput | Nombre total d'issues complétées dans le cycle |
| Cycle time | Durée entre le moment où une issue passe en cours de traitement et sa complétion |
| Lead time | Durée entre la création d'une issue et sa complétion |
| Scope creep | Issues ajoutées au cycle après sa date de début |
| Taux de complétion | Pourcentage d'issues terminées par rapport au périmètre initial du cycle |
| Tendance | Évolution d'une métrique comparée aux 3 derniers cycles terminés |
