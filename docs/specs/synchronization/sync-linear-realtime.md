# Keep Linear data up to date in real time

## Status: implemented

## Context
After the initial import, data keeps evolving in Linear. Shiplens must receive and integrate these changes in real time so that analyses remain reliable and up to date.

## Rules
- Only notifications originating from Linear whose authenticity is verified are processed
- The event types handled are: issue creation, modification and deletion; cycle creation and modification; comment creation
- An event whose processing fails is automatically retried
- An event that fails repeatedly is isolated for manual analysis
- Events concerning non-selected teams are ignored
- The same event received multiple times produces only one modification

## Scenarios
- issue created in Linear: {new issue in a tracked team} -> issue added in Shiplens
- issue modified in Linear: {issue status changes from "In Progress" to "Done"} -> issue updated + state transition recorded
- issue deleted in Linear: {issue archived or deleted} -> issue marked as deleted in Shiplens
- cycle created in Linear: {new cycle in a tracked team} -> cycle added in Shiplens
- comment added in Linear: {new comment on a tracked issue} -> comment added in Shiplens
- unverified notification origin: {notification received without valid authenticity proof} -> reject "Notification ignorée : origine non vérifiée."
- event on a non-tracked team: {issue created in a non-selected team} -> event silently ignored
- temporary processing failure: {transient error while processing an event} -> event automatically retried + processed successfully
- repeated processing failure: {event fails after multiple attempts} -> event isolated for analysis + alert generated
- duplicate event received: {same event received twice} -> only one modification applied
- unsupported event type: {Linear event of an unhandled type} -> event silently ignored

## Implementation

### Bounded Context
Synchronization

### Artefacts
- **Entity** : `WebhookEvent` — vérification signature HMAC SHA-256, classification event, state machine (pending → processed/failed)
- **Use Case** : `ProcessWebhookEventUsecase` — orchestration complète (verify → filter team → route → retry → persist)
- **Controller** : `WebhookController` — `POST /webhooks/linear`
- **Gateway ports** : `WebhookEventGateway` (hasBeenProcessed, save)
- **Gateway infra** : `WebhookEventInPrismaGateway`, extensions `IssueDataInPrismaGateway` (upsertIssue, softDeleteIssue, upsertCycle, createComment, upsertTransition)
- **Migration** : `add-webhook-event-and-comment` (models WebhookEvent, Comment, deletedAt sur Issue)

### Endpoints
| Méthode | Route | Use Case |
|---------|-------|----------|
| POST | `/webhooks/linear` | ProcessWebhookEventUsecase |

### Décisions architecturales
- Signature HMAC dans l'entité (règle métier, pas middleware)
- Idempotence via deliveryId unique en table WebhookEvent
- Retry synchrone (3 tentatives), controller retourne toujours 200 sauf signature invalide (401)
- Soft delete d'issue via champ deletedAt
- Secret webhook via env var `LINEAR_WEBHOOK_SIGNING_SECRET`

## Out of scope
- Initial history import (covered by the initial sync spec)
- Analysis or transformation of received data
- User notifications on Linear changes
- Linear workspace reconnection management

## Glossary
| Term | Definition |
|------|------------|
| Incremental sync | Continuous data update after the initial import |
| Event | Notification sent by Linear when data changes |
| State transition | Status change of an issue, timestamped |
| Isolated event | Unprocessable event set aside for manual investigation |
| Tracked team | Team selected by the user during configuration |
