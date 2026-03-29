# Connecter son workspace Linear

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
