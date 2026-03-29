# Consulter la page rapport d'un cycle

## Contexte
Le tech lead veut plonger dans le détail d'un cycle précis pour comprendre ce qui s'est passé, partager les résultats avec ses stakeholders et identifier les axes d'amélioration. Aujourd'hui, ces informations sont éparpillées entre Linear, des tableurs et des notes manuelles. Shiplens centralise tout sur une page dédiée par cycle.

## Rules
- L'utilisateur peut sélectionner n'importe quel cycle passé ou actif de l'équipe via un sélecteur
- Le rapport généré par l'IA est affiché en premier, en haut de page
- Les métriques détaillées sont affichées sous le rapport : vélocité, cycle time, scope creep, taux de complétion
- La liste complète des issues du cycle est affichée avec le statut final de chaque issue
- Un graphique de progression montre l'avancement au fil du temps sur le cycle
- L'utilisateur peut exporter le rapport en Markdown ou le copier dans le presse-papier
- Le sélecteur de cycle affiche les cycles du plus récent au plus ancien

## Scenarios
- page nominale: {équipe sélectionnée, cycle passé avec rapport généré, 40 issues} → rapport IA affiché + métriques (vélocité, cycle time, scope creep, taux de complétion) + liste des 40 issues avec statuts + graphique de progression
- changement de cycle: {page affichée, sélection d'un autre cycle} → contenu mis à jour avec les données du nouveau cycle sélectionné
- cycle sans rapport: {cycle sélectionné, aucun rapport généré} → section rapport vide avec mention "Aucun rapport généré pour ce cycle" + métriques et issues affichées normalement
- export markdown: {rapport affiché, clic export Markdown} → fichier Markdown téléchargé contenant le rapport
- copie presse-papier: {rapport affiché, clic copier} → contenu du rapport copié dans le presse-papier + confirmation "Rapport copié"
- cycle actif en cours: {cycle actif sélectionné, données partielles} → métriques affichées avec mention "Cycle en cours" + graphique de progression partiel
- cycle sans issues: {cycle sélectionné, 0 issue} → métriques à zéro + liste vide avec mention "Aucune issue dans ce cycle"
- données non synchronisées: {cycle sélectionné, données non synchronisées} → reject "Les données de ce cycle ne sont pas encore synchronisées. Veuillez lancer la synchronisation."
- export sans rapport: {aucun rapport généré, clic export} → reject "Aucun rapport à exporter. Veuillez d'abord générer un rapport pour ce cycle."
- scope creep élevé: {cycle avec plus de 30% d'issues ajoutées après le début} → métrique scope creep affichée en alerte

## Hors scope
- Comparaison côte à côte de deux cycles
- Modification du rapport généré par l'IA
- Export en PDF ou autres formats que Markdown
- Ajout ou suppression d'issues depuis cette page
- Génération du rapport depuis cette page (couvert par la spec de génération de rapport)
- Envoi automatique du rapport par email ou notification

## Glossaire
| Terme | Définition |
|-------|------------|
| Cycle | Période de travail définie pour une équipe (équivalent de sprint dans Linear) |
| Rapport IA | Document structuré généré automatiquement résumant l'activité du cycle |
| Vélocité | Volume de travail accompli pendant le cycle |
| Cycle time | Durée moyenne entre le début et la fin du travail sur une issue |
| Scope creep | Pourcentage d'issues ajoutées au cycle après son démarrage |
| Taux de complétion | Pourcentage d'issues terminées sur le total d'issues du cycle |
| Graphique de progression | Visualisation de l'avancement du cycle au fil du temps |
| Statut final | État d'une issue à la clôture du cycle (terminée, en cours, bloquée, annulée) |
