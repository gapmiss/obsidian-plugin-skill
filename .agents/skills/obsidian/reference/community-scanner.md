# Community Plugin Scanner

> **Last verified:** 2026-11-06, against `eslint-plugin-obsidianmd` v0.5.1.
> The scanner is new and under active development. This file is the single source of truth for scanner behavior — when the scanner changes, update this file. Other docs link here rather than duplicating.

The community.obsidian.md scanner analyzes every plugin release and publishes the results as a [Scorecard](#scorecard-system). For the ESLint configuration that satisfies it, see [eslint-setup.md](eslint-setup.md). For the submission process itself, see [submission.md](submission.md).

## What the Scanner Runs

The scanner runs a configuration built on `eslint-plugin-obsidianmd`'s `recommended` config, so a single `...obsidianmd.configs.recommended` reproduces most of it locally. It bundles:

1. **`eslint-plugin-obsidianmd`** — 42 Obsidian-specific rules (DOM safety, command naming, platform APIs, popout window compatibility, declarative settings, etc.)
2. **`typescript-eslint` recommended type-checked** — Standard type-aware TypeScript rules (`no-floating-promises`, `restrict-template-expressions`, `no-unnecessary-type-assertion`, etc.), with `@typescript-eslint/no-misused-promises` swapped for `obsidianmd/no-misused-promises` (Obsidian's chaining `then` on `Setting`/components isn't treated as a Promise)
3. **Security & hygiene plugins** — `@microsoft/eslint-plugin-sdl` and `no-unsanitized` (DOM injection), `eslint-plugin-depend` (replaceable dependencies, checked against `package.json`), `eslint-plugin-import`, and `eslint-comments` (disable-directive discipline).

The only thing you supply locally is `parserOptions` with `projectService` so the type-aware rules can load type information — see [eslint-setup.md](eslint-setup.md) for the complete config. The scanner itself sets `projectService: true` and `tsconfigRootDir` to the plugin root; files no `tsconfig.json`/`jsconfig.json` covers are linted **without** type information (type-aware rules off) rather than failing, so a JavaScript plugin without a tsconfig is still reviewed.

### Scanner Ignored Patterns

The scanner only lints plugin source code. These patterns are excluded:

- `node_modules`, `dist`, `build`, `pkg` — dependencies and build output
- `.obsidian`, `**/.obsidian/**` — vault config directories
- `test-vault` — test vault directories
- `esbuild.config.mjs`, `version-bump.mjs` — common build scripts
- `**/*.test.*`, `**/*.tests.*`, `**/*.spec.*`, `**/*.specs.*`, `**/test/**`, `**/tests/**`, `**/__tests__/**` — test files/directories
- `**/mocks/**`, `**/__mocks__/**`, `**/testUtils**` — test utilities
- `**/*.cjs`, `**/*.mjs`, `**/*.cts`, `**/*.mts` — non-`.ts`/`.js` extensions (typically config files)
- `**/vite*`, `**/scripts/**`, `**/docs/**` — config, build, and documentation
- `**/i18n/**`, `**/i18next/**`, `**/locale/**`, `**/locales/**`, `**/translations/**`, `**/l10n/**` — localization files
- `.pnpm-store`, `automation/**` — cache and CI
- `**/e2e/**`, `**/e2e-tests/**`, `**/*.e2e.*`, `**/wdio.conf.*`, `**/wdio.*.conf.*`, `**/playwright.config.*` — end-to-end tests
- Tool configs by name: `**/{astro,babel,commitlint,docusaurus,esbuild,eslint,jest,oxlint,postcss,prettier,rolldown,rollup,stylelint,svelte,tailwind,tsdown,tsup,uno,webpack}.config.*`, `**/{eslint,jest}.*.config.*`, `**/jest.setup.*`, `**/.{babelrc,eslintrc,mocharc,prettierrc}.*` — a plugin's own `config.ts` or `settings.config.ts` is still linted
- **Bundled/minified JavaScript** — `*.min.js`, files under `node_modules`/`dist`/`build`/`out`/`release` at any depth, and (in TypeScript projects) the root `main.js` or files outside your source whose first 500 bytes hold a bundler banner or fewer than two line breaks. JavaScript inside your source, and every file of a JavaScript plugin, is always linted

### Scanner Rule Adjustments

The scanner adjusts severities compared to the `recommended` config:

- **Security rules kept as `error`:** `no-eval`, `no-unsanitized/method`, `no-unsanitized/property`, `obsidianmd/regex-lookbehind`, `obsidianmd/no-forbidden-elements`, and implied eval (core `no-implied-eval` in JS, `@typescript-eslint/no-implied-eval` in TS)
- **Security findings:** `no-eval`, `no-implied-eval`, `@typescript-eslint/no-implied-eval`, `no-new-func`, `no-unsanitized/method`, and `no-unsanitized/property` are filed as security findings and are always errors. `no-new-func` runs inside `obsidianmd/rule-custom-message`; a `[no-new-func]` message is filed as a security error, while `[no-console]` stays a code-quality warning
- **Rules disabled by scanner:** `no-undef`, `@typescript-eslint/no-unsafe-*`, `restrict-template-expressions`, `no-base-to-string`, `import/no-unresolved`, `validate-manifest`, `validate-license` (the scanner reviews the manifest separately), `commands/no-command-in-command-id`, `commands/no-plugin-id-in-command-id`, and the three sentence-case rules
- **Recommendations (weigh less than warnings):** `@typescript-eslint/no-deprecated`, `@typescript-eslint/no-unused-vars`, `@typescript-eslint/no-namespace`, `@typescript-eslint/prefer-as-const`, `@typescript-eslint/prefer-namespace-keyword`, `obsidianmd/prefer-abstract-input-suggest`
- Most other rules are downgraded to `warn`
- **Disable comments** are honored, and unused ones are not reported. `eslint-comments/no-unlimited-disable` is always `error`
- **Missing dependencies:** if the plugin's dependencies can't be installed (no `package.json`, or the install fails), type-aware rules and `obsidianmd/no-misused-promises` are switched off

### Stricter Layers for Newer Submissions

Plugins are checked with one of four layers depending on when they were submitted. **The newest layer (what a plugin submitted today gets)** adds on top of the base:

- `eslint-comments/require-description`, `disable-enable-pair`, and `no-restricted-disable` at `error` (the two oldest layers have them at `warn`)
- `@typescript-eslint/no-unsafe-*` and the two command-id rules back at `warn`
- These obsidianmd rules at `error`: `settings-tab/no-manual-html-headings`, `settings-tab/no-problematic-settings-headings`, `sample-names`, `no-sample-code`, `platform`, `no-plugin-as-component`, `detach-leaves`, `no-static-styles-assignment`, `no-view-references-in-plugin`, `no-unsupported-api`

❌ **INCORRECT** — assuming the scanner downgrades everything to `warn`, and shipping `el.setCssStyles({ color: "red" })` (`no-static-styles-assignment`) or an `eslint-disable` without a `-- description`.

✅ **CORRECT** — treat the list above as hard errors for a new submission; fix them, and give every disable comment a description.

### Committed Build Output

The scanner warns when a TypeScript project commits a root `main.js` whose first 500 bytes hold the sample plugin's esbuild banner — build output belongs in the release, not the repository. Add `main.js` to `.gitignore`. In a JavaScript plugin, `main.js` is the source and is not reported.

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
- Unused variables (filed as recommendations; `_`-prefixed caught errors and destructured array elements are ignored, but a dead `_x` variable is still reported)
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
2. **Use the bundled `recommended` config** — it already includes `typescript-eslint/recommendedTypeChecked` for type-aware checks (just add `parserOptions.projectService`)
3. **Add GitHub artifact attestation** to your release workflow
4. **Maintain regular commits and releases** for good Health metrics
5. **Respond to issues promptly** to improve Responsiveness
6. **Add a CONTRIBUTING.md** file for perfect Hygiene
