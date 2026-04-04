---
name: security
description: Scan code to detect secrets before commit. Checks tokens, API keys, credentials and sensitive data.
---

# Security — Secret Detection

## Activation

- Before a `git commit` or `git push`
- On explicit request (`/security`)

## Detected Patterns

### Tokens & API Keys

| Pattern | Example | Regex |
|---------|---------|-------|
| GitHub PAT | `ghp_xxxx` | `gh[ps]_[a-zA-Z0-9]{36,}` |
| GitHub OAuth | `gho_xxxx` | `gho_[a-zA-Z0-9]{36,}` |
| Linear API Key | `lin_api_xxxx` | `lin_api_[a-zA-Z0-9]{20,}` |
| OpenAI | `sk-xxxx` | `sk-[a-zA-Z0-9]{32,}` |
| Anthropic | `sk-ant-xxxx` | `sk-ant-[a-zA-Z0-9-]{32,}` |
| AWS Access Key | `AKIA...` | `AKIA[0-9A-Z]{16}` |
| Slack Token | `xox[baprs]-` | `xox[baprs]-[a-zA-Z0-9-]+` |

### Generic Credentials

| Pattern | Context |
|---------|---------|
| `password\s*=\s*["'][^"']+["']` | Hardcoded passwords |
| `secret\s*=\s*["'][^"']+["']` | Hardcoded secrets |
| `token\s*=\s*["'][^"']+["']` | Hardcoded tokens |
| `api[_-]?key\s*=\s*["'][^"']+["']` | Hardcoded API keys |
| `Bearer [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+` | JWT tokens |

### Suspicious Files

| File | Risk |
|------|------|
| `.env`, `.env.local` | Environment variables with secrets |
| `*.pem`, `*.key` | Private keys |
| `secrets.*`, `credentials.*` | Secret files |
| `id_rsa`, `id_ed25519` | Private SSH keys |

## Workflow

### Pre-commit scan (staged files)

```bash
git diff --cached --name-only
git diff --cached
```

Result:
```
SECURITY — Pre-commit scan

Files scanned: X
Secrets detected: Y

[If secrets found]
ALERT: Secrets detected!

File: src/config.ts
Line 42: token = "lin_api_..." (Linear API Key)

Action: Fix before committing.
Suggestion: Use an environment variable.
```

### Full repo scan

Scan all `.ts`, `.json`, `.yml`, `.yaml`, `.env*` files:
```bash
grep -rn -E "(ghp_|sk-|lin_api_|AKIA|password\s*=\s*[\"']|secret\s*=\s*[\"'])" --include="*.ts" --include="*.json" --include="*.yml" src/
```

## False Positives

Ignore if:
- Test file with dummy values (`test_token`, `fake_key`)
- Documentation with examples (`xxxx`, `your-token-here`)
- Pattern in `.env.example` with empty placeholders

## Report

```
SECURITY — Result

Status: OK / ALERT
Files scanned: X
Secrets detected: Y

[List: file, line, type]
[Correction suggestions]
```
