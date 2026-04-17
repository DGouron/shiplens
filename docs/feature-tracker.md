# Feature Tracker

Specs are organized by bounded context under `docs/specs/<bc>/`. Cross-cutting concerns (infrastructure, migration, design system) live in `docs/specs/_platform/`.

| Feature | Spec | BC | Status | Date |
|---------|------|----|--------|------|
| Connecter son workspace Linear | [connect-linear-workspace](specs/identity/connect-linear-workspace.md) | Identity | implemented | 2026-03-30 |
| Selectionner les equipes a synchroniser | [select-teams-to-sync](specs/synchronization/select-teams-to-sync.md) | Synchronization | implemented | 2026-03-30 |
| Synchroniser les donnees de reference | [sync-linear-reference-data](specs/synchronization/sync-linear-reference-data.md) | Synchronization | implemented | 2026-03-30 |
| Synchroniser les issues et cycles | [sync-linear-data](specs/synchronization/sync-linear-data.md) | Synchronization | implemented | 2026-03-31 |
| Synchroniser en temps reel | [sync-linear-realtime](specs/synchronization/sync-linear-realtime.md) | Synchronization | implemented | 2026-03-31 |
| Feedback de sync en temps reel | [sync-realtime-feedback](specs/synchronization/sync-realtime-feedback.md) | Synchronization | implemented | 2026-03-31 |
| Calculer les metriques d'un cycle | [calculate-cycle-metrics](specs/analytics/calculate-cycle-metrics.md) | Analytics | implemented | 2026-03-31 |
| Generer un rapport de sprint AI | [generate-sprint-report](specs/analytics/generate-sprint-report.md) | Analytics | implemented | 2026-03-31 |
| Exporter un rapport de sprint | [export-sprint-report](specs/analytics/export-sprint-report.md) | Analytics | implemented | 2026-03-31 |
| Detecter les issues bloquees | [detect-blocked-issues](specs/analytics/detect-blocked-issues.md) | Analytics | implemented | 2026-03-31 |
| Analyser les goulots par statut | [analyze-bottlenecks-by-status](specs/analytics/analyze-bottlenecks-by-status.md) | Analytics | implemented | 2026-03-31 |
| Comparer estimations vs realite | [track-estimation-accuracy](specs/analytics/track-estimation-accuracy.md) | Analytics | implemented | 2026-04-01 |
| Predire la duree d'une issue | [predict-issue-duration](specs/analytics/predict-issue-duration.md) | Analytics | implemented | 2026-04-01 |
| Definir des regles d'audit custom | [define-custom-audit-rules](specs/audit/define-custom-audit-rules.md) | Audit | implemented | 2026-04-01 |
| Importer des regles depuis Packmind | [import-packmind-rules](specs/audit/import-packmind-rules.md) | Audit | implemented | 2026-04-01 |
| Evaluer les regles dans le rapport | [audit-rules-in-report](specs/analytics/audit-rules-in-report.md) | Analytics | implemented | 2026-04-01 |
| Notifier le rapport sur Slack | [notify-report-on-slack](specs/notification/notify-report-on-slack.md) | Notification | implemented | 2026-04-01 |
| Alerter sur les bottlenecks | [alert-bottleneck-realtime](specs/notification/alert-bottleneck-realtime.md) | Notification | implemented | 2026-04-01 |
| Consulter le dashboard workspace | [view-workspace-dashboard](specs/analytics/view-workspace-dashboard.md) | Analytics | implemented | 2026-03-31 |
| Voir le rapport de cycle detaille | [view-cycle-report-page](specs/analytics/view-cycle-report-page.md) | Analytics | implemented | 2026-03-31 |
| Afficher les etats vides du dashboard | [handle-dashboard-empty-states](specs/analytics/handle-dashboard-empty-states.md) | Analytics | implemented | 2026-04-02 |
| Afficher les donnees de pilotage dans le rapport de cycle | [display-cycle-piloting-data](specs/analytics/display-cycle-piloting-data.md) | Analytics | implemented | 2026-04-03 |
| Voir le profil cycle d'un membre | [view-member-cycle-profile](specs/analytics/view-member-cycle-profile.md) | Analytics | implemented | 2026-04-03 |
| Detecter les tickets en derive | [detect-drifting-issues](specs/analytics/detect-drifting-issues.md) | Analytics | implemented | 2026-04-05 |
| Voir les tendances de sante d'un membre | [view-member-health-trends](specs/analytics/view-member-health-trends.md) | Analytics | implemented | 2026-04-06 |
| Definir la langue du workspace | [set-workspace-language](specs/analytics/set-workspace-language.md) | Analytics | implemented | 2026-04-06 |
| Traduire les pages restantes | [translate-remaining-pages](specs/analytics/translate-remaining-pages.md) | Analytics | implemented | 2026-04-07 |
| Unifier la langue du sprint report | [unify-sprint-report-language](specs/analytics/unify-sprint-report-language.md) | Analytics | implemented | 2026-04-07 |
| Migrer le frontend vers React SPA | [migrate-to-react-spa](specs/_platform/migrate-to-react-spa.md) | Platform | planned | 2026-04-09 |
| Scaffolder le projet React SPA | [setup-react-spa](specs/_platform/setup-react-spa.md) | Platform | implemented | 2026-04-10 |
| Extraire le design system | [extract-design-system](specs/_platform/extract-design-system.md) | Platform | implemented | 2026-04-10 |
| Ameliorations design UX et data viz | [design-improvements](specs/_platform/design-improvements.md) | Platform | planned | 2026-04-09 |
| Migrer la page dashboard | [migrate-dashboard-page](specs/analytics/migrate-dashboard-page.md) | Analytics | implemented | 2026-04-15 |
| Migrer la page cycle report | [migrate-cycle-report-page](specs/analytics/migrate-cycle-report-page.md) | Analytics | implemented | 2026-04-16 |
| Migrer la page health trends | [migrate-member-health-trends-page](specs/analytics/migrate-member-health-trends-page.md) | Analytics | implemented | 2026-04-16 |
| Migrer la page settings + cleanup backend | [migrate-settings-page](specs/analytics/migrate-settings-page.md) | Analytics | implemented | 2026-04-16 |
| Auto-detecter les statuts workflow d'une equipe | [auto-detect-team-workflow-statuses](specs/analytics/auto-detect-team-workflow-statuses.md) | Analytics | implemented | 2026-04-16 |
| Configurer les statuts workflow d'une equipe | [configure-workflow-statuses-ui](specs/analytics/configure-workflow-statuses-ui.md) | Analytics | implemented | 2026-04-17 |
| Selectionner une team sur le dashboard | [select-team-on-dashboard](specs/analytics/select-team-on-dashboard.md) | Analytics | ready | 2026-04-17 |
| Afficher le top 5 des projets du cycle | [show-top-cycle-projects](specs/analytics/show-top-cycle-projects.md) | Analytics | ready | 2026-04-17 |
| Afficher le top 5 des epics du cycle | [show-top-cycle-epics](specs/analytics/show-top-cycle-epics.md) | Analytics | ready | 2026-04-17 |
| Afficher le top 5 des assignees du cycle | [show-top-cycle-assignees](specs/analytics/show-top-cycle-assignees.md) | Analytics | ready | 2026-04-17 |
| Detecter les themes du cycle via IA | [detect-cycle-themes-with-ai](specs/analytics/detect-cycle-themes-with-ai.md) | Analytics | ready | 2026-04-17 |
