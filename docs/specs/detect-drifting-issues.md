# Detecter les tickets en derive

## Status: implemented

## Contexte
Un ticket estime a 1 point qui traine toute la journee sans etre termine est un signal d'alerte. Aujourd'hui, la detection d'issues bloquees ne repere que les tickets stagnant dans un statut. Elle ne detecte pas les tickets qui avancent mais trop lentement par rapport a leur estimation. Le tech lead a besoin de ce signal pour intervenir tot dans le cycle.

## Rules
- Un ticket est en derive quand son temps en cours de traitement depasse la duree attendue selon son estimation en points
- La grille de correspondance points/duree est fixe et basee sur la suite Fibonacci :
  - 1 point = 4h ouvrees max
  - 2 points = 6h ouvrees max
  - 3 points = 8h ouvrees max (1 jour)
  - 5 points = 20h ouvrees max (2-3 jours)
- Les tickets estimes a 8 points ou plus sont signales immediatement comme "a redecouper" des qu'ils passent en cours de traitement
- Le temps est calcule en heures ouvrees (lundi-vendredi, 9h-18h) — les soirs, nuits et weekends ne comptent pas
- La detection couvre tous les statuts non terminaux (In Progress, In Review, etc.) — pas uniquement le premier statut de travail
- Le temps pris en compte est le cumul depuis le passage au premier statut de travail (started), pas depuis le dernier changement de statut
- Les tickets sans estimation en points sont exclus de la detection
- La grille de correspondance est affichee en lecture seule dans la page settings

## Scenarios
- derive 1 point: {ticket 1 point, passe en "In Progress" a 9h, toujours en "In Review" a 17h} -> alerte derive + duree ouvree "8h" + attendu "4h"
- derive 5 points: {ticket 5 points, en cours depuis 4 jours ouvres} -> alerte derive + duree ouvree "32h" + attendu "20h"
- dans les temps: {ticket 3 points, en cours depuis 6h ouvrees} -> aucune alerte
- ticket termine a temps: {ticket 2 points, termine en 5h ouvrees} -> aucune alerte
- a redecouper: {ticket 8 points, passe en "In Progress"} -> alerte immediate "A redecouper"
- a redecouper 13: {ticket 13 points, passe en "In Progress"} -> alerte immediate "A redecouper"
- heures ouvrees weekend: {ticket 1 point, passe en "In Progress" vendredi 16h, lundi 10h} -> duree ouvree comptee = 3h (2h vendredi + 1h lundi), pas en derive
- heures ouvrees soir: {ticket 1 point, passe en "In Progress" a 17h, lendemain 10h} -> duree ouvree = 2h (1h veille + 1h matin), pas en derive
- sans estimation: {ticket sans points, en cours depuis 5 jours} -> exclu de la detection
- grille visible: {page settings} -> grille affichee en lecture seule avec les seuils par nombre de points

## Hors scope
- Modification de la grille par l'utilisateur (grille fixe)
- Notification automatique en cas de derive (Slack, email)
- Suggestion de redecoupe pour les tickets 8+
- Analyse de la cause de la derive
- Prise en compte des jours feries

## Glossaire
| Terme | Definition |
|-------|------------|
| Ticket en derive | Issue dont le temps en cours de traitement depasse la duree attendue selon son estimation |
| Grille de correspondance | Table fixe associant un nombre de points Fibonacci a une duree maximum attendue en heures ouvrees |
| Heures ouvrees | Heures de travail comptabilisees du lundi au vendredi, de 9h a 18h |
| A redecouper | Signal preventif pour les tickets estimes a 8 points ou plus, consideres trop gros pour etre livres en un bloc |

## Implementation

### Bounded Context
Analytics

### Artifacts
- **Entity** : `DriftingIssue` — analyse de derive calculee a la volee
- **Domain logic** : `business-hours.ts` (calcul heures ouvrees avec fuseau), `drift-grid.ts` (grille fixe Fibonacci)
- **Use case** : `DetectDriftingIssuesUsecase` — orchestre fetch issues, calcul heures ouvrees, detection
- **Gateway port** : `DriftingIssueDetectionDataGateway` — issues en cours avec points et startedAt
- **Gateway impl** : `DriftingIssueDetectionDataInPrismaGateway`
- **Presenter** : `DriftingIssuesPresenter`
- **Controller** : `DriftingIssuesController` — GET /analytics/drifting-issues/:teamId + GET drift-grid/entries
- **Settings** : fuseau horaire configurable par equipe (default Europe/Paris), grille en lecture seule

### Endpoints
| Methode | Route | Use case |
|---------|-------|----------|
| GET | /analytics/drifting-issues/:teamId | DetectDriftingIssuesUsecase |
| GET | /analytics/drifting-issues/drift-grid/entries | Grille fixe (pas de use case) |
| GET | /settings/teams/:teamId/timezone | TeamSettingsGateway.getTimezone |
| PUT | /settings/teams/:teamId/timezone | TeamSettingsGateway.setTimezone |

### Decisions architecturales
- Calcul a la volee, pas de persistance (pas d'historique d'alertes de derive)
- Pas de scheduler (hors scope : pas de notifications)
- Heures ouvrees = fonction pure prenant un fuseau en parametre
- Grille fixe en constante dans le code, pas en DB
- Fuseau horaire dans TeamSettings existant (fichier JSON), default Europe/Paris
