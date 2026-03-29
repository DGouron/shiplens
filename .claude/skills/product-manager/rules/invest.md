# Criteres INVEST

Chaque spec doit passer les 6 criteres INVEST avant d'etre consideree prete.

| Critere | Question | Seuil |
|---------|----------|-------|
| **I** — Independent | Cette spec peut-elle etre implementee sans dependre d'une autre en cours ? | Oui = OK |
| **N** — Negotiable | Le "comment" est-il libre ? Seul le "quoi" est fixe ? | Pas de code impose = OK |
| **V** — Valuable | L'utilisateur final tire-t-il un benefice direct ? | Benefice identifiable = OK |
| **E** — Estimable | Peut-on estimer la complexite sans ambiguite ? | Pas de zone grise = OK |
| **S** — Small | Implementable en 1-3 sessions TDD ? | Moins de 15 fichiers = OK |
| **T** — Testable | Chaque rule a-t-elle un scenario associe ? | 100% couvert = OK |

## Comment evaluer

Pour chaque critere, repondre par :
- **OK** : le critere est satisfait
- **WARN** : le critere est limite, a surveiller
- **KO** : le critere n'est pas satisfait — bloquer et corriger

## Resultat attendu

```
Evaluation INVEST :
  I — Independent : OK
  N — Negotiable  : OK
  V — Valuable    : OK
  E — Estimable   : WARN — le scope du calcul de prix n'est pas clair
  S — Small       : OK
  T — Testable    : OK

Verdict : PRET (ou BLOQUER si un KO)
```

Un seul **KO** = la spec retourne en clarification.
