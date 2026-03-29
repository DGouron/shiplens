# Definition of Ready (DoR)

Une spec est "ready" quand elle satisfait TOUS les criteres suivants :

## Checklist

- [ ] **Contexte clair** : le probleme utilisateur est explicite
- [ ] **Criteres d'acceptance** : au moins 1 scenario nominal + 1 edge case (format DSL)
- [ ] **Hors scope defini** : ce qu'on ne fait PAS est documente
- [ ] **INVEST valide** : les 6 criteres passes sans KO
- [ ] **Glossaire present** : si termes metier specifiques
- [ ] **Pas de dependance bloquante** : implementable immediatement
- [ ] **Validation utilisateur** : la spec a ete relue et approuvee

## Regles

- Une spec non-ready ne doit PAS etre passee a `/implement-feature`
- Si un critere manque, retourner en phase challenge avec le PM
- Le DoR est un filtre de qualite, pas une formalite
