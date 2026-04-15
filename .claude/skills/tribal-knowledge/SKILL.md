---
name: tribal-knowledge
description: "Discover implicit team conventions (tribal knowledge) in a codebase. Spawns parallel sub-agents to analyze 6 axes: naming, error handling, testing, architecture, git workflow, and code idioms. Generates a structured report in docs/tribal-knowledge/."
triggers:
  - "tribal.*knowledge"
  - "savoir.*tribal"
  - "conventions.*implicites"
  - "implicit.*rules"
  - "team.*conventions"
  - "regles.*implicites"
---

# Tribal Knowledge Discovery

Decouvre les conventions implicites d'une equipe en scannant le codebase et l'historique git. Produit un rapport structure avec niveaux de confiance.

## Activation

- `/tribal-knowledge`
- `/tribal-knowledge backend/src/modules/shipping`
- "find the tribal knowledge in this project"
- "quelles sont les conventions implicites ?"

## Input

- **Scope** (optionnel) : chemin a analyser. Par defaut : racine du projet.

## Workflow

### Step 1: Determine le scope

Extraire le scope du message utilisateur. Si aucun scope, utiliser la racine du projet.

Verifier que le chemin existe avec `LS`.

### Step 2: Spawn les 6 analyseurs en parallele

Spawner **6 agents `general-purpose`** en parallele (un par axe).

Utiliser `model: "sonnet"` et inclure les instructions de `.claude/agents/tribal-knowledge-analyzer.md` dans chaque prompt, avec le focus specifique.

Les 6 prompts :

**Agent 1 — Naming:**
```
Focus: naming
Scope: <scope>

Analyse les conventions de nommage implicites : fichiers, fonctions, variables, classes, types.
```

**Agent 2 — Error Handling:**
```
Focus: error-handling
Scope: <scope>

Analyse les patterns de gestion d'erreur : strategies, hierarchie, propagation, messages.
```

**Agent 3 — Testing:**
```
Focus: testing
Scope: <scope>

Analyse les pratiques de test implicites : structure, nommage, setup, mocking, couverture.
```

**Agent 4 — Architecture:**
```
Focus: architecture
Scope: <scope>

Analyse les patterns architecturaux implicites : structure, imports, dependances, colocation.
```

**Agent 5 — Git:**
```
Focus: git
Scope: <scope>

Analyse les conventions git : messages de commit, branches, merge strategy, workflow.
```

**Agent 6 — Idioms:**
```
Focus: idioms
Scope: <scope>

Analyse les idiomes de code recurrents : style, composition, null handling, librairies, workarounds.
```

### Step 3: Assembler le rapport

Collecter les resultats des 6 agents. Assembler dans ce format :

```markdown
# Rapport de Savoir Tribal — [Nom du Projet]

> Genere le [date] | Scope : [scope ou "global"]
> Methode : analyse de [N] fichiers + [N] commits

---

## Resume Executif

Les [X] conventions implicites les plus impactantes :

1. **[Convention]** — [Description courte] _(confiance: forte)_
2. ...

---

## 1. Conventions de Nommage

[Resultats de l'Agent 1 — coller tel quel]

## 2. Gestion des Erreurs

[Resultats de l'Agent 2]

## 3. Pratiques de Test

[Resultats de l'Agent 3]

## 4. Patterns Architecturaux

[Resultats de l'Agent 4]

## 5. Conventions Git & Workflow

[Resultats de l'Agent 5]

## 6. Idiomes de Code

[Resultats de l'Agent 6]

---

## Recommandations

Conventions suffisamment fortes pour etre documentees :

| Convention | Axe | Confiance | Action suggeree |
|-----------|-----|-----------|-----------------|
| [Convention] | [Axe] | Forte/Probable | Documenter dans CLAUDE.md / README / linter rule |
```

**Le Resume Executif est la seule section que TU rediges.** Les sections 1-6 sont les resultats bruts des agents.

Pour le Resume Executif :
1. Parcourir toutes les conventions "fortes" (>80%) des 6 agents
2. Selectionner les 5-8 plus impactantes (celles qui affecteraient le plus un nouveau developpeur)
3. Les classer par impact

### Step 4: Sauvegarder

Determiner le nom du projet a partir du dossier racine.

Sauvegarder dans `docs/tribal-knowledge/<project-name>.md`.

Si le dossier `docs/tribal-knowledge/` n'existe pas, le creer.

### Step 5: Presenter

Afficher le rapport complet tel quel.

Terminer par :

```
Rapport sauvegarde dans docs/tribal-knowledge/<project-name>.md

Prochaines etapes possibles :
- Documenter les conventions fortes dans CLAUDE.md ou le README
- Ajouter des regles de linter pour les conventions automatisables
- Discuter les conventions "probables" avec l'equipe
```

## Rules

- ALWAYS spawn the 6 agents in parallel — never sequentially
- NEVER invent conventions — every finding must come from the agents
- NEVER summarize or rephrase agent results in sections 1-6 — paste as-is
- The Executive Summary is the ONLY section you write yourself
- If an agent returns empty results for an axis, note "No implicit convention detected" for that section
- Output language: English

## Error Handling

| Situation | Action |
|-----------|--------|
| Scope path does not exist | Signal and ask user to correct |
| Agent returns error | Note the failure in the report, continue with other axes |
| Very small codebase (<10 files) | Warn that results may be unreliable due to small sample size |
| No git history | Skip the Git axis, note in the report |

## Invocation Examples

```
/tribal-knowledge
/tribal-knowledge backend/src/modules/analytics
/tribal-knowledge backend/src/
```
