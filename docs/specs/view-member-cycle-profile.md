# Voir le profil cycle d'un membre

## Status: ready

## Contexte
Le tech lead pilote son cycle avec des donnees equipe, mais n'a aucune visibilite individuelle. Pour comprendre ce que fait un membre, ce qui le bloque et s'il estime correctement, il doit ouvrir chaque issue dans Linear. Il a besoin d'une vue synthetique par membre directement dans le rapport de cycle.

## Rules
- Un filtre membre (dropdown) s'ajoute dans la page rapport de cycle, a cote du selecteur de cycle
- La liste des membres se derive des assignees presents dans le cycle selectionne
- Par defaut aucun membre n'est selectionne — les sections affichent les donnees equipe
- Quand un membre est selectionne, les sections de pilotage se filtrent sur ce membre uniquement
- La section goulots affiche le temps median par statut du membre selectionne (extrait du breakdown assignee)
- La section issues bloquees affiche uniquement les alertes concernant les issues assignees au membre selectionne
- La section estimation affiche le score de precision du membre selectionne et ses sur/sous-estimations
- Des metriques individuelles s'affichent : nombre d'issues en cours, bloquees, terminees et points completes sur le cycle
- Une section digest IA apparait uniquement quand un membre est selectionne
- Le digest resume en langage naturel les issues en cours du membre, ses blocages eventuels et le temps passe dans chaque statut
- Le digest est genere a la demande via un bouton (pas automatiquement a la selection du membre)
- Le digest utilise la meme infrastructure IA que le rapport de sprint (AiTextGeneratorGateway)

## Scenarios
- selection membre: {dropdown, 3 assignees dans le cycle} -> liste Alice, Bob, Charlie
- filtrage metriques: {Alice selectionnee, 4 issues dont 2 terminees, 1 en cours, 1 bloquee} -> metriques affichees : 1 en cours, 1 bloquee, 2 terminees + points completes
- filtrage goulots: {Alice selectionnee} -> temps median par statut d'Alice uniquement
- filtrage issues bloquees: {Alice selectionnee, 1 alerte sur son issue} -> seule l'alerte d'Alice affichee
- filtrage estimation: {Alice selectionnee, score 72%} -> score Alice + 2 sur-estimations, 1 sous-estimation
- retour vue equipe: {deselection du membre (option "Toute l'equipe")} -> sections reviennent aux donnees equipe agregees
- digest nominal: {Alice selectionnee, clic "Generer le digest", 3 issues en cours} -> resume IA : "Alice travaille sur X, bloquee sur Y depuis 2 jours, Z en review"
- aucune issue en cours: {Bob selectionne, 0 issue en cours} -> digest affiche "Aucune issue en cours pour ce membre"
- membre sans issue: {Charlie selectionne, 0 issue sur le cycle} -> metriques a zero + digest non disponible
- erreur generation digest: {API IA indisponible} -> message "Le digest n'a pas pu etre genere" + metriques restent visibles

## Hors scope
- Historique du membre sur plusieurs cycles (spec historique velocite separee)
- Tickets "bouillants" avec bouton investiguer (Github/Gitlab)
- Comparaison entre membres
- Photo ou avatar du membre
- Persistence du digest en base (genere a la volee)

## Glossaire
| Terme | Definition |
|-------|------------|
| Profil cycle | Vue synthetique des metriques et du travail d'un membre sur un cycle donne |
| Digest | Resume en langage naturel du travail en cours d'un membre, genere par IA |
| Filtre membre | Dropdown permettant de restreindre les donnees de la page a un seul assignee |
