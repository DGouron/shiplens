# Alerter sur Slack quand une issue est bloquée

## Contexte
La détection des issues bloquées existe dans Shiplens (voir detect-blocked-issues), mais le tech lead ne consulte pas le dashboard en permanence. Il veut recevoir une alerte Slack dès qu'un blocage est détecté, pour réagir sans délai.

## Prérequis
- detect-blocked-issues : fournit la détection et les seuils

## Rules
- Une alerte Slack est envoyée pour chaque nouvelle issue détectée comme bloquée
- Une même issue ne déclenche qu'une seule alerte par jour maximum
- L'alerte contient : titre de l'issue, statut actuel, durée dans ce statut, assignee et lien vers l'issue dans Linear
- L'alerte mentionne l'assignee pour attirer son attention
- Le canal Slack de destination est configurable par équipe
- Si aucun canal Slack n'est configuré, aucune alerte n'est envoyée

## Scenarios
- alerte nominale: {issue détectée bloquée en "In Review" depuis 50h, canal Slack configuré} → alerte envoyée + titre + statut + durée "50h" + mention assignee + lien Linear
- throttling journalier: {issue déjà alertée aujourd'hui, toujours bloquée} → aucune alerte supplémentaire
- nouvelle journée après throttling: {issue alertée hier, toujours bloquée} → nouvelle alerte envoyée
- issue sans assignee: {issue bloquée, aucun assignee} → alerte envoyée sans mention + indication "Aucun responsable assigné"
- canal non configuré: {issue bloquée, aucun canal Slack configuré pour l'équipe} → aucune alerte envoyée
- Slack injoignable: {issue bloquée, canal configuré, Slack injoignable} → reject "L'envoi de l'alerte vers Slack a échoué. Veuillez vérifier la configuration du canal."
- issue résolue entre deux vérifications: {issue bloquée à la vérification précédente, statut changé depuis} → aucune alerte
- configuration du canal: {utilisateur définit canal "#alerts-sprint" pour l'équipe "Backend"} → canal enregistré

## Hors scope
- Détection des issues bloquées et gestion des seuils — couvert par detect-blocked-issues
- Alertes vers autre chose que Slack (email, Teams, Discord)
- Résolution automatique des blocages
- Historique des alertes envoyées — l'historique de détection est dans detect-blocked-issues

## Glossaire
| Terme | Définition |
|-------|------------|
| Throttling | Limitation à une seule alerte par issue par jour pour éviter le bruit |
| Canal Slack | Espace de discussion dans Slack où les alertes sont publiées |
