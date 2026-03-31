# Exporter et consulter les rapports de sprint

## Status: implemented

## Contexte
Une fois le rapport de sprint généré, le tech lead a besoin de le partager facilement avec ses stakeholders via Slack, Notion ou email. Il doit aussi pouvoir retrouver les rapports passés pour suivre l'évolution de son équipe dans le temps.

## Rules
- Le rapport est consultable directement dans le dashboard web de Shiplens
- Le rapport peut être copié en Markdown ou en texte brut en un clic
- Tous les rapports générés sont conservés et consultables dans un historique
- L'historique affiche les rapports du plus récent au plus ancien
- Un rapport appartient à un sprint précis et à une équipe précise

## Scenarios
- affichage dans le dashboard: {rapport généré pour le sprint 12} → rapport affiché dans le dashboard avec son contenu complet
- copie en Markdown: {rapport affiché, clic "Copier en Markdown"} → contenu Markdown dans le presse-papier + confirmation "Rapport copié en Markdown"
- copie en texte brut: {rapport affiché, clic "Copier en texte brut"} → contenu texte brut dans le presse-papier + confirmation "Rapport copié en texte brut"
- consultation de l'historique: {3 rapports générés pour l'équipe} → liste des 3 rapports triés du plus récent au plus ancien
- aucun rapport dans l'historique: {équipe sans rapport généré} → message "Aucun rapport n'a encore été généré pour cette équipe."
- ouverture d'un rapport depuis l'historique: {clic sur un rapport passé} → rapport affiché avec son contenu complet
- presse-papier indisponible: {navigateur bloque l'accès au presse-papier} → reject "Impossible de copier dans le presse-papier. Vérifiez les permissions de votre navigateur."

## Hors scope
- Export en PDF
- Envoi automatique par email ou Slack
- Suppression ou archivage de rapports
- Comparaison côte à côte de plusieurs rapports
- Édition du rapport après génération

## Glossaire
| Terme | Définition |
|-------|------------|
| Rapport de sprint | Document structuré résumant l'activité, la santé et les tendances d'un sprint |
| Dashboard | Interface web principale de Shiplens où l'utilisateur consulte ses données |
| Historique des rapports | Liste chronologique de tous les rapports générés pour une équipe |
| Markdown | Format de texte enrichi utilisé dans des outils comme Notion, GitHub ou Slack |
| Texte brut | Version du rapport sans aucun formatage, utilisable dans un email ou n'importe quel outil |

## Implementation

### Bounded Context
Analytics (existant)

### Artefacts
- **Entity** : SprintReport (évolution — ajout id, generatedAt)
- **Gateway port** : SprintReportGateway (save, findByTeamId, findById)
- **Gateway impl** : SprintReportInPrismaGateway
- **Use cases** : ListTeamReportsUsecase, GetReportUsecase, GenerateSprintReportUsecase (évolution — ajout save)
- **Presenters** : ReportHistoryPresenter, ReportDetailPresenter
- **Controller** : ReportExportController
- **Migration** : add-sprint-report-model (modèle Prisma SprintReport)

### Endpoints
| Méthode | Route | Use Case |
|---------|-------|----------|
| GET | /analytics/teams/:teamId/reports | ListTeamReportsUsecase |
| GET | /analytics/reports/:reportId | GetReportUsecase |

### Décisions architecturales
- Deux gateways distincts : SprintReportDataGateway (données pour générer) vs SprintReportGateway (persister/lire)
- Markdown et plain text rendus dans le presenter (ReportDetailPresenter), pas dans le domaine
- Scénarios clipboard = frontend pur — le backend fournit les deux formats via le DTO
- Controller séparé (ReportExportController) pour les GET endpoints, distinct du SprintReportController existant
