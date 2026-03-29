# Envoyer le rapport de sprint sur Slack

## Contexte
Le tech lead veut recevoir automatiquement le rapport de sprint dans son canal Slack dédié, sans devoir aller le chercher manuellement dans le dashboard. Cela garantit que toute l'équipe et les stakeholders voient le bilan au bon moment, sans effort supplémentaire.

## Rules
- L'envoi Slack nécessite un webhook configuré pour le canal cible
- Le rapport est envoyé automatiquement à la clôture de chaque cycle
- Le message Slack contient un résumé formaté avec mise en forme enrichie et un lien vers le rapport complet dans le dashboard
- Chaque équipe peut activer ou désactiver indépendamment la notification Slack
- Un rapport ne peut être envoyé que s'il a été généré au préalable
- Le webhook est validé lors de sa configuration pour éviter les envois silencieusement échoués

## Scenarios
- envoi nominal: {cycle clôturé, rapport généré, webhook configuré, notification activée} → message envoyé sur Slack + résumé formaté + lien vers le rapport complet
- notification désactivée par l'équipe: {cycle clôturé, rapport généré, webhook configuré, notification désactivée} → aucun envoi
- webhook non configuré: {cycle clôturé, rapport généré, aucun webhook} → reject "Aucun webhook Slack n'est configuré pour cette équipe. Veuillez en ajouter un dans les paramètres de notification."
- webhook invalide: {webhook mal formé lors de la configuration} → reject "L'adresse du webhook Slack est invalide. Veuillez vérifier le format."
- rapport non généré: {cycle clôturé, aucun rapport généré, webhook configuré} → reject "Le rapport de sprint n'a pas encore été généré. Impossible d'envoyer la notification."
- envoi échoué côté Slack: {cycle clôturé, rapport généré, webhook configuré, Slack injoignable} → reject "L'envoi vers Slack a échoué. Veuillez vérifier la configuration du webhook ou réessayer plus tard."
- configuration du webhook: {utilisateur saisit une URL de webhook valide} → webhook enregistré + message de test envoyé sur le canal
- modification du webhook: {webhook déjà configuré, nouvelle URL saisie} → ancien webhook remplacé + message de test envoyé sur le nouveau canal

## Hors scope
- Envoi vers autre chose que Slack (email, Teams, Discord)
- Personnalisation du contenu du message Slack
- Envoi à plusieurs canaux Slack par équipe
- Planification de l'envoi à une heure précise (l'envoi se fait à la clôture du cycle)
- Renvoi manuel d'un rapport déjà envoyé

## Glossaire
| Terme | Définition |
|-------|------------|
| Webhook Slack | Adresse de destination permettant d'envoyer un message dans un canal Slack |
| Canal Slack | Espace de discussion dans Slack où le rapport sera publié |
| Cycle | Période de travail d'une équipe (sprint) dont le rapport résume l'activité |
| Résumé formaté | Version condensée du rapport adaptée à la lecture dans Slack avec mise en forme enrichie |
| Notification | Message automatique envoyé sur Slack à la clôture d'un cycle |
