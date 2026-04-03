# Afficher les donnees de pilotage dans le rapport de cycle

## Status: ready

## Contexte
La page rapport de cycle affiche 6 metriques de base et un tableau d'issues, mais les donnees critiques de pilotage — goulots d'etranglement, issues bloquees, precision d'estimation — restent invisibles. Les APIs existent et sont implementees, mais aucun visuel ne les exploite. Le tech lead ne peut pas piloter son cycle sans ces donnees.

## Rules
- La section goulots affiche le temps median par statut et identifie le statut goulot
- La section goulots affiche la comparaison avec le cycle precedent si disponible
- La section goulots affiche le breakdown par assignee avec le temps median par statut par developpeur
- La section issues bloquees affiche les alertes actives triees par severite (critical d'abord, puis warning)
- Chaque alerte affiche le titre de l'issue, le statut actuel, la severite et la duree de blocage
- Un bouton permet de relancer la detection des issues bloquees manuellement
- La section estimation affiche le score de precision de l'equipe et le breakdown par developpeur
- Le breakdown par developpeur montre le score, le nombre de sur-estimations et de sous-estimations
- Les trois sections se chargent automatiquement a la selection d'un cycle
- Chaque section est independante — l'echec d'une API n'empeche pas l'affichage des autres
- Le tableau d'issues brut (liste titre/statut/points/assignee) est supprime de la page — les sections de pilotage le remplacent

## Scenarios
- goulots nominaux: {cycle avec 10 issues terminees, cycle precedent disponible} -> temps median par statut + statut goulot identifie + evolution vs cycle precedent en pourcentage
- goulots par assignee: {3 developpeurs sur le cycle} -> breakdown avec temps median par statut pour chaque assignee
- issues bloquees visibles: {3 alertes actives: 1 critical "In Review" 100h, 2 warnings "In Progress" 50h} -> liste triee critical d'abord + severite + duree affichees
- detection manuelle: {clic sur "Relancer la detection"} -> detection executee + liste actualisee
- estimation nominale: {cycle avec issues estimees et terminees} -> score equipe + breakdown par developpeur avec score, sur-estimations, sous-estimations
- aucune issue terminee: {cycle en cours, 0 Done} -> section goulots affiche "Aucune donnee de goulot disponible"
- aucune issue bloquee: {0 alerte active} -> section bloquees affiche "Aucune issue bloquee detectee"
- estimation sans donnees: {aucune issue estimee ou completee} -> section estimation affiche "Pas assez de donnees pour calculer la precision"
- cycle sans comparaison: {un seul cycle disponible} -> goulots affiches sans colonne evolution + mention "Pas assez de cycles pour comparer"
- erreur API partielle: {API goulots en erreur, autres OK} -> section goulots affiche erreur + sections bloquees et estimation chargent normalement

## Hors scope
- Configuration des seuils de blocage depuis l'UI
- Historique des alertes passees (endpoint history)
- Prediction de duree par issue dans le tableau
- Tendance d'estimation cross-cycles (graphique)
- Historique des rapports generes
- Envoi Slack depuis cette page
- Vue filtree par membre (spec profil membre separee)
- Tableau d'issues brut (supprime — pas de valeur ajoutee vs les sections de pilotage)

## Glossaire
| Terme | Definition |
|-------|------------|
| Goulot d'etranglement | Statut du workflow ou les issues passent le plus de temps en mediane |
| Issue bloquee | Issue restee dans un meme statut au-dela du seuil configure |
| Severite | Niveau de gravite d'une alerte : warning (seuil depasse) ou critical (double du seuil) |
| Score de precision | Mesure de l'ecart entre l'estimation et le cycle time reel, apres normalisation |
| Breakdown | Ventilation detaillee d'une metrique selon un axe (par assignee, par statut) |
| Temps median | Valeur centrale du temps passe dans un statut — plus robuste que la moyenne |
