---
name: skill-creator
description: "Guide for creating effective skills. Use when users want to create a new skill or update an existing skill that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations."
triggers:
  - "créer.*skill"
  - "nouveau.*skill"
  - "create.*skill"
  - "new.*skill"
---

# Skill Creator

Guide for creating effective skills for this project.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing specialized knowledge, workflows, and tools. They transform Claude from a general-purpose agent into a specialized one.

### What Skills Provide

1. Specialized workflows - Multi-step procedures for specific domains
2. Domain expertise - Project-specific knowledge, schemas, business logic
3. Bundled resources - References and assets for complex tasks

## Core Principles

### Concise is Key

The context window is a public good. Only add context Claude doesn't already have. Challenge each piece of information: "Does Claude really need this?" and "Does this paragraph justify its token cost?"

### Set Appropriate Degrees of Freedom

- **High freedom** (text instructions): multiple approaches valid, context-dependent decisions
- **Medium freedom** (pseudocode/templates): preferred pattern exists, some variation acceptable
- **Low freedom** (specific scripts): operations fragile, consistency critical

### Anatomy of a Skill

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (required: name + description)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── rules/       - Constraint files loaded by reference
    └── references/  - Documentation loaded as needed
```

### Progressive Disclosure

1. **Metadata (name + description)** - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<5k words, <500 lines)
3. **Bundled resources** - As needed by Claude (unlimited)

## Skill Creation Process

1. Understand the skill with concrete examples
2. Plan reusable contents (rules, references)
3. Create `SKILL.md` with frontmatter
4. Iterate based on real usage

### Writing Guidelines

- Use imperative form
- `description` in frontmatter is the primary trigger mechanism
- Keep body under 500 lines
- Only include what Claude does not already know
- Match the project's conventions (see `.claude/CLAUDE.md`)

### What NOT to include

- README.md, INSTALLATION_GUIDE.md, CHANGELOG.md
- Generic programming knowledge Claude already has
- Skills are for AI agents, not humans

## Project-Specific Conventions

When creating skills for Shiplens :
- Skills go in `.claude/skills/<skill-name>/SKILL.md`
- Agents go in `.claude/agents/<agent-name>.md`
- Rules/references as sub-files loaded by the skill
- Follow the existing skill patterns (see `/tdd`, `/architecture-backend`, `/architecture-frontend`, `/ddd`)
- Register new skills in `.claude/CLAUDE.md` skills table
