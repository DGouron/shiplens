# Connecter son workspace Linear

## Status: implemented

## Contexte
L'utilisateur doit relier son espace de travail Linear à Shiplens pour que l'application puisse accéder à ses données. Sans cette connexion, aucune fonctionnalité de suivi n'est disponible.

## Rules
- Un utilisateur ne peut avoir qu'un seul workspace Linear connecté à la fois
- Les identifiants de connexion ne sont jamais exposés en clair
- La session Linear reste active sans intervention manuelle de l'utilisateur
- La déconnexion supprime toute trace d'accès au workspace côté Linear et côté Shiplens

## Scenarios
- connexion réussie: {utilisateur authentifié, autorisation Linear accordée} → statut "connecté" + nom du workspace affiché
- autorisation refusée: {utilisateur authentifié, autorisation Linear refusée} → reject "La connexion à Linear a été refusée. Veuillez réessayer."
- permissions insuffisantes: {utilisateur authentifié, permissions partielles accordées} → reject "Les permissions accordées sont insuffisantes. Veuillez autoriser tous les accès demandés."
- session expirée: {session Linear arrivée à expiration} → renouvellement automatique + statut "connecté" maintenu
- renouvellement impossible: {session Linear expirée, renouvellement échoué} → statut "déconnecté" + reject "Votre session Linear a expiré. Veuillez vous reconnecter."
- déconnexion: {utilisateur connecté, demande de déconnexion} → statut "déconnecté" + accès révoqué côté Linear
- workspace déjà connecté: {utilisateur connecté, tentative de connexion d'un autre workspace} → remplacement de l'ancien workspace + statut "connecté" au nouveau

## Hors scope
- Connexion à plusieurs workspaces simultanément
- Connexion à d'autres outils que Linear
- Gestion des rôles ou permissions internes à Linear

## Glossaire
| Terme | Définition |
|-------|------------|
| Workspace | Espace de travail Linear d'une organisation |
| Session | Lien actif entre Shiplens et le workspace Linear de l'utilisateur |
| Déconnexion | Rupture complète du lien, avec suppression des accès des deux côtés |

## Implementation

| Artefact | Chemin |
|----------|--------|
| Bounded Context | `src/modules/identity/` |
| Entity | `entities/linear-workspace-connection/linear-workspace-connection.ts` |
| Use Cases | `usecases/get-connection-status.usecase.ts`, `usecases/connect-linear-workspace.usecase.ts`, `usecases/disconnect-linear-workspace.usecase.ts`, `usecases/refresh-linear-session.usecase.ts` |
| Controller | `interface-adapters/controllers/linear-connection.controller.ts` |
| Presenter | `interface-adapters/presenters/connection-status.presenter.ts` |
| Gateways | `interface-adapters/gateways/linear-workspace-connection.in-prisma.gateway.ts`, `interface-adapters/gateways/linear-api.in-http.gateway.ts`, `interface-adapters/gateways/token-encryption.in-crypto.gateway.ts` |
| Migration | `prisma/migrations/20260330212207_add_linear_workspace_connection/` |
| Tests acceptance | `tests/acceptance/connect-linear-workspace.acceptance.spec.ts` |

### Endpoints

| Methode | Route | Use Case |
|---------|-------|----------|
| GET | `/linear/status` | GetConnectionStatus |
| POST | `/linear/connect` | ConnectLinearWorkspace |
| POST | `/linear/disconnect` | DisconnectLinearWorkspace |
| POST | `/linear/refresh` | RefreshLinearSession |

### Decisions

- Single-tenant : un seul workspace en base (pas de multi-user)
- Tokens chiffrés AES-256-GCM avant persistance, l'entité ne manipule que des tokens chiffrés
- 3 gateway ports distincts (persistance, API Linear, encryption)
- Pas de refresh automatique par guard/middleware (YAGNI) — endpoint explicite
- Scopes stockés en string délimité (contrainte SQLite)
- Requires env vars: `LINEAR_CLIENT_ID`, `LINEAR_CLIENT_SECRET`, `ENCRYPTION_KEY`
