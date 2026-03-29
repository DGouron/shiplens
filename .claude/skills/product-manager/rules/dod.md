# Definition of Done (DoD)

Une feature est "done" quand elle satisfait TOUS les criteres suivants :

## Checklist

- [ ] **Tous les scenarios de la spec couverts** par des tests qui passent
- [ ] **TDD respecte** : chaque comportement a un test ecrit AVANT le code
- [ ] **Tests verts** : `pnpm test` passe sans erreur
- [ ] **Zero violation architecture** : dependency rule respectee
- [ ] **Zero `any`, `as`, `!`** dans le code
- [ ] **Noms complets** : pas d'abreviations
- [ ] **Messages d'erreur en francais** pour l'utilisateur final
- [ ] **Tests en anglais**
- [ ] **Migration Prisma** si schema modifie (backup fait avant)
- [ ] **Code review** : self-review ou pair-review effectuee

## Regles

- Une feature non-done ne doit PAS etre livree
- Si un critere echoue, corriger avant de declarer "done"
- Le DoD est un contrat qualite, pas une suggestion
