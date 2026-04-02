# Afficher les états vides du dashboard

## Status: implemented

## Contexte
Quand un utilisateur ouvre le dashboard pour la première fois, il se prend une erreur 500 au lieu d'un écran explicatif. Que le workspace ne soit pas connecté ou qu'aucune équipe ne soit synchronisée, le dashboard doit guider l'utilisateur vers l'action suivante au lieu de crasher.

## Rules
- Le dashboard ne retourne jamais d'erreur quand aucune donnée n'est disponible
- Si aucun workspace n'est connecté, le dashboard retourne un état "non connecté" avec un message guidant vers la connexion
- Si aucune équipe n'est synchronisée, le dashboard retourne un état "aucune équipe" avec un message guidant vers la sélection d'équipes
- L'état "non connecté" est prioritaire sur l'état "aucune équipe" : on vérifie la connexion d'abord
- Le message guide est en français et indique l'action concrète à effectuer

## Scenarios
- workspace non connecté: {aucun workspace connecté} → status "not_connected" + message "Aucun workspace connecté. Veuillez connecter votre workspace Linear."
- aucune équipe synchronisée: {workspace connecté, aucune équipe synchronisée} → status "no_teams" + message "Aucune équipe synchronisée. Veuillez d'abord sélectionner des équipes à synchroniser."
- workspace connecté avec équipes: {workspace connecté, 2 équipes synchronisées avec cycles actifs} → données du dashboard normales (comportement inchangé)

## Hors scope
- Modification du HTML/frontend du dashboard (rendu côté client)
- Ajout de liens cliquables dans les messages
- Onboarding multi-étapes ou wizard de configuration

## Glossaire
| Terme | Définition |
|-------|------------|
| État vide | Réponse du dashboard quand les prérequis ne sont pas remplis, contenant un statut et un message guide |
