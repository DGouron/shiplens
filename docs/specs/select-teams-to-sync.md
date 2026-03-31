# Sélectionner les équipes à synchroniser

## Status: implemented

## Contexte
Une fois connecté à Linear, l'utilisateur doit choisir quelles équipes et projets il souhaite suivre dans Shiplens. Sans cette sélection, Shiplens ne sait pas quelles données importer.

## Rules
- L'utilisateur doit avoir un workspace Linear connecté pour accéder à la sélection
- Au moins une équipe doit être sélectionnée pour lancer la synchronisation
- La sélection peut être modifiée à tout moment
- Seuls les projets actifs sont proposés à la sélection
- Le nombre estimé d'issues à synchroniser est affiché avant confirmation

## Scenarios
- sélection nominale: {workspace connecté, 2 équipes cochées, 3 projets cochés} → sélection sauvegardée + estimation "~150 issues à synchroniser"
- aucune équipe sélectionnée: {workspace connecté, aucune équipe cochée, confirmation} → reject "Veuillez sélectionner au moins une équipe."
- modification de sélection: {sélection existante, retrait d'une équipe, ajout d'une autre} → sélection mise à jour + nouvelle estimation affichée
- workspace non connecté: {pas de workspace connecté, accès à la sélection} → reject "Veuillez d'abord connecter votre workspace Linear."
- workspace sans équipe: {workspace connecté, aucune équipe dans Linear} → reject "Aucune équipe trouvée dans votre workspace Linear."
- tous les projets d'une équipe archivés: {workspace connecté, équipe dont tous les projets sont archivés} → équipe affichée sans projet sélectionnable

## Hors scope
- Filtrage des issues individuelles
- Lancement automatique de la synchronisation après sélection
- Sélection d'équipes provenant de plusieurs workspaces

## Glossaire
| Terme | Définition |
|-------|------------|
| Équipe | Team Linear — unité organisationnelle regroupant des membres et des projets |
| Projet | Regroupement d'issues au sein d'une équipe, avec un objectif et une échéance |
| Projet actif | Projet non archivé et non terminé dans Linear |
| Estimation | Nombre approximatif d'issues qui seront importées selon la sélection courante |
