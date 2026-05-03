# Test Plan Template — Phase 5 (qa-tester)

Template du plan de test produit par l'agent `qa-tester`. À écrire dans `documents/debug/<slug>/04-test-plan.md`.

## Objectifs du plan

1. **Couvrir le bug fixé** par des tests automated qui le verrouillent (régression future = test rouge)
2. **Lister les edge cases** du domaine que les tests pourraient avoir manqué
3. **Fournir une checklist QA manuelle** passable à un humain non-dev (PO, designer, autre dev)
4. **Documenter les régressions à risque** dans les zones connexes du code touché

## Structure obligatoire

```markdown
# Test Plan — <slug>

## Contexte

- **Bug fixé** : <résumé en 1 phrase>
- **Root cause** : <fichier:ligne — mécanisme>
- **Fichiers modifiés** : <liste paths>
- **Tests automated ajoutés en Phase 2-3** : <liste paths>

---

## 1. Couverture automated

### 1.1 Tests existants qui couvrent maintenant le bug

| Test | Path | Type | Note |
|---|---|---|---|
| <nom test 1> | `backend/tests/modules/<bc>/<feature>.bug-<slug>.test.ts` | Vitest | Test failing committé en Phase 2, GREEN après fix |
| <nom test 2> | `tests/e2e/<slug>.spec.ts` | Playwright | E2E sur viewport mobile |

### 1.2 Edge cases à couvrir (recommandés, non bloquants)

Pour chaque edge case, **proposer** un test :

| Edge case | Justification (pourquoi c'est un risque) | Test proposé |
|---|---|---|
| Membre avec `address: null` | Le bug venait d'un null mal géré ; tester aussi `email: null`, `phone: null` | `member.presenter.test.ts` — `should display 'N/A' when address is null` |
| Liste vide | Le presenter peut crasher si la liste est `[]` | `member.list.presenter.test.ts` — `should return empty ViewModel when no members` |
| Liste très longue (>100 items) | Performance / pagination | `tests/e2e/member-list-pagination.spec.ts` — `should paginate when more than 50 members` |
| Permissions différentes (admin standard vs super-admin) | RLS / scope possible | `member.gateway.test.ts` — `should filter by association_id for non-super-admin` |
| Caractères spéciaux dans search (apostrophes, accents) | Encoding URL / SQL injection | `member.search.test.ts` — `should handle special chars in query` |

**Minimum 3 edge cases obligatoires, idéalement 5.**

### 1.3 Coverage rappel

Lister les fichiers modifiés et leur taux de couverture attendu :
- Entité touchée : 100% (logique métier pure)
- Use case touché : 100% (orchestration business)
- Presenter touché : 100% sur la transformation null/undefined
- Hook touché : couvert via test e2e (pas de unit test sur hook)
- View touchée : pas de test (Humble Object)

---

## 2. Checklist QA manuelle

Format : **passable à un humain non-dev**. Steps précis avec URL, viewport, compte.

### 2.1 Cas nominal

- [ ] Ouvrir `https://localhost:3000/admin/members` en desktop (1920x1080)
- [ ] Login : `admin@solife.test` / `<password seed>`
- [ ] Vérifier : la liste des membres s'affiche, aucun message d'erreur
- [ ] Vérifier : 50 membres minimum visibles (pagination si plus)

### 2.2 Cas du bug fixé

- [ ] Ouvrir la même URL en **mobile** (375x667 — DevTools, mode responsive)
- [ ] Login : même compte admin standard (PAS super-admin)
- [ ] Vérifier : la liste des membres s'affiche, aucun message "Une erreur est survenue"
- [ ] Vérifier : un membre avec adresse vide s'affiche correctement (chercher membre `<id-test>`)

### 2.3 Edge cases manuels

- [ ] **Recherche avec apostrophe** : taper `O'Brien` dans la barre de recherche, vérifier qu'aucune erreur n'apparaît
- [ ] **Liste vide** : se connecter avec un compte d'asso sans membre, vérifier le placeholder "Aucun membre"
- [ ] **Bascule mobile/desktop** : redimensionner la fenêtre en cours d'utilisation, vérifier que l'état est conservé

### 2.4 Différents comptes

| Compte | Rôle | Comportement attendu |
|---|---|---|
| `admin@solife.test` | Admin standard | Voit ses membres, pagination OK |
| `super@solife.test` | Super-admin | Voit tous les membres, peut filtrer par association |
| `bureau@solife.test` | Bureau (read-only) | Voit la liste mais boutons d'action désactivés |

### 2.5 Différents browsers (si applicable)

- [ ] Chrome desktop : ✅
- [ ] Safari desktop : ✅
- [ ] Chrome mobile (Android) : ✅
- [ ] Safari mobile (iOS) : ✅ (souvent le plus strict — cookies SameSite, position: sticky, etc.)

---

## 3. Régressions à risque (consommées depuis blast radius)

**Source** : section "Blast radius analysis" de `01-investigation.md`. Cette section du test plan **consomme** ce diagnostic, ne le ré-invente pas.

### 3.1 Direct dependents (HIGH risk par défaut)

Ré-injecter la table Direct dependents du blast radius. Pour chaque path, indiquer :
- Quel test l'a couvert en Phase 2-4 (RED gate ou Proof)
- Quel item manuel le couvre en section 2 (Manual QA checklist)

| Path | Risk | Couverture | Reste à vérifier ? |
|---|---|---|---|
| <path:line direct dependent #1> | HIGH | Vitest <path test> | Non |
| <path direct dependent #2> | MEDIUM | Manual smoke section 2.3 | Oui (cocher) |

### 3.2 Indirect dependents (MEDIUM par défaut)

Identique 3.1 mais pour les indirects.

### 3.3 Sibling patterns (LOW-MEDIUM, risque de régression d'un cousin)

Pattern similaire qui pourrait avoir le même bug latent, à signaler comme follow-up ou à fixer dans le scope :

| Path | Pattern similaire | Action |
|---|---|---|
| <path> | <description> | Follow-up issue OU intégré dans le test plan section 2 |

### 3.4 Public contracts impactés

Si le blast radius a relevé un changement de contrat public (type exporté, hook return shape, API payload, schema Prisma), lister ici les consommateurs externes (autres BCs, mobile app, intégrations API tierces) et la stratégie de migration :

| Contract | Type de changement | Consommateurs | Migration |
|---|---|---|---|
| `MemberViewModel.address` | additive (ajout 'N/A' au lieu de null) | useMemberList, useMemberDetail | Aucune (additif) |

---

## 4. Edge cases du bounded context

À éclairer avec l'**ubiquitous language** du BC (cf. `documents/ubiquitous-language.md` ou `documents/specs/<bc>/`).

Exemples de questions à se poser :
- Y a-t-il une notion d'état (draft, active, archived) qui change le comportement attendu ?
- Y a-t-il des règles métier conditionnelles (ex: "un don > 1000€ exige une validation manuelle") ?
- Y a-t-il des invariants temporels (ex: "un membre ne peut pas être archivé puis réactivé le même jour") ?

Lister 2-3 edge cases métier que le bug pourrait avoir affectés indirectement.

---

## 5. Risques résiduels (si applicable)

Cas explicitement **non couverts** par le fix ou le test plan, à signaler à l'utilisateur :
- Bug similaire potentiel dans `<autre module>` non touché par ce fix
- Données de prod incohérentes qui pourraient déclencher d'autres erreurs (proposer un script de cleanup à part)
- Limite de scope (le fix traite le symptôme, mais une refacto plus large serait souhaitable → proposer `/refactor`)

---

## 6. Sign-off

- [ ] Tests automated GREEN (Vitest + Playwright)
- [ ] Manual QA checklist 2.1-2.4 cochée
- [ ] Régressions 3.1-3.3 vérifiées
- [ ] Risques résiduels 5 communiqués à l'utilisateur

Une fois signé : on peut /ship.
```

## Règles d'écriture pour `qa-tester`

- **Lister, ne pas coder** — le plan ne contient pas de tests à écrire, juste leur description (l'écriture peut être déléguée à `feature-implementer` ou faite par l'utilisateur)
- **Steps précis** — un humain doit pouvoir cocher la checklist sans poser de question (URL exacte, compte exact, viewport exact)
- **3-5 edge cases minimum** — moins = plan superficiel, plus = noyade
- **Différencier automatable vs manuel** — certains cas (bascule mobile/desktop, drag-drop, scroll long) sont durs à automatiser et restent manuels
- **Ubiquitous language** — utiliser les termes métier du BC (membre, don, reçu fiscal, association) pas les termes techniques (entity, gateway)
- **Priorisation** — marquer les sections critiques (cas nominal + cas du bug fixé) vs nice-to-have (browsers exotiques)

## Anti-patterns

- ❌ "Tester que ça fonctionne" — sans steps précis, ce n'est pas un test
- ❌ Plan de 50 cas qui ne sera jamais exécuté → préférer 10 cas critiques ciblés
- ❌ Edge cases inventés sans rapport avec le BC ("tester avec 1 million de records") — ancrer dans la réalité métier
- ❌ Skip la section "Régressions à risque" parce que "le fix est petit" — c'est précisément les petits fix qui cassent autre chose discrètement
