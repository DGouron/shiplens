# Investigation : Métriques de cycle incorrectes

## Date : 2026-04-03

## Constat

Les métriques affichées par Shiplens ne correspondent pas aux données Linear.

### Cycle 4 (Produit) — Completed

| Métrique | Linear | Shiplens |
|----------|--------|----------|
| Success rate | 64% | 0% |
| Completed | 144 | ? |
| Scope | 246 | ? |
| Throughput | — | 47 |

### Cycle 5 (Produit) — Actif

| Métrique | Linear | Shiplens |
|----------|--------|----------|
| Scope | 173 | 50 |
| Completed | 8 (5%) | ~4% |

## Bugs identifiés à investiguer

### 1. Complétion à 0% sur cycles terminés
Le calcul de complétion filtre `statusName === 'done'` (case-insensitive). Linear a peut-être d'autres statuts finaux (Completed, Cancelled, etc.). À vérifier : quels `statusName` existent en base pour les issues du Cycle 4.

### 2. Scope très inférieur à Linear
Cycle 5 : 50 issues en base vs 173 dans Linear. La query GraphQL de sync pagine les issues mais le cycle stocke `issueExternalIds` au moment de la sync — si des issues sont ajoutées après, elles ne sont pas dans le cycle.

### 3. Cycles archivés non pris en compte
Le sélecteur de cycles ne montre pas les cycles archivés. Linear peut avoir des cycles archivés avec des données valides.

### 4. Cycle name null
Corrigé : Linear utilise `number` et non `name` pour les cycles. Fix appliqué mais nécessite une resync pour peupler les noms.

### 5. Lead time non formaté
`2.5556056215524032 jours` affiché brut au lieu d'un arrondi.

## Prochaine étape

Lancer `/debug-workflow` pour :
1. Comparer les données brutes en base vs Linear API pour un cycle donné
2. Identifier les écarts de périmètre (issues manquantes, statuts différents)
3. Corriger les calculs de métriques
