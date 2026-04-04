---
name: wiki
description: "Sync DDD documentation (event storming, ubiquitous language) to the GitHub wiki. Clones the wiki repo, updates pages, commits and pushes."
triggers:
  - "wiki"
  - "update.*wiki"
  - "sync.*wiki"
  - "push.*wiki"
---

# Wiki — GitHub Wiki Sync

Synchronizes DDD documentation from `docs/ddd/` to the GitHub wiki.

## Activation

- `/wiki` — full sync of all DDD docs to the wiki
- `/wiki <bounded-context>` — sync only the specified BC page + Big Picture + Ubiquitous Language

## Workflow

### Step 1: Detect the wiki repo URL

Extract the remote URL from the project repo and derive the wiki URL:
- `https://github.com/<owner>/<repo>.git` → `https://github.com/<owner>/<repo>.wiki.git`

### Step 2: Clone the wiki repo

```bash
WIKI_DIR="/tmp/<repo>-wiki"
rm -rf "$WIKI_DIR"
git clone <wiki-url> "$WIKI_DIR"
```

### Step 3: Sync pages

Map local docs to wiki page names (flat structure, dashes for hierarchy):

| Source | Wiki Page |
|--------|-----------|
| `docs/ddd/EVENT_STORMING_BIG_PICTURE.md` | `Event-Storming-Big-Picture.md` |
| `docs/ddd/ubiquitous-language.md` | `Ubiquitous-Language.md` |
| `docs/ddd/event-storming/<bc>.md` | `Event-Storming-<Bc>.md` |

For each file:
1. Copy content to the wiki page
2. Rewrite internal links to use wiki format:
   - `event-storming/identity.md` → `Event-Storming-Identity`
   - `(Event-Storming-Big-Picture)` stays as-is

### Step 4: Update Home page

Read the existing `Home.md`. Update the **Domain Knowledge** section with links to all event storming pages. Preserve any other content the user may have added manually.

If no `Home.md` exists or it only contains the default GitHub text, generate a full Home page with:
- Project description (from the Big Picture overview)
- Architecture table (bounded contexts)
- Tech stack
- Domain knowledge links
- Key flows summary
- Known hot spots

### Step 5: Update sidebar

Generate `_Sidebar.md` with navigation links to all wiki pages:

```markdown
### Navigation

**[Home](Home)**

---

**Domain**
- [Event Storming Big Picture](Event-Storming-Big-Picture)
- [Ubiquitous Language](Ubiquitous-Language)

**Bounded Contexts**
- [Identity](Event-Storming-Identity)
- [Synchronization](Event-Storming-Synchronization)
- ...
```

Dynamically list all `Event-Storming-*.md` files in the wiki to build the BC list.

### Step 6: Commit and push

```bash
cd "$WIKI_DIR"
git add -A
git commit -m "docs: sync DDD documentation from codebase"
git push origin master
```

### Step 7: Report

Display:
- Pages updated/created
- Wiki URL: `https://github.com/<owner>/<repo>/wiki`

## Rules

- All wiki content must be in **English** (project language rule)
- The wiki repo only supports the `master` branch — commit directly
- Never modify `docs/ddd/` files from this skill — it only reads and syncs
- Preserve manual content in Home.md outside the managed sections
- The hook `protect-main-branch.sh` allows wiki commits (detects "wiki" in the command path)

## Error Handling

| Situation | Action |
|-----------|--------|
| Wiki not enabled on the repo | Tell the user to enable it in GitHub Settings > Features > Wikis |
| Clone fails | Check if the wiki has been initialized (at least one page must exist via the GitHub UI) |
| No docs/ddd/ content | Warn the user, suggest running `/event-storming` first |
| Push fails (auth) | Suggest the user run `! cd /tmp/<repo>-wiki && git push origin master` manually |
