# Community Plugin Scanner

> **Last verified:** 2026-06-11, against `eslint-plugin-obsidianmd` v0.3.0.
> The scanner is new and under active development. This file is the single source of truth for scanner behavior — when the scanner changes, update this file. Other docs link here rather than duplicating.

The community.obsidian.md scanner analyzes every plugin release and publishes the results as a [Scorecard](#scorecard-system). For the ESLint configuration that satisfies it, see [eslint-setup.md](eslint-setup.md). For the submission process itself, see [submission.md](submission.md).

## What the Scanner Runs

The scanner uses **two rule sets together**:

1. **`eslint-plugin-obsidianmd`** — 36 Obsidian-specific rules (DOM safety, command naming, platform APIs, popout window compatibility, etc.)
2. **`typescript-eslint` recommended type-checked** — Standard TypeScript rules (`no-floating-promises`, `no-require-imports`, `restrict-template-expressions`, `no-unnecessary-type-assertion`, etc.)

The critical mistake is configuring only the obsidianmd plugin rules without the typescript-eslint type-checked rules. You must add both — see [eslint-setup.md](eslint-setup.md) for the complete config.

## Checks Beyond ESLint

The scanner also runs release-level checks that no local lint config covers:

- **Vulnerable dependencies** — known CVEs in your dependency tree
- **Deprecated packages** — npm packages replaceable by Node.js built-ins (e.g., `builtin-modules`); see [code-quality.md](code-quality.md#deprecated--replaceable-packages) for fix patterns
- **Build verification** — `main.js` is verified against the repository source
- **Artifact attestation** — `main.js` and `styles.css` should have verified GitHub artifact attestation
- **Unsafe API calls** — e.g., `range.createContextualFragment` (flagged as a Risk)
- **Behavior detection** — network requests, clipboard access, vault reads/writes, dynamic code execution, etc., surfaced as [Disclosures](#disclosures-informational-not-penalized)

> Naming and description validation happens earlier, at submission time, via the release validation bot (`validate-plugin-entry.yml`) — see [submission.md](submission.md#naming-and-description-guidelines).

## Scorecard System

Published plugins receive a **Scorecard** on community.obsidian.md that users see when browsing. A poor Scorecard can deter users from installing your plugin.

### Overall Score (percentage)

Composite of Health and Review metrics. Examples: 96% (excellent), 65% (needs work).

### Health (Excellent / Good / Poor)

| Metric | What it measures | Tips |
|--------|------------------|------|
| Hygiene | readme, license, description, contributing guide | Add CONTRIBUTING.md |
| Maintenance | Commit frequency, release recency | Release regularly |
| Responsiveness | Issue close rate | Triage issues promptly |
| Adoption | Installations, stars | Promote your plugin |

### Review (Satisfactory / Caution)

Automated scans of your latest release. **ESLint violations become publicly visible here.**

**Passed Checks:**
- No known vulnerable dependencies
- No network requests detected (or properly disclosed)
- Build verified against source
- `main.js` and `styles.css` have verified GitHub artifact attestation

**Risks:**
- Unsafe API calls (e.g., `range.createContextualFragment`)

**Warnings (can be 100+):**
- Unnecessary type assertions
- Unexpected `any` types
- Direct style manipulation via `setAttribute` or `element.style`
- Missing `activeDocument`/`activeWindow` usage
- Floating promises (must be awaited or voided)
- Unused variables (prefix with `_` if intentional)
- Deprecated packages (e.g., `builtin-modules`, `indent-str`)
- `setInterval` combined with network calls (periodic data transmission concern)
- Plugin description missing punctuation

### Disclosures (informational, not penalized)

These are shown to users but don't affect your score:

| Disclosure | Trigger |
|------------|---------|
| Clipboard Access | `navigator.clipboard` usage |
| base64 calls | `atob()` / `btoa()` usage |
| Vault Read | `vault.read`, `vault.cachedRead` |
| Vault Write | `vault.modify`, `vault.create` |
| Vault Enumeration | `vault.getFiles()`, `getMarkdownFiles()` |
| Network Requests | `fetch()`, `XMLHttpRequest` count |
| Dynamic Code Execution | `eval()`, `new Function()` |
| System Identity | hostname, user info, env vars |
| ES5 Transpilation | `__esModule`, `__generator` helpers in bundle |

### Other Flags

- Missing GitHub artifact attestation on release assets
- Build verification not available

### Improving Your Scorecard

1. **Fix ALL ESLint warnings**, not just errors — warnings are publicly visible
2. **Use `typescript-eslint/recommendedTypeChecked`** for type-aware checks
3. **Add GitHub artifact attestation** to your release workflow
4. **Maintain regular commits and releases** for good Health metrics
5. **Respond to issues promptly** to improve Responsiveness
6. **Add a CONTRIBUTING.md** file for perfect Hygiene
