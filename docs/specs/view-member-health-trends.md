# Voir les tendances de sante d'un membre

## Status: ready

## Contexte
Les outils de gestion de projet montrent ce qui est fait, pas comment ca se passe. Un developpeur qui sous-estime systematiquement, dont les PRs trainent en review ou dont le cycle time derive cycle apres cycle envoie des signaux invisibles sur Linear. Le tech lead a besoin de ces signaux pour intervenir avant que les problemes ne s'installent.

## Rules
- Le tableau de sante d'un membre affiche 5 signaux calcules sur les N derniers cycles termines
- Signal 1 — Evolution du score d'estimation : tendance hausse/baisse/stable du score de precision
- Signal 2 — Ratio de sous-estimation : pourcentage d'issues sous-estimees par cycle, avec tendance
- Signal 3 — Cycle time moyen : evolution du temps moyen de traitement par cycle, avec tendance
- Signal 4 — Tickets en derive par cycle : nombre de tickets ayant depasse la duree attendue, avec tendance
- Signal 5 — Temps median en review : evolution du temps passe en review par cycle, avec tendance
- Chaque signal affiche la valeur du dernier cycle, la tendance sur N cycles (hausse/baisse/stable) et un indicateur visuel de sante (vert/orange/rouge)
- La tendance est calculee a partir d'un minimum de 3 cycles termines
- Si moins de 3 cycles sont disponibles, le signal affiche la valeur brute sans tendance avec la mention "Pas assez d'historique"
- Un signal est vert si la tendance est favorable (score estimation en hausse, sous-estimation en baisse, cycle time en baisse, derives en baisse, temps review en baisse)
- Un signal est rouge si la tendance est defavorable depuis 2 cycles consecutifs ou plus
- Un signal est orange dans les autres cas (tendance mixte ou premier ecart)
- Le tableau de sante est accessible depuis le profil cycle du membre (spec view-member-cycle-profile)

## Scenarios
- sante nominale: {Alice, 4 cycles termines, score estimation 60% -> 65% -> 70% -> 75%} -> signal estimation vert + tendance hausse + valeur "75%"
- sous-estimation chronique: {Bob, 3 cycles, ratio sous-estimation 40% -> 45% -> 50%} -> signal sous-estimation rouge + tendance hausse + valeur "50%"
- cycle time qui derive: {Alice, 3 cycles, cycle time moyen 1.2j -> 1.5j -> 2.1j} -> signal cycle time rouge + tendance hausse + valeur "2.1j"
- review qui traine: {Charlie, 3 cycles, temps median review 8h -> 12h -> 24h} -> signal review rouge + tendance hausse + valeur "24h"
- amelioration derives: {Alice, 3 cycles, tickets en derive 4 -> 2 -> 1} -> signal derive vert + tendance baisse + valeur "1"
- tendance mixte: {Bob, 4 cycles, cycle time 1.5j -> 2j -> 1.2j -> 1.8j} -> signal cycle time orange + tendance mixte
- historique insuffisant: {nouveau membre, 1 cycle termine} -> 5 signaux affiches avec valeur brute + "Pas assez d'historique"
- aucun cycle termine: {membre sans historique} -> tableau affiche "Aucune donnee disponible pour ce membre"
- membre sans issue estimee: {Charlie, 3 cycles, aucune issue avec points} -> signal estimation et sous-estimation affiches "Non applicable" + autres signaux calcules normalement

## Hors scope
- Graphique temporel multi-courbes (exploration visuelle)
- Comparaison entre membres
- Recommandations automatiques basees sur les signaux
- Alertes ou notifications sur degradation de sante
- Signaux au niveau equipe (uniquement par membre)

## Glossaire
| Terme | Definition |
|-------|------------|
| Signal de sante | Indicateur calcule sur N cycles revelant une tendance positive ou negative dans le travail d'un membre |
| Tendance | Direction d'evolution d'un signal sur les derniers cycles : hausse, baisse ou stable |
| Indicateur de sante | Code couleur (vert/orange/rouge) synthetisant si la tendance est favorable, mixte ou defavorable |
| Derive | Ticket dont le temps reel de traitement depasse la duree attendue selon son estimation (cf. spec detect-drifting-issues) |
