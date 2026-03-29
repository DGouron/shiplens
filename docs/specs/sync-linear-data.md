# Synchroniser les issues et cycles depuis Linear

## Contexte
Shiplens analyse la donnée Linear pour produire des insights. Avant toute analyse, le système doit importer les issues, cycles et leurs transitions d'état pour les équipes sélectionnées. Ce sont les données volumineuses et critiques pour les analytics.

## Rules
- Seules les équipes explicitement sélectionnées par l'utilisateur sont synchronisées
- La synchronisation importe les issues avec leurs propriétés : titre, statut, points, labels, assignee, dates
- La synchronisation importe les cycles avec leurs dates et le périmètre d'issues associé
- Les transitions d'état des issues (changements de statut horodatés) sont importées — elles sont essentielles aux analyses
- La synchronisation est relançable sans créer de doublons
- La synchronisation reprend là où elle s'est arrêtée après une interruption
- La synchronisation respecte les contraintes de débit imposées par le fournisseur de données
- L'utilisateur peut suivre la progression de la synchronisation en cours

## Scenarios
- import des issues: {workspace connecté, 1 équipe avec 150 issues} → 150 issues importées avec titre, statut, points, labels, assignee
- import des cycles: {workspace connecté, 1 équipe avec 5 cycles} → 5 cycles importés avec dates et issues rattachées
- import des transitions d'état: {issue avec 4 changements de statut} → 4 transitions horodatées importées
- progression visible: {sync en cours, 200 issues sur 500 importées} → progression "40%"
- relance sans doublons: {sync déjà complétée, relancée} → aucune donnée dupliquée + statut "synchronisé"
- reprise après interruption: {sync interrompue à 60%} → relance reprend là où elle s'est arrêtée + statut "synchronisé" à la fin
- débit fournisseur saturé: {trop de requêtes en peu de temps} → sync ralentie automatiquement + reprend sans perte de données
- aucune équipe sélectionnée: {workspace connecté, 0 équipe sélectionnée} → reject "Veuillez sélectionner au moins une équipe avant de lancer la synchronisation."
- workspace non connecté: {aucun workspace Linear connecté} → reject "Veuillez d'abord connecter votre workspace Linear."
- équipe sans issue: {workspace connecté, équipe sélectionnée sans aucune issue} → statut "synchronisé" + 0 issue importée

## Hors scope
- Import des données de référence (labels, statuts, membres) — couvert par sync-linear-reference-data
- Synchronisation en temps réel — couvert par sync-linear-realtime
- Transformation ou analyse des données importées
- Import de données hors des équipes sélectionnées

## Glossaire
| Terme | Définition |
|-------|------------|
| Issue | Tâche ou ticket de travail dans Linear |
| Cycle | Période de travail itérative (sprint) dans Linear, avec date de début et de fin |
| Transition d'état | Changement de statut d'une issue (ex: "En cours" → "Terminé"), horodaté |
| Synchronisation initiale | Import complet de l'historique des données Linear pour les équipes sélectionnées |
