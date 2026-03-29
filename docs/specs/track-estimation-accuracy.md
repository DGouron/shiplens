# Suivre la précision des estimations

## Contexte
Les estimations en points sont rarement confrontées à la réalité. Le tech lead a besoin de mesurer l'écart entre ce qui était prévu et ce qui s'est passé, pour que l'équipe calibre progressivement ses estimations et gagne en prévisibilité.

## Rules
- La précision d'estimation se mesure en comparant les points estimés au cycle time réel
- Le cycle time sert de proxy au temps réellement passé — il n'y a pas de time tracking
- Les issues sans estimation en points sont exclues du calcul de précision
- Les issues sans cycle time mesurable sont exclues du calcul de précision
- Le score de précision d'un développeur agrège toutes ses issues estimées sur la période
- La tendance d'estimation nécessite au minimum 2 cycles terminés
- La normalisation convertit points et durées sur une échelle commune pour permettre la comparaison

## Scenarios
- précision par issue: {issue complétée, 3 points estimés, cycle time de 2 jours} → ratio estimation "3 points / 2 jours"
- précision par développeur: {développeur avec 5 issues estimées et complétées} → score de précision calculé sur l'ensemble de ses issues
- précision par label: {issues complétées regroupées par label} → score de précision moyen par label
- sur-estimation détectée: {issue estimée à 8 points, cycle time d'une demi-journée} → ratio signalé comme sur-estimation
- sous-estimation détectée: {issue estimée à 1 point, cycle time de 5 jours} → ratio signalé comme sous-estimation
- tendance d'amélioration: {3 cycles terminés avec estimations} → évolution du score de précision affiché cycle par cycle
- historique insuffisant pour tendance: {moins de 2 cycles terminés} → reject "Pas assez d'historique pour afficher la tendance. Minimum 2 cycles terminés requis."
- issue sans estimation: {issue complétée sans points assignés} → issue exclue du calcul + mention "X issues sans estimation"
- issue sans cycle time: {issue complétée sans transition en cours de traitement} → issue exclue du calcul + mention "X issues sans cycle time"
- score global équipe: {toutes les issues estimées et complétées de l'équipe} → score de précision agrégé de l'équipe

## Hors scope
- Time tracking réel (saisie de temps par les développeurs)
- Recommandation automatique d'estimation pour de nouvelles issues
- Comparaison de précision entre équipes
- Modification des estimations depuis Shiplens

## Glossaire
| Terme | Définition |
|-------|------------|
| Estimation | Nombre de points assignés à une issue avant sa réalisation |
| Cycle time | Durée entre le passage en cours de traitement et la complétion, utilisé comme proxy du temps réel |
| Score de précision | Mesure de l'écart entre l'estimation et le cycle time réel, après normalisation |
| Normalisation | Conversion des points et des durées sur une échelle commune pour les rendre comparables |
| Sur-estimation | Issue dont le cycle time est significativement inférieur à ce que l'estimation laissait prévoir |
| Sous-estimation | Issue dont le cycle time est significativement supérieur à ce que l'estimation laissait prévoir |
