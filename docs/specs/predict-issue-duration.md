# Prédire la durée probable d'une issue

## Contexte
Quand un PO priorise le backlog ou planifie un cycle, il n'a aucune visibilité sur le temps que prendra réellement chaque issue. Une prédiction basée sur l'historique de l'équipe lui permet de prendre des décisions de planification plus éclairées.

## Rules
- La prédiction nécessite au minimum 2 cycles d'historique terminés pour s'activer
- La prédiction se base sur les issues similaires déjà complétées par l'équipe
- Les critères de similarité sont : le label, le type, la complexité en points et le développeur assigné
- Chaque prédiction fournit trois valeurs : optimiste, probable et pessimiste
- La prédiction est recalculée quand les caractéristiques de l'issue changent
- Seules les issues du cycle en cours sont concernées par la prédiction
- L'approche de calcul est statistique : médiane des cycle times des issues similaires

## Scenarios
- prédiction nominale: {issue avec label "bug", 3 points, historique de 15 bugs similaires complétés} → durée optimiste + durée probable + durée pessimiste
- prédiction avec peu de données: {issue avec label "feature", 5 points, seulement 3 issues similaires dans l'historique} → prédiction affichée avec mention "confiance faible"
- historique insuffisant: {moins de 2 cycles terminés} → reject "Pas assez d'historique pour activer les prédictions. Minimum 2 cycles terminés requis."
- aucune issue similaire: {issue avec un label jamais vu dans l'historique} → reject "Aucune issue similaire trouvée dans l'historique. Impossible de prédire la durée."
- issue sans points: {issue du cycle en cours sans estimation en points} → prédiction basée sur les autres critères disponibles (label, type, assigné)
- issue non assignée: {issue du cycle en cours sans développeur assigné} → prédiction basée sur la moyenne de l'équipe pour les critères restants
- recalcul après modification: {issue dont le label passe de "feature" à "bug"} → prédiction recalculée avec le nouveau label
- issue hors cycle: {issue dans le backlog, pas dans un cycle en cours} → aucune prédiction affichée

## Hors scope
- Prédiction par intelligence artificielle (phase ultérieure)
- Prise en compte du contenu textuel de la description pour la prédiction
- Prédiction de la durée totale d'un cycle
- Suggestions automatiques de réaffectation d'issues

## Glossaire
| Terme | Définition |
|-------|------------|
| Prédiction | Estimation calculée de la durée probable d'une issue, basée sur l'historique |
| Intervalle de confiance | Trio de valeurs (optimiste, probable, pessimiste) encadrant la durée prédite |
| Issue similaire | Issue déjà complétée partageant des critères communs avec l'issue à prédire |
| Confiance faible | Indication que la prédiction repose sur un échantillon réduit d'issues similaires |
| Cycle time | Durée entre le passage en cours de traitement et la complétion d'une issue |
