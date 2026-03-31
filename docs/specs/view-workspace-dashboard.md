# Consulter le tableau de bord du workspace

## Status: implemented

## Contexte
Le tech lead ouvre Shiplens pour avoir une vue d'ensemble instantanée de son workspace. Aujourd'hui, il doit naviguer dans Linear équipe par équipe pour reconstituer mentalement l'état global. Shiplens affiche un dashboard centralisé avec les indicateurs clés de chaque équipe et un accès rapide aux rapports.

## Rules
- Le dashboard affiche toutes les équipes du workspace ayant un cycle actif
- Chaque équipe affiche son cycle actif en cours avec ses KPIs : tendance vélocité, taux de complétion, nombre d'issues bloquées
- La tendance vélocité compare le cycle actif aux cycles précédents de la même équipe
- Le taux de complétion représente le ratio entre issues terminées et issues totales du cycle actif
- Le dernier rapport de sprint généré est accessible en un clic depuis chaque équipe
- Le statut de synchronisation Linear est visible en permanence : date de dernière synchronisation et prochaine synchronisation prévue
- Le dashboard priorise l'affichage desktop mais reste utilisable sur mobile

## Scenarios
- dashboard nominal: {workspace connecté, 3 équipes avec cycles actifs, données synchronisées} → 3 cartes équipe affichées + KPIs par équipe (tendance vélocité, taux de complétion, issues bloquées) + statut synchronisation visible
- équipe sans cycle actif: {workspace connecté, 1 équipe sans cycle actif parmi 3 équipes} → 2 cartes équipe avec KPIs + 1 carte équipe avec mention "Aucun cycle actif"
- accès au rapport depuis le dashboard: {équipe avec dernier rapport généré} → clic sur le rapport → navigation vers la page du rapport complet
- équipe sans rapport: {équipe avec cycle actif, aucun rapport généré} → carte équipe affichée sans lien vers un rapport + mention "Aucun rapport disponible"
- aucune équipe synchronisée: {workspace connecté, aucune équipe synchronisée} → reject "Aucune équipe synchronisée. Veuillez d'abord sélectionner des équipes à synchroniser."
- workspace non connecté: {aucun workspace connecté} → reject "Aucun workspace connecté. Veuillez connecter votre workspace Linear."
- synchronisation en retard: {dernière synchronisation > 24h} → statut synchronisation affiché en alerte + mention "Synchronisation en retard"
- toutes les issues bloquées: {équipe avec 100% d'issues bloquées} → KPI issues bloquées affiché en alerte sur la carte équipe

## Hors scope
- Personnalisation de l'ordre ou de la disposition des cartes équipe
- Filtrage ou recherche d'équipes sur le dashboard
- Création ou modification de cycles depuis le dashboard
- Affichage d'équipes provenant de plusieurs workspaces
- Notifications en temps réel sur les changements de KPIs

## Glossaire
| Terme | Définition |
|-------|------------|
| Dashboard | Page d'accueil affichant une vue d'ensemble du workspace |
| Carte équipe | Bloc visuel résumant l'état du cycle actif d'une équipe |
| Cycle actif | Cycle (sprint) en cours pour une équipe donnée |
| Tendance vélocité | Évolution de la vélocité du cycle actif par rapport aux cycles précédents |
| Taux de complétion | Pourcentage d'issues terminées sur le total d'issues du cycle |
| Issues bloquées | Issues du cycle marquées comme bloquées dans Linear |
| Statut de synchronisation | Indicateur montrant quand la dernière synchronisation a eu lieu et quand la prochaine est prévue |

## Implementation

- **Bounded Context** : Analytics
- **Use Case** : `GetWorkspaceDashboardUsecase` — agrège KPIs par équipe (complétion, vélocité, issues bloquées)
- **Presenter** : `WorkspaceDashboardPresenter` — formate les données brutes en DTO affichable
- **Controller** : `WorkspaceDashboardController` — `GET /dashboard` (HTML SSR) + `GET /dashboard/data` (JSON API)
- **Gateway** : `WorkspaceDashboardDataGateway` (port) / `WorkspaceDashboardDataInPrismaGateway` (adapter)
- **Migration** : `add-updated-at-to-sync-progress` — ajout `updatedAt` sur `SyncProgress`

### Decisions architecturales
- Tendance vélocité : seuil 10% — comparaison cycle actif vs moyenne des 3 derniers cycles terminés
- Issues bloquées : statusName contenant "blocked" (case-insensitive)
- Lien rapport : redirige vers `/cycle-report?teamId=xxx` (rapports générés à la volée)
- Prochaine synchronisation : affiche "Synchronisation manuelle" (pas de scheduler)
