# DSL de Spec Shiplens

## Pourquoi un DSL custom

- Meilleur ratio signal/tokens que Gherkin (~40% plus compact)
- Pas de binding layer (Cucumber) necessaire
- Directement traduisible en test sans ambiguite
- Lisible humain ET parsable agent

## Structure d'un scenario

```
- <label>: {<inputs>} → <outputs>
```

- **label** : nom court du scenario (ex: `valid`, `no recipient`, `weight exceeds limit`)
- **inputs** : donnees d'entree en notation objet
- **outputs** : resultat attendu (statut, valeur retournee, erreur)

## Conventions

- `→ reject "message"` : le systeme refuse avec ce message d'erreur (en francais)
- `→ status "<value>"` : l'entite resultante a ce statut
- `→ <property> "<value>"` : l'entite resultante a cette propriete
- `+` pour combiner plusieurs sorties : `→ status "pending" + tracking "SL-*"`
- `*` comme wildcard dans les valeurs

## Exemple complet

```markdown
# Creer un envoi

## Contexte
L'expediteur doit pouvoir creer un envoi avec un destinataire et un colis.

## Rules
- envoi requires: adresse expediteur, adresse destinataire, poids colis
- nouvel envoi status: "pending"
- numero de suivi format: "SL-XXXXXXXX"
- destinataire est obligatoire
- poids max: 30kg

## Scenarios
- valid: {expediteur: "123 Rue A", destinataire: "456 Rue B", poids: 2.5kg} → status "pending" + tracking "SL-*"
- no recipient: {expediteur: "123 Rue A"} → reject "Le destinataire est obligatoire"
- overweight: {expediteur: "123 Rue A", destinataire: "456 Rue B", poids: 35kg} → reject "Le poids ne peut pas depasser 30kg"

## Hors scope
- Calcul du prix de l'envoi
- Choix du transporteur
```

## Regles

- **Rules** = invariants metier (ce que le business-rules-extractor retrouvera dans le code)
- **Scenarios** = exemples concrets (ce que les tests verifieront)
- Un scenario = un comportement. Pas de mega-scenarios
- Minimum 1 nominal + 1 edge case
- Messages d'erreur toujours en francais
- Pas de jargon technique dans les rules ni scenarios
