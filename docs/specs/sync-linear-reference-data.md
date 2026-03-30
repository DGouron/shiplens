# Synchroniser les données de référence Linear

## Status: implemented

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

## Implementation

- **Bounded Context** : Synchronization (`src/modules/synchronization/`)
- **Artefacts** :
  - Schemas Zod : `entities/reference-data/reference-data.schema.ts`
  - Gateway ports : `entities/reference-data/linear-reference-data.gateway.ts`, `entities/reference-data/reference-data.gateway.ts`
  - Errors : `entities/reference-data/reference-data.errors.ts`
  - Use case : `usecases/sync-reference-data.usecase.ts`
  - Controller : `interface-adapters/controllers/sync-reference-data.controller.ts`
  - Gateways infra : `interface-adapters/gateways/reference-data.in-prisma.gateway.ts`, `interface-adapters/gateways/linear-reference-data.in-http.gateway.ts`
  - Migration Prisma : `prisma/migrations/20260330222204_add_reference_data_models/`
- **Endpoints** :
  - `POST /sync/reference-data` → `SyncReferenceDataUsecase`
- **Décisions** :
  - Pas d'Entity classes pour les données de référence (records typés Zod, zéro behavior)
  - Upsert via deleteMany + createMany par équipe dans une transaction Prisma
  - Milestone appartient à Project, pas directement à Team
