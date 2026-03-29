# Synchroniser les données de référence Linear

## Contexte
Avant d'importer les issues et cycles, Shiplens doit disposer des données de référence du workspace : labels, statuts du workflow, membres des équipes et projets. Ces données structurent et contextualisent les issues importées ensuite.

## Rules
- Seules les données de référence des équipes sélectionnées sont importées
- La synchronisation importe les labels disponibles pour chaque équipe
- La synchronisation importe les statuts du workflow de chaque équipe (les étapes possibles d'une issue)
- La synchronisation importe les membres de chaque équipe avec leur rôle
- La synchronisation importe les projets et milestones actifs de chaque équipe
- La synchronisation est relançable sans créer de doublons
- Les données de référence sont mises à jour si elles ont changé depuis la dernière synchronisation

## Scenarios
- import des labels: {équipe avec 8 labels} → 8 labels importés avec nom et couleur
- import des statuts du workflow: {équipe avec workflow "Backlog → Todo → In Progress → In Review → Done"} → 5 statuts importés dans l'ordre du workflow
- import des membres: {équipe avec 6 membres} → 6 membres importés avec nom et rôle
- import des projets: {équipe avec 3 projets actifs, dont 1 avec 2 milestones} → 3 projets importés + 2 milestones
- mise à jour après modification: {label renommé dans Linear depuis la dernière sync} → label mis à jour dans Shiplens
- relance sans doublons: {sync de référence déjà complétée, relancée} → aucune donnée dupliquée
- aucune équipe sélectionnée: {workspace connecté, 0 équipe} → reject "Veuillez sélectionner au moins une équipe avant de lancer la synchronisation."
- workspace non connecté: {aucun workspace connecté} → reject "Veuillez d'abord connecter votre workspace Linear."

## Hors scope
- Import des issues, cycles et transitions d'état — couvert par sync-linear-data
- Synchronisation en temps réel — couvert par sync-linear-realtime
- Gestion des permissions utilisateur sur Linear

## Glossaire
| Terme | Définition |
|-------|------------|
| Données de référence | Données structurantes du workspace : labels, statuts, membres, projets, milestones |
| Label | Étiquette attachée aux issues pour les catégoriser (ex: "bug", "feature") |
| Statut du workflow | Étape possible dans le cycle de vie d'une issue au sein d'une équipe |
| Membre | Personne appartenant à une équipe Linear |
| Projet | Regroupement d'issues autour d'un objectif dans Linear |
| Milestone | Jalon d'avancement au sein d'un projet |
