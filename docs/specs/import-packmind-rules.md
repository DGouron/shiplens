# Importer des pratiques Packmind comme règles d'audit

## Status: implemented

## Contexte
Le tech lead qui utilise déjà Packmind pour documenter les pratiques de son équipe ne veut pas les ressaisir dans Shiplens. La synchronisation permet d'exploiter le travail existant dans Packmind et de le transformer en règles d'audit évaluables automatiquement.

## Rules
- La connexion à Packmind nécessite un token d'authentification configurable
- Chaque pratique Packmind mesurable est convertie en règle d'audit Shiplens avec identifiant, nom, sévérité et condition
- Les pratiques Packmind qualitatives (non mesurables) sont incluses comme éléments de checklist dans le rapport, sans évaluation automatique
- La synchronisation est déclenchée manuellement uniquement
- Si Packmind est injoignable, les règles précédemment synchronisées restent utilisables
- Les règles importées depuis Packmind sont identifiées par leur origine pour les distinguer des règles manuelles
- Une resynchronisation met à jour les règles existantes et ajoute les nouvelles, sans supprimer celles qui ont disparu côté Packmind

## Scenarios
- synchronisation nominale: {token valide, 5 pratiques Packmind dont 3 mesurables et 2 qualitatives} → 3 règles d'audit créées + 2 éléments de checklist ajoutés + origine "Packmind" marquée
- pratique mesurable convertie: {pratique Packmind "PR review sous 24h", mesurable} → règle d'audit avec condition "délai de review > 24 heures"
- pratique qualitative conservée: {pratique Packmind "Écrire des messages de commit clairs", non mesurable} → élément de checklist dans le rapport + pas d'évaluation automatique
- resynchronisation avec nouvelles pratiques: {3 règles existantes, 5 pratiques Packmind après ajout} → 2 nouvelles règles ajoutées + 3 existantes mises à jour
- Packmind injoignable: {token valide, Packmind indisponible, 3 règles en cache} → 3 règles en cache utilisées + avertissement "Packmind est injoignable. Les règles en cache sont utilisées."
- token invalide: {token expiré ou incorrect} → reject "Le token Packmind est invalide. Veuillez vérifier votre configuration."
- token absent: {aucun token configuré} → reject "Aucun token Packmind configuré. Veuillez renseigner votre token d'authentification."
- aucune pratique disponible: {token valide, Packmind joignable, aucune pratique définie} → reject "Aucune pratique trouvée dans votre espace Packmind."
- première synchronisation sans cache et Packmind injoignable: {token valide, Packmind indisponible, aucune règle en cache} → reject "Packmind est injoignable et aucune règle n'a été synchronisée précédemment."

## Hors scope
- Synchronisation automatique ou planifiée
- Écriture vers Packmind (lecture seule)
- Gestion des conflits entre une règle manuelle et une règle Packmind ayant le même identifiant
- Configuration avancée du mapping de conversion

## Implementation

### Bounded Context
`audit` — module existant (`src/modules/audit/`)

### Artefacts
- **Entity modifiee** : `AuditRule` — ajout champ `origin` (`'manual' | 'packmind'`, default `'manual'`)
- **Nouvelle entity** : `ChecklistItem` — pratiques qualitatives avec `identifier`, `name`, `origin`
- **Type** : `PackmindPractice` — representation des pratiques Packmind (plain type, pas une entity)
- **Use Case** : `SyncPackmindRulesUsecase` — orchestre la synchronisation manuelle
- **Gateway port** : `PackmindGateway` (abstract class) — fetchPractices(token)
- **Gateway port** : `ChecklistItemGateway` (abstract class) — save, findAll
- **Gateway impl** : `PackmindInHttpGateway` — appels HTTP vers l'API Packmind
- **Gateway impl** : `ChecklistItemInFilesystemGateway` — stockage JSON fichier
- **Gateway modifiee** : `AuditRuleInFilesystemGateway` — serialisation origin + findAllByOrigin
- **Presenter** : `SyncPackmindRulesPresenter` — SyncResult vers ViewModel
- **Controller** : `SyncPackmindRulesController` — `POST /audit/sync-packmind`

### Endpoint
| Methode | Route | Use Case |
|---------|-------|----------|
| POST | `/audit/sync-packmind` | `SyncPackmindRulesUsecase` |

### Decisions architecturales
- Origin ajoute comme champ optionnel sur AuditRule (backward compatible, default 'manual')
- ChecklistItem est une entity separee (pas un AuditRule sans condition)
- PackmindPractice est un plain type (pas d'invariants metier a proteger)
- Token passe dans le body de la requete (pas d'env var)
- Stockage fichier JSON (pas Prisma) — coherent avec le module audit existant
- Cache = regles deja persistees sur le filesystem (pas de cache explicite)

## Glossaire
| Terme | Définition |
|-------|------------|
| Packmind | Outil collaboratif de documentation des pratiques d'équipe |
| Pratique mesurable | Pratique Packmind qui peut être traduite en condition vérifiable sur des métriques |
| Pratique qualitative | Pratique Packmind descriptive, non traduisible en condition automatique |
| Checklist | Liste de pratiques qualitatives incluses dans le rapport pour vérification manuelle |
| Cache | Dernière version des règles synchronisées, utilisée en cas d'indisponibilité de Packmind |
| Synchronisation | Import des pratiques Packmind et conversion en règles d'audit Shiplens |
