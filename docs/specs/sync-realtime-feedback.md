---
status: draft
priority: low
origin: debug-workflow fix/sync-data-accuracy-v2
---

# Sync — Feedback temps réel de la progression

## Contexte

La sync Linear pagine par batch de 50 issues/cycle. Pour un cycle de 500 issues, ça fait ~10 requêtes. L'utilisateur n'a aucun feedback visuel pendant ce temps.

## Besoin

Afficher la progression de la sync en temps réel :
- Nombre d'issues récupérées / total estimé
- Cycle en cours de traitement
- Étape actuelle (issues, cycles, transitions)

## Contraintes à explorer

- Mécanisme de push : SSE, WebSocket, ou polling ?
- Impact sur l'architecture : le gateway HTTP est actuellement fire-and-forget
- Rate limit Linear : le batch de 50 est plus lent que 1 grosse requête, mais plus prévisible

## Décisions à prendre

- À spécifier avec `/product-manager` quand le sujet sera priorisé
