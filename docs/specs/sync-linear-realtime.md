# Maintenir les données Linear à jour en temps réel

## Contexte
Après l'import initial, les données évoluent dans Linear en continu. Shiplens doit recevoir et intégrer ces changements en temps réel pour que les analyses restent fiables et à jour.

## Rules
- Seules les notifications provenant de Linear et dont l'authenticité est vérifiée sont traitées
- Les types d'événements traités sont : création, modification et suppression d'issue ; création et modification de cycle ; création de commentaire
- Un événement dont le traitement échoue est réessayé automatiquement
- Un événement qui échoue de manière répétée est isolé pour analyse manuelle
- Les événements concernant des équipes non sélectionnées sont ignorés
- Un même événement reçu plusieurs fois ne produit qu'une seule modification

## Scenarios
- issue créée dans Linear: {nouvelle issue dans une équipe suivie} → issue ajoutée dans Shiplens
- issue modifiée dans Linear: {statut d'une issue passe de "En cours" à "Terminé"} → issue mise à jour + transition d'état enregistrée
- issue supprimée dans Linear: {issue archivée ou supprimée} → issue marquée comme supprimée dans Shiplens
- cycle créé dans Linear: {nouveau cycle dans une équipe suivie} → cycle ajouté dans Shiplens
- commentaire ajouté dans Linear: {nouveau commentaire sur une issue suivie} → commentaire ajouté dans Shiplens
- notification d'origine non vérifiée: {notification reçue sans preuve d'authenticité valide} → reject "Notification ignorée : origine non vérifiée."
- événement sur une équipe non suivie: {issue créée dans une équipe non sélectionnée} → événement ignoré silencieusement
- échec temporaire de traitement: {erreur passagère lors du traitement d'un événement} → événement réessayé automatiquement + traité avec succès
- échec répété de traitement: {événement échoue après plusieurs tentatives} → événement isolé pour analyse + alerte générée
- événement reçu en doublon: {même événement reçu deux fois} → une seule modification appliquée
- type d'événement non supporté: {événement Linear d'un type non géré} → événement ignoré silencieusement

## Hors scope
- Import initial de l'historique (couvert par la spec sync initiale)
- Analyse ou transformation des données reçues
- Notifications vers l'utilisateur en cas de changement dans Linear
- Gestion de la reconnexion du workspace Linear

## Glossaire
| Terme | Définition |
|-------|------------|
| Sync incrémentale | Mise à jour continue des données après l'import initial |
| Événement | Notification envoyée par Linear lorsqu'une donnée change |
| Transition d'état | Changement de statut d'une issue, horodaté |
| Événement isolé | Événement non traitable mis de côté pour investigation manuelle |
| Équipe suivie | Équipe sélectionnée par l'utilisateur lors de la configuration |
