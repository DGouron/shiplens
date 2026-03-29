# Définir des règles d'audit personnalisées

## Contexte
Le tech lead veut formaliser les pratiques de son équipe sous forme de règles vérifiables automatiquement. Sans ça, les bonnes pratiques restent orales, personne ne sait si elles sont réellement suivies, et les mêmes dérives reviennent à chaque cycle.

## Rules
- Une règle a obligatoirement un identifiant unique, un nom, une sévérité et une condition
- Les sévérités possibles sont : info, warning, error
- Une condition porte sur un seuil de métrique, un pattern sur labels ou statuts, ou un ratio entre deux métriques
- Une règle est immuable une fois créée — pour la modifier, on en crée une nouvelle et on archive l'ancienne
- Les règles sont évaluées automatiquement à chaque fin de cycle
- Le résultat d'une évaluation est pass, warn ou fail, accompagné d'un message explicatif
- Les règles sont stockées dans un dossier configurable, par défaut ./rules/
- Un identifiant de règle en doublon est interdit

## Scenarios
- création nominale: {identifiant "CT-MAX-5", nom "Cycle time max 5 jours", sévérité "warning", condition "cycle time > 5 jours"} → règle créée + disponible pour évaluation
- évaluation pass: {règle "cycle time > 5 jours", cycle terminé avec cycle time moyen de 3 jours} → résultat "pass" + message "Cycle time moyen : 3 jours (seuil : 5 jours)"
- évaluation warn: {règle "ratio bugs/features > 0.5" en sévérité "warning", cycle avec ratio 0.6} → résultat "warn" + message "Ratio bugs/features : 0.6 (seuil : 0.5)"
- évaluation fail: {règle "cycle time > 5 jours" en sévérité "error", cycle avec cycle time moyen de 8 jours} → résultat "fail" + message "Cycle time moyen : 8 jours (seuil : 5 jours)"
- identifiant manquant: {nom "Ma règle", sévérité "warning", condition présente, identifiant absent} → reject "L'identifiant de la règle est obligatoire."
- sévérité invalide: {identifiant présent, sévérité "critical"} → reject "La sévérité doit être info, warning ou error."
- condition invalide: {identifiant présent, condition "texte libre incompréhensible"} → reject "La condition de la règle n'est pas reconnue. Formats acceptés : seuil sur métrique, pattern sur labels/statuts, ratio entre métriques."
- identifiant en doublon: {identifiant "CT-MAX-5" déjà existant} → reject "Une règle avec l'identifiant CT-MAX-5 existe déjà."
- dossier de règles introuvable: {dossier configuré inexistant} → reject "Le dossier de règles configuré est introuvable."

## Hors scope
- Édition d'une règle existante (on archive et recrée)
- Évaluation en temps réel pendant un cycle en cours
- Règles portant sur des métriques individuelles par développeur
- Interface graphique de création de règles (fichier texte uniquement)

## Glossaire
| Terme | Définition |
|-------|------------|
| Règle d'audit | Vérification automatique d'une pratique d'équipe, définie par un identifiant, un nom, une sévérité et une condition |
| Sévérité | Niveau d'importance de la règle : info (informatif), warning (attention requise), error (violation critique) |
| Condition | Critère mesurable : seuil sur une métrique, pattern sur labels/statuts, ou ratio entre deux métriques |
| Évaluation | Vérification d'une règle sur les données d'un cycle terminé, produisant pass, warn ou fail |
| Archivage | Retrait d'une règle de l'évaluation active sans suppression physique |
