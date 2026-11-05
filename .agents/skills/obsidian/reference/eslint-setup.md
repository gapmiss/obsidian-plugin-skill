# Setting Up ESLint for Obsidian Community Plugin Submission

The Obsidian community plugin review runs an automated scan that checks your code against a specific set of lint rules. If your local ESLint setup doesn't match what the scanner checks, you'll submit with a clean local lint and get back a wall of violations.

This guide covers the complete setup so your local `npx eslint .` catches exactly what the community scanner catches.

## What the Community Scanner Actually Checks

The scanner runs `eslint-plugin-obsidianmd`'s recommended config, which bundles the `typescript-eslint` recommended type-checked rules itself (plus `import`, `@microsoft/sdl`, `depend`, `no-unsanitized`, and `eslint-comments`). `...obsidianmd.configs.recommended` alone gives you the same ruleset the scanner uses.

Full scanner behavior (rule sets, checks beyond ESLint, Scorecard mechanics) is documented in [community-scanner.md](community-scanner.md).

## Prerequisites

### For New Projects

```bash
npm install -D eslint typescript typescript-eslint obsidian eslint-plugin-obsidianmd
```

- **`obsidian` must be installed in your project.** v0.5.0 reads Obsidian's own type definitions and no longer installs `obsidian` for you. Without it, `no-unsupported-api` silently reports nothing. Sample-plugin projects already have it.
- `@eslint/js` and `@eslint/json` are **not** needed unless your own config imports them. If it does, `@eslint/json` must be 2.x (see [Upgrading from v0.4.x](#upgrading-from-v04x)).
- You don't need `@typescript-eslint/parser` separately — `typescript-eslint` provides the parser.

### Migrating Existing Projects (IMPORTANT)

If your project has old ESLint packages (common in plugins created before 2024), you must clean up before installing.

#### Quick Migration (One Command)

If you have TypeScript 4.x, this single command upgrades everything at once:

```bash
npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint && \
npm install -D typescript@5 eslint@9 typescript-eslint obsidian eslint-plugin-obsidianmd
```

Then remove old config files:
```bash
rm -f .eslintrc .eslintrc.js .eslintrc.json .eslintrc.yml .eslintrc.yaml
```

#### Step-by-Step Migration

If the quick command fails or you prefer more control:

**1. Check your current setup:**
```bash
grep -E "@typescript-eslint|eslint|typescript" package.json
```

**2. Remove ALL old eslint packages first:**
```bash
npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint

# Or with pnpm:
pnpm remove @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint
```

**3. Install everything together (including TypeScript upgrade):**

`typescript-eslint` v8.x requires **TypeScript >=4.8.4** and supports up to TypeScript 6. Include TypeScript in the install to avoid ERESOLVE errors:

```bash
npm install -D typescript@5 eslint@9 typescript-eslint obsidian eslint-plugin-obsidianmd
```

> **Why include TypeScript?** If your project has TypeScript 4.7.x or older, npm will refuse to install `typescript-eslint` with `ERESOLVE unable to resolve dependency tree`. Installing TypeScript in the same command resolves this. **Do not install TypeScript 7** — it has no JavaScript API yet, so `typescript-eslint` cannot use it and npm fails with `ERESOLVE`.

**4. Remove old config files:**
```bash
rm -f .eslintrc .eslintrc.js .eslintrc.json .eslintrc.yml .eslintrc.yaml
```

**5. Verify old packages are gone:**
```bash
grep "@typescript-eslint/eslint-plugin" package.json
# Should return nothing. If it still shows, run:
npm uninstall @typescript-eslint/eslint-plugin
```

#### Why Migration Fails

The old `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` (v5-7) conflict with the new unified `typescript-eslint` package (v8+). Common errors:
- `ERESOLVE unable to resolve dependency tree` — TypeScript too old (or TypeScript 7), or old packages still installed
- `TypeError: scopeManager.addGlobals is not a function` — version conflict between old and new packages
- `Parsing error: Unexpected character 'e' found` — parser not loading due to version mismatch
- `peer eslint@"^6.0.0 || ^7.0.0 || ^8.0.0"` warnings — old @typescript-eslint packages don't support ESLint 9+

### Version Requirements

Versions at time of writing:
- `eslint-plugin-obsidianmd` 0.5.0
- **Node.js 20.19+, 22.13+, or 24+** (Node.js 18 is no longer supported — upgrade locally and in CI)
- `eslint` 9.19+ (flat config). `defineConfig`/`globalIgnores` from `eslint/config` need 9.22+
- `typescript-eslint` 8.35.1+ (8.70.1+ recommended — fixes a `no-unnecessary-type-assertion` false positive on `{}` asserted to a `Record` alias)
- `typescript` 4.8.4+, up to 6.x. **Not TypeScript 7.**
- `obsidian` installed as a devDependency

Peer dependencies are `eslint >=9.19.0`, `typescript >=4.8.4`, and `typescript-eslint ^8.35.1`. Everything else the config needs — `@eslint/json`, `eslint-plugin-import`, `@microsoft/eslint-plugin-sdl`, `eslint-plugin-depend`, `eslint-plugin-no-unsanitized`, `eslint-comments` — ships as a dependency of the plugin, so you don't install those yourself.

**ESLint 10** works, with caveats: npm prints `ERESOLVE overriding peer dependency` warnings (three bundled plugins don't declare ESLint 10 support yet), `npm ls` reports `invalid: eslint@10…`, and installs with `strict-peer-deps` fail. ESLint 10 also adds `no-unassigned-vars`, `no-useless-assignment`, and `preserve-caught-error` at `error`. `preserve-caught-error` suggests `new Error(msg, { cause })`, which needs `ES2022` in your tsconfig `lib`. ESLint 9 is the conservative choice.

**TypeScript notes:**
- `moduleResolution: "node"` shows a deprecation warning on 5.9+ and stops `tsc` on TypeScript 6 → use `"bundler"` for esbuild projects
- `baseUrl` is deprecated (removed in TS 7.0) → remove if not using path aliases
- TypeScript 6 defaults `types` to `[]`, so `eslint.config.mts` linted via `allowDefaultProject` has no Node types and `tsconfigRootDir: import.meta.dirname` is reported by `no-unsafe-assignment`. Add `"types": ["node"]` to `compilerOptions`

## Upgrading from v0.4.x

v0.5.0 is a breaking release that lints more files and needs newer tooling. Expect new findings, mostly from `prefer-active-doc`, `validate-manifest`, `validate-license`, `no-static-styles-assignment`, and `prefer-instanceof`. Test files no longer get the Obsidian-runtime rules and `no-undef` no longer runs on TypeScript, so most projects see fewer findings overall.

| Change | What to do |
|--------|------------|
| Node.js 18 dropped | Use Node.js 20.19+, 22.13+, or 24+ locally and in CI |
| `@eslint/json` 2 | If your config registers `@eslint/json` itself, upgrade it to 2.x — 0.14 fails with `Cannot redefine plugin "json"` |
| `obsidian` no longer installed for you | `npm install -D obsidian`, or `no-unsupported-api` reports nothing |
| `@eslint/js` no longer installed for you | If your config imports it, add it to `devDependencies` |
| `manifest.json` and `LICENSE` are now linted | Run ESLint from the project root (`eslint .`, not `eslint src`). Scope type-checked configs and rule-override blocks with `files` (see [below](#scope-overrides-with-files)) |
| `@typescript-eslint/no-misused-promises` replaced by `obsidianmd/no-misused-promises` | Rename disable comments — old ones are now reported as unused. If you layer `strictTypeChecked`/`recommendedTypeChecked`, turn the typescript-eslint rule `off` in that block |
| `@typescript-eslint/no-require-imports` is off again | Delete disable comments for it (now reported as unused) |
| `no-undef` is off for TypeScript | Delete disable comments for it in `.ts` files |
| Implied eval in TS is reported by `@typescript-eslint/no-implied-eval` only | Rename `no-implied-eval` disable comments in `.ts` files |
| `ui/sentence-case` is off | Opt back in: `"obsidianmd/ui/sentence-case": ["warn", { enforceCamelCaseLower: true }]` |
| `prefer-active-doc` now warns | Replace global `document` with `activeDocument` (or `el.doc`) |
| Desktop-only repos: raising `no-nodejs-modules` severity no longer re-enables it | Use `["error", { isDesktopOnly: false }]` |
| `ruleConfigs` hold only obsidianmd rules | If you use `ruleConfigs` without `recommended`, add `@typescript-eslint/no-deprecated` yourself; `validate-manifest`/`validate-license` need their own blocks |

**From the sample plugin's config:** `npm install -D eslint-plugin-obsidianmd@0.5` and the `eslint.config.mts` works unchanged. You can drop `'manifest.json'` from `allowDefaultProject` and `extraFileExtensions: ['.json']` — both were only needed for v0.4. Remove `'package.json'` from `globalIgnores` so `depend/ban-dependencies` checks it.

## The Complete ESLint Config

### Recommended Config (start here)

`obsidianmd.configs.recommended` is self-contained — it bundles the core `js.configs.recommended` rules of your installed ESLint, `typescript-eslint` (`recommendedTypeChecked` for `.ts`, `recommended` for `.js`), all Obsidian rules, plus `import`, `@microsoft/sdl`, `depend`, `no-unsanitized`, and `eslint-comments`, and it injects the Obsidian globals (`activeDocument`, `createDiv`, `sleep`, …). This is the same ruleset the community scanner runs.

You add two things: a `globalIgnores` entry for build output, and a `parserOptions` block so the type-checked rules can access your TypeScript project.

✅ **CORRECT** (v0.5.0):
```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
    // Build output and the sample plugin's Node build scripts are not plugin code.
    globalIgnores(["node_modules", "dist", "main.js", "esbuild.config.mjs", "version-bump.mjs"]),
    ...obsidianmd.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ["eslint.config.*"],
                },
            },
        },
    },
]);
```

```jsonc
// package.json
"scripts": {
    "lint": "eslint ."
}
```

❌ **INCORRECT**:
```js
export default defineConfig([
    { ignores: ["main.js", "*.mjs", "package.json"] }, // hides package.json from depend/ban-dependencies
    ...obsidianmd.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                extraFileExtensions: [".json"],          // only needed for v0.4
            },
        },
    },
]);
// with "lint": "eslint src" — never visits manifest.json, LICENSE, or package.json
```

> **Run ESLint from the project root.** The recommended config matches `package.json`, `manifest.json`, and `LICENSE` (also `LICENSE.md`, `LICENSE.txt`) **by name, next to your ESLint config**. `eslint src` never visits them, so `depend/ban-dependencies`, `validate-manifest`, and `validate-license` silently do nothing. Matching is case-sensitive on every OS: `License` or `Manifest.json` is not linted. Rules that read `minAppVersion`/`isDesktopOnly` also read `manifest.json` from the working directory.

> **Ignore build output.** `main.js` is esbuild output; `esbuild.config.mjs` and `version-bump.mjs` are Node build scripts. None is in your tsconfig, so without the ignore ESLint fails on them with "was not found by the project service". If your plugin has no build step and `main.js` is your source, don't ignore it — add it to `allowDefaultProject` and declare `module`/`exports` as writable globals for it.

> **No separate parser import needed.** The recommended config bundles the typescript-eslint parser. You don't need to import `tseslint` or set `parser` yourself — just provide `parserOptions`.

> **`allowDefaultProject`** covers files in no `tsconfig.json`, such as the config file itself (the sample plugin's `eslint.config.mts` matches the recommended config's TypeScript glob).

### Plugins written in JavaScript

`.js`/`.cjs`/`.mjs`/`.jsx` files get core rules, typescript-eslint `recommended` (not type-checked), and every obsidianmd rule except the seven that need type information (`no-unsupported-api`, `no-misused-promises`, `prefer-create-el`, `prefer-file-manager-trash-file`, `prefer-instanceof`, `no-plugin-as-component`, `no-view-references-in-plugin`). A JavaScript plugin needs **no** `parserOptions` block — with it and no `jsconfig.json`, every file fails with "was not found by the project service". To enable the type-aware rules, add a `jsconfig.json` that includes your sources and a block with `files: ["src/**/*.js"]`, `extends: [tseslint.configs.recommendedTypeChecked]`, `parserOptions: { projectService: true }`, `...obsidianmd.ruleConfigs.recommendedTypeChecked`, and `"@typescript-eslint/no-misused-promises": "off"`.

### Locale checks: `recommendedWithLocalesEn`

Swap `recommended` for `recommendedWithLocalesEn` to add `ui/sentence-case-json` and `ui/sentence-case-locale-module` (both `warn`) for English locale files: JSON files and modules (`.ts`, `.js`, `.cjs`, `.mjs`) named `en`, `en-*`, `en_*`, or `en.*` (e.g. `en.json`, `en-US.ts`, `en.messages.json`, any case), or under a directory named so (`en/`, `en-US/`). `english.json`, `entries.json`, and `env.json` are not matched. Inline `ui/sentence-case` stays off in both configs.

### Customizing rules

The recommended set is opinionated, and the scanner forbids disabling certain rules inline (see "Disabling rule `X` is not allowed" below), so prefer config-level overrides over `eslint-disable` comments.

#### Scope overrides with `files`

Because v0.5.0 also lints `package.json`, `manifest.json`, and `LICENSE`, **every rule-override block needs a `files` glob for your source.** The `@typescript-eslint`, `import`, and other bundled plugins are registered for JS/TS files only.

✅ **CORRECT**:
```js
export default defineConfig([
    globalIgnores(["node_modules", "dist", "main.js", "esbuild.config.mjs", "version-bump.mjs"]),
    ...obsidianmd.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: { allowDefaultProject: ["eslint.config.*"] },
            },
        },
    },
    {
        files: ["**/*.{ts,cts,mts,tsx,js,cjs,mjs,jsx}"],
        rules: {
            "obsidianmd/sample-names": "off",
            "obsidianmd/ui/sentence-case": ["warn", { enforceCamelCaseLower: true }], // opt in; off by default
            "@typescript-eslint/no-unused-vars": ["error", { args: "after-used" }],
        },
    },
]);
```

❌ **INCORRECT** — no `files`, so the block reaches `manifest.json`/`LICENSE` and stops the run:
```js
{
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", { args: "after-used" }],
    },
}
// A configuration object specifies rule "@typescript-eslint/no-unused-vars",
// but could not find plugin "@typescript-eslint".
```

The parser-options block and `linterOptions` are meant for every file and stay unscoped.

#### Layering stricter typescript-eslint configs

Scope `strictTypeChecked`/`stylisticTypeChecked` to TypeScript files, and turn back off the two rules they re-enable that conflict with this plugin:

✅ **CORRECT**:
```js
import tseslint from "typescript-eslint";

// after ...obsidianmd.configs.recommended:
{
    files: ["**/*.ts"],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    rules: {
        // obsidianmd/no-misused-promises replaces it; both on = every Promise reported twice,
        // and Obsidian's chaining `then` (Setting, components) flagged again.
        "@typescript-eslint/no-misused-promises": "off",
        // Conflicts with the Platform.isDesktop-guarded require() that no-nodejs-modules asks for.
        "@typescript-eslint/no-require-imports": "off",
    },
},
```

❌ **INCORRECT** — unscoped, so it reaches `LICENSE` and aborts with "You have used a rule which requires type information":
```js
...obsidianmd.configs.recommended,
...tseslint.configs.strictTypeChecked,
```

`strictTypeChecked` also turns `@typescript-eslint/require-await`, `ban-ts-comment`, and `prefer-const` back on, which the recommended config leaves off. `require-await` reports an `async onOpen()`/`onClose()` that never awaits.

#### Disabling rules for non-plugin files

ESLint has no `"obsidianmd/*": "off"`. Use `ruleConfigs` to generate the overrides:

```js
{
    files: ["scripts/**"],
    rules: Object.fromEntries([
        ...Object.keys(obsidianmd.ruleConfigs.recommended),
        ...Object.keys(obsidianmd.ruleConfigs.recommendedTypeChecked),
    ].map(rule => [rule, "off"])),
}
```

For code that only runs on desktop but has no manifest (a CLI, tooling), scope the `isDesktopOnly` option instead of disabling the rule: `{ files: ["cli/**"], rules: { "obsidianmd/no-nodejs-modules": ["warn", { isDesktopOnly: true }] } }`.

#### Test and web worker files (automatic)

The recommended config exempts test and worker files from the rules about code running inside Obsidian — you don't need overrides for the standard paths:

- **Test files** — `**/*.{test,tests,spec,specs}.*`, `**/testUtils*`, anything under `test/`, `tests/`, `__tests__/`, `mocks/`, `__mocks__/`, top-level `automation/` or `test-vault/`, and e2e tests (`**/*.e2e.*`, `e2e/`, `e2e-tests/`, `wdio.conf.*`, `playwright.config.*`). Off there: `no-global-this`, `prefer-active-doc`, `prefer-create-el`, `prefer-instanceof`, `prefer-window-timers`, `no-nodejs-modules`, `no-tfile-tfolder-cast`, `hardcoded-config-path`, `no-unsupported-api`, `regex-lookbehind`.
- **Web worker files** — `**/*.worker.*` and anything under `workers/`. Off there: `no-global-this`, `prefer-active-doc`, `prefer-create-el`, `prefer-instanceof`, `prefer-window-timers`. Worker globals replace the browser/Obsidian ones.

Security rules still apply to both. For tests or workers under other names (e.g. `integration-tests/`), add the same `"off"` overrides for that path or put it in `globalIgnores`.

#### Manifest escape hatch

A published plugin id containing "obsidian" can never change. Accept it in a block scoped to the manifest (a JSON manifest can't carry a disable comment):

```js
{
    files: ["manifest.json"],
    rules: {
        "obsidianmd/validate-manifest": ["warn", { allowedWords: { id: ["obsidian"] } }],
    },
}
```

`ignore: ["noForbiddenWords"]` or `["descriptionFormat"]` skips a check group entirely.

### Using only obsidianmd rules (without the full config)

The plugin exports `ruleConfigs` with two presets you can spread into a `rules` block:

- `obsidianmd.ruleConfigs.recommended` — obsidianmd rules that do not require type information
- `obsidianmd.ruleConfigs.recommendedTypeChecked` — obsidianmd rules that require type information (includes `obsidianmd/no-misused-promises`)

As of v0.5.0 they hold **only** obsidianmd rules for source files: `@typescript-eslint/no-deprecated` moved out, and so did `validate-manifest`/`validate-license` (they need their own `files`/`language` blocks).

```js
import obsidianmd from "eslint-plugin-obsidianmd";

{
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommendedTypeChecked],
    plugins: { obsidianmd },
    rules: {
        ...obsidianmd.ruleConfigs.recommended,
        ...obsidianmd.ruleConfigs.recommendedTypeChecked,
        "@typescript-eslint/no-misused-promises": "off", // replaced by obsidianmd/no-misused-promises
        "@typescript-eslint/no-deprecated": "warn",      // no longer in ruleConfigs
    },
}
```

With `ruleConfigs` instead of `configs.recommended`, you must declare Obsidian globals (`activeDocument`, `activeWindow`, `createEl`, `sleep`, etc.) yourself; test/worker files are not exempted; third-party plugins (`@microsoft/sdl`, `import`, `no-unsanitized`, `depend`, `eslint-comments`) are not included; and `manifest.json`/`LICENSE` need their own blocks (`language: "json/json"` with `@eslint/json` 2.x, and `language: "obsidianmd/plain-text"`). Most users should stick with `configs.recommended`.

### Default severities (v0.5.0)

Most Obsidian rules are **`warn`** (warnings are publicly visible on your Scorecard, so fix them too). These are the exceptions:

| Severity | Rules |
|----------|-------|
| **`error`** | `detach-leaves`, `no-forbidden-elements`, `no-misused-promises`, `no-plugin-as-component`, `no-sample-code`, `no-static-styles-assignment`, `no-unsupported-api`, `no-view-references-in-plugin`, `platform`, `regex-lookbehind`, `rule-custom-message`, `sample-names`, `settings-tab/no-manual-html-headings`, `settings-tab/no-problematic-settings-headings` |
| **`off`** | `ui/sentence-case` (opt in manually) |
| **`warn`** | everything else — `commands/*`, `editor-drop-paste`, `hardcoded-config-path`, `no-global-this`, `no-nodejs-modules`†, `no-tfile-tfolder-cast`, `object-assign`, `prefer-abstract-input-suggest`, `prefer-active-doc`, `prefer-create-el`, `prefer-file-manager-trash-file`, `prefer-get-language`, `prefer-instanceof`, `prefer-window-timers`, `validate-license`, `validate-manifest`, `vault/iterate`, all four `settings-tab/*` declarative rules, and (in `recommendedWithLocalesEn`) the two locale sentence-case rules |

† `no-nodejs-modules` reads your `manifest.json`: it reports nothing when `"isDesktopOnly": true` (only a literal `true` counts). Override with the `isDesktopOnly` option.

### Fixes vs. suggestions (v0.5.0)

`--fix` now applies a rewrite only where it can't break type-checking. Elsewhere the same rewrite is an **editor suggestion** (💡) — review and apply it in your editor; `--fix` never applies suggestions. Rules that only reported now offer suggestions: `prefer-active-doc`, `prefer-file-manager-trash-file`, `prefer-get-language`, `object-assign`, `vault/iterate`, the `commands/*` rules, and `no-default-hotkeys`. Suggestions that need a newer Obsidian than your `minAppVersion` are not offered (`activeDocument` 0.15.0, `getFileByPath()` 1.5.7, `trashFile()` 1.6.6, `getLanguage()` 1.8.7). Renaming a command ID drops users' hotkeys for it — think before accepting that suggestion.

### Why type-aware linting matters (now bundled)

The recommended config already extends `typescript-eslint`'s **`recommendedTypeChecked`** for `.ts` files, so you get the type-aware rules automatically:

| Config | Type-aware | What it catches |
|--------|-----------|-----------------|
| `recommended` | No | Basic TS issues (no-explicit-any, etc.) |
| `recommendedTypeChecked` | Yes | + no-floating-promises, restrict-template-expressions, no-unnecessary-type-assertion, await-thenable, no-base-to-string (`no-misused-promises` is swapped for `obsidianmd/no-misused-promises`) |
| `strictTypeChecked` | Yes | + no-unsafe-assignment, no-unsafe-member-access, no-unsafe-return, no-unsafe-call |

The only thing you must supply is `parserOptions.projectService` (or `project`) so these rules can load type information — without it ESLint throws "you have used a rule which requires type information".

> **Tip:** The recommended config runs `@typescript-eslint/no-deprecated` (`warn`), which catches deprecated Obsidian APIs (e.g., `setWarning()` → `setDestructive()` in 1.13+). This only works when the `obsidian` devDependency typings are current — stale typings silently hide deprecations. Keep `"obsidian": "latest"` in your `package.json`. While `minAppVersion` is below 1.13.0 it allows `display()`, which a settings tab must still call there.

## tsconfig.json Requirements

The type-checked rules need `project` in parser options, which means your `tsconfig.json` must cover all linted files:

```json
{
    "compilerOptions": {
        "module": "ESNext",
        "target": "ES6",
        "moduleResolution": "bundler",
        "strictNullChecks": true,
        "lib": ["DOM", "ES5", "ES6", "ES7"]
    },
    "include": ["src/**/*.ts"]
}
```

> **TypeScript 5.9+ users:** Use `"bundler"` for projects using esbuild/bundlers. The `"node10"` option is deprecated and will be removed in TS 7.0. Also remove `"baseUrl"` if you're not using path aliases — it's deprecated.

> **Note:** For bundler projects (esbuild), omit `outDir` entirely — the bundler handles output. Setting `outDir: "./"` causes TypeScript to auto-exclude the project root, breaking type checking.

If you get "file not found in project" errors from ESLint, your `include` pattern doesn't match your source files.

### Strict mode recommendation

For new projects, enable full strict mode to catch more issues at compile time:
```json
{
    "compilerOptions": {
        "strict": true
    }
}
```

If migrating an existing project, be aware that your IDE may use stricter settings than your tsconfig. Running `tsc --noEmit --strict` locally catches what the IDE sees.

The patterns in this guide (Events callbacks, Setting callbacks) work correctly with strict mode enabled.

### TS2564: Property has no initializer

**Error:** `Property 'foo' has no initializer and is not definitely assigned in the constructor.`

This occurs when `strictPropertyInitialization` is enabled (part of `strict` mode). Common scenario: your tsconfig only has `strictNullChecks: true`, but your IDE applies full strict mode.

**Fix patterns:**

```typescript
// Pattern A: Definite assignment assertion (when assigned in onload/lifecycle)
export class MyPlugin extends Plugin {
    settings!: MySettings;  // ! tells TS "I'll assign this before use"
    
    async onload() {
        this.settings = await this.loadData();
    }
}

// Pattern B: Initialize with undefined-compatible type
export class MyModal extends Modal {
    result: string | undefined;  // Explicitly allow undefined
}

// Pattern C: Initialize with default value
export class MyView extends ItemView {
    wrapperEl: HTMLElement = createDiv();
}
```

**When to use each:**
- **Pattern A (`!`)**: Property assigned in `onload()`, `onOpen()`, or similar lifecycle method. Most common for plugin settings.
- **Pattern B (`| undefined`)**: Property may legitimately be unset. Requires null checks when accessing.
- **Pattern C (default value)**: Property has a sensible default. Use when the default is cheap to create.

**Debugging IDE vs build mismatch:**
```bash
# See what strict mode catches (matches most IDEs)
tsc --noEmit --strict

# Compare against your actual tsconfig
tsc --noEmit
```

If errors appear in IDE but build succeeds, either enable `strict: true` in tsconfig or apply the fix patterns above.

## Common Violations and How to Fix Them

### Loading Node.js modules (`require()` vs `import`)

**Rules:** `obsidianmd/no-nodejs-modules` (`warn`); `@typescript-eslint/no-require-imports` is **off** in v0.5.0

Node.js modules (`fs`, `path`, `os`, etc.) exist only on desktop. In a plugin that isn't `isDesktopOnly`, a static `import` of a Node built-in is always reported — it loads the module wherever the file runs and can't be guarded. Load it with a dynamic `import()` or a `require()` inside a `Platform.isDesktop` guard:

```typescript
// Bad — static import loads on mobile too (reported by no-nodejs-modules)
import * as fs from 'fs';

// Good — guarded dynamic import
if (Platform.isDesktop) {
    const fs = await import('fs');
}

// Also good — guarded require (no-require-imports is off, so no disable comment needed)
if (Platform.isDesktop) {
    const fs = require('fs') as typeof import('fs');
}
```

In a desktop-only plugin (`"isDesktopOnly": true` in `manifest.json`), top-level `import * as fs from 'fs'` is fine — esbuild converts it to `require()` in the CJS bundle. If you previously had `// eslint-disable-next-line @typescript-eslint/no-require-imports`, delete it: v0.5.0 reports it as an unused directive.

For `electron`, add a minimal type declaration file since `@types/electron` is not typically installed:

```typescript
// src/electron.d.ts
declare module 'electron' {
    const remote: { dialog: Dialog } | undefined;
    // ... only the types you actually use
}
```

Then import normally:
```typescript
import * as electron from 'electron';
```

### Unexpected control character in regular expression: `\x1b`

**Rule:** `no-control-regex`

ANSI escape parsing requires the ESC character in regex. Use the `RegExp` constructor instead of a literal:

```typescript
// Bad
const re = /\x1b\[[\d;]*m/g;

// Good
const re = new RegExp('\\x1b\\[[\\d;]*m', 'g');
```

### `value` will use Object's default stringification format

**Rule:** `@typescript-eslint/no-base-to-string` / `@typescript-eslint/restrict-template-expressions`

When accessing `Record<string, unknown>` values (common with tool inputs from JSONL), `String(value)` or template literals can produce `[object Object]`:

```typescript
// Bad — value is unknown, String() on an object gives [object Object]
const filePath = String(block.input['file_path'] || '');

// Good — type-narrow first
const filePath = typeof block.input['file_path'] === 'string'
    ? block.input['file_path']
    : '';
```

### Promises must be awaited

**Rule:** `@typescript-eslint/no-floating-promises`

Fire-and-forget promises need explicit `void`:

```typescript
// Bad
MarkdownRenderer.render(app, md, el, '', component);
navigator.clipboard.writeText(text);
this.app.workspace.revealLeaf(leaf);

// Good
void MarkdownRenderer.render(app, md, el, '', component);
void navigator.clipboard.writeText(text);
void this.app.workspace.revealLeaf(leaf);
```

### Promise returned where void expected

**Rule:** `obsidianmd/no-misused-promises` (`error`; replaced `@typescript-eslint/no-misused-promises` in v0.5.0)

Same as typescript-eslint's rule, except Obsidian's chaining `then` (on `Setting` and components) no longer counts as a Promise — so returning a `Setting` chain from a callback is no longer a false positive. Real Promises are still reported. Async callbacks in `addEventListener` or other void-expecting contexts:

```typescript
// Bad
btn.addEventListener('click', async () => {
    await doSomething();
});

// Good — wrap in void IIFE
btn.addEventListener('click', () => {
    void (async () => {
        await doSomething();
    })();
});

// Also good — just void the promise
btn.addEventListener('click', () => {
    void doSomething();
});
```

Unlike other `obsidianmd/*` rules, this one may be disabled inline. Use the new name — a disable comment naming `@typescript-eslint/no-misused-promises` still suppresses the finding but is reported as an unused directive, and `eslint --fix` deletes it:

```typescript
// Bad — reported as unused directive in v0.5.0
// eslint-disable-next-line @typescript-eslint/no-misused-promises -- handler catches its own errors

// Good
// eslint-disable-next-line obsidianmd/no-misused-promises -- handler catches its own errors
```

### Async function has no `await` expression

**Rule:** `@typescript-eslint/require-await`

Note: `eslint-plugin-obsidianmd` **disables** this rule in its recommended config. The community scanner may still flag it. If your function doesn't need `await`, remove `async`:

```typescript
// Bad
async function listFiles(): Promise<string[]> {
    return fs.readdirSync(dir); // sync operation, no await
}

// Good
function listFiles(): string[] {
    return fs.readdirSync(dir);
}
```

For interface overrides (like `ItemView.onOpen()`) that require `Promise<void>` return type but have no async work:

```typescript
onOpen(): Promise<void> {
    // ... sync setup ...
    return Promise.resolve();
}
```

### This assertion is unnecessary

**Rule:** `@typescript-eslint/no-unnecessary-type-assertion`

After `instanceof` or `Array.isArray()`, TypeScript narrows the type automatically:

```typescript
// Bad
if (view instanceof TimelineView) {
    (view as TimelineView).doSomething(); // cast is redundant
}

// Good
if (view instanceof TimelineView) {
    view.doSomething();
}
```

For `querySelectorAll` results, use the generic form instead of casting:

```typescript
// Bad
const els = el.querySelectorAll('.my-class') as NodeListOf<HTMLElement>;

// Good
const els = el.querySelectorAll<HTMLElement>('.my-class');
```

### Disabling rule `X` is not allowed

The recommended config forbids `eslint-disable` comments for certain rules via the bundled `eslint-comments/no-restricted-disable` rule, which covers `obsidianmd/*` (**except** `obsidianmd/no-misused-promises`), `no-console`, `no-restricted-globals`, `@typescript-eslint/no-restricted-imports`, `no-alert`, `@typescript-eslint/no-deprecated`, `@typescript-eslint/no-explicit-any`, `no-eval`, `@microsoft/sdl/no-document-write`, `@microsoft/sdl/no-inner-html`, and `obsidianmd/no-nodejs-modules`. Fix the underlying issue instead of suppressing it — or, where a finding can never be acted on, use a config-level override (see [Customizing rules](#customizing-rules)). The scanner enforces these for newly submitted plugins at `error`.

Locally, unused disable directives are reported as errors (`reportUnusedDisableDirectives`). v0.5.0 turned off or renamed several rules, so these old comments now fail as unused: `@typescript-eslint/no-misused-promises` (rename to `obsidianmd/no-misused-promises`), `@typescript-eslint/no-require-imports` (delete), `no-undef` in `.ts` files (delete), and `no-implied-eval` in `.ts` files (rename to `@typescript-eslint/no-implied-eval`).

### ESLint directive comments require descriptions

All `eslint-disable` comments must include a `-- description` explaining why the suppression is necessary. Directives without descriptions produce warnings.

```typescript
// Bad — triggers "Unexpected undescribed directive comment"
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const value = obj.field!;

// Good
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed by earlier null check in parseConfig
const value = obj.field!;
```

This applies to all directive forms: `eslint-disable`, `eslint-disable-next-line`, and `eslint-disable-line`.

### Unsafe assignment of `any` value

**Rule:** `@typescript-eslint/no-unsafe-assignment`

Common with `JSON.parse()`. Add a type assertion:

```typescript
// Bad
const data = JSON.parse(raw);

// Good
interface MyData { field: string; count: number }
const data = JSON.parse(raw) as MyData;
```

### Unexpected console statement

**Rule:** `no-console`

Only `console.warn`, `console.error`, and `console.debug` are allowed. Use `console.debug` instead of `console.log` or `console.info`.

### Using `document` or `window` directly

**Rule:** `obsidianmd/prefer-active-doc` (`warn` as of v0.5.0 — it was `off` through v0.4.2)

For popout window compatibility, use `activeDocument` (or an element's own `el.doc`) instead of the global `document`:

```typescript
// Bad
document.body.addClass('my-plugin');
const hit = document.querySelector('.my-plugin');
window.addEventListener('resize', onResize);   // not linted, but leaks across popouts

// Good
activeDocument.body.addClass('my-plugin');
const hit = containerEl.doc.querySelector('.my-plugin'); // the element's own document
this.registerDomEvent(activeWindow, 'resize', onResize);
```

The rule reports only the bare global `document` — not `window`, `window.document`, type positions, property names, or local bindings named `document`. It has **no autofix**: it offers an editor suggestion (`document` → `activeDocument`), because whether code should follow the focused window or a specific element's window depends on what it does. No suggestion is offered after an environment check (`typeof document`), where `document` is compared (`e.target === document`) or stored for later, or when `minAppVersion` is below 0.15.0. Test and web worker files are exempt.

`document.createElement()` and the other calls `prefer-create-el` reports are left to that rule in type-checked TypeScript files, so they aren't reported twice.

`prefer-active-doc` deliberately skips `window.setTimeout()`, `window.setInterval()`, and related timer calls. Timers belong on `window`, not `activeWindow` — see `prefer-window-timers` below.

**Caution:** `activeDocument`/`activeWindow` are dynamic getters that follow window focus — two calls may return different objects. Capture the value in a variable when the same document is needed later (e.g., listener cleanup), or use `registerDomEvent()`, which captures the target at registration. The linter does not catch this; see [memory-management.md](memory-management.md) for the full pattern.

### Using bare `setTimeout`/`setInterval`

**Rule:** `obsidianmd/prefer-window-timers` (named `prefer-active-window-timers` before v0.4.0)

```typescript
// Bad
setTimeout(() => {}, 100);
setInterval(() => {}, 1000);
activeWindow.setTimeout(() => {}, 100);   // also flagged

// Good
window.setTimeout(() => {}, 100);
window.setInterval(() => {}, 1000);
```

The rule covers `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `requestAnimationFrame`, and (v0.5.0) `cancelAnimationFrame`. Locally declared functions with those names are not flagged, and test and web worker files are exempt.

**Fix vs. suggestion (v0.5.0):** with `@types/node` installed, bare `setTimeout()` returns `NodeJS.Timeout`, while `window.setTimeout()` returns `number`. So `--fix` rewrites only where no type can change — a discarded `setTimeout()`/`setInterval()` result, a `clear*()` with a `number` argument, `requestAnimationFrame()`/`cancelAnimationFrame()`, and `activeWindow.*` calls. A stored timer gets a suggestion instead; change its type to `number` when you accept it:

```typescript
// Bad — reported, suggestion only (fixing would break a NodeJS.Timeout field)
private timer: NodeJS.Timeout = setTimeout(save, 1000);

// Good
private timer: number = window.setTimeout(save, 1000);
```

No fix is offered where `window` is shadowed (e.g. a Playwright page named `window`) or after a check showing the code may run without a window (`typeof window === "undefined"`).

### Obsidian Events callback typing

**Rule:** Strict mode incompatibility with `Events.on()` callbacks

The Obsidian `Events` class (used by `Plugin`, `Component`, custom event emitters) has this signature:
```typescript
on(name: string, callback: (...data: unknown[]) => unknown, ctx?: unknown): EventRef
```

Inline typed parameters fail with strict mode:
```typescript
// Bad — strict mode error
this.peerManager.on('transfer-request', (data: { files: File[] }) => {
    // TS2345: Type '(data: { files: File[] }) => void' is not assignable...
});

// Good — cast inside the callback
this.peerManager.on('transfer-request', (rawData) => {
    const data = rawData as { files: File[] };
    // use data.files
});
```

For simple pass-through (just re-emitting), no cast needed:
```typescript
// Good — trigger accepts unknown
peer.on('file-received', (data) => {
    this.trigger('file-received', data);
});
```

### Setting component callback typing

Obsidian's `Setting` component callbacks (`Dropdown.onChange`, `Toggle.onChange`, etc.) expect generic signatures:

```typescript
// Dropdown.onChange expects (value: string) => any
// Toggle.onChange expects (value: boolean) => any
```

Using narrower types inline fails:
```typescript
// Bad — strict mode error
.onChange(async (value: 'auto' | 'manual') => {
    this.settings.mode = value;
});

// Good — cast inside
.onChange(async (value) => {
    const mode = value as 'auto' | 'manual';
    this.settings.mode = mode;
});
```

### Detecting user language incorrectly

**Rule:** `obsidianmd/prefer-get-language`

Obsidian provides `getLanguage()` to detect the user's language setting. Don't use `localStorage` or third-party i18n detection libraries:

```typescript
// Bad
const lang = localStorage.getItem('language');
import LanguageDetector from 'i18next-browser-languagedetector';

// Good
import { getLanguage } from 'obsidian';
const lang = getLanguage();
```

### Using native DOM methods instead of Obsidian helpers

**Rule:** `obsidianmd/prefer-create-el` (`warn`; needs type information)

Obsidian provides DOM helper methods that are cleaner and more consistent. The most popout-safe form is to create the element **on a parent** that already lives in the right window:

```typescript
// Bad
const div = document.createElement('div');
const frag = document.createDocumentFragment();
const p = activeDocument.createElement('p');
const p2 = activeWindow.createEl('p');      // TS2339: 'createEl' does not exist on type 'Window'

// Good
const div2 = containerEl.createDiv({ cls: 'my-class' }); // child of an element in the right window
const p3 = containerEl.createEl('p');
const div = createDiv();                                  // detached, global helper
const frag = createFragment();
```

**`activeWindow.createEl()` does not compile.** Obsidian's typings declare `activeWindow` (and `el.win`, `doc.win`) as a plain `Window`; the DOM helpers are declared only as globals and on `Node`/`HTMLElement`. That's why v0.5.0 no longer autofixes `activeDocument.createElement()` → `activeWindow.createEl()` — it offers it only as an editor suggestion, which you should **not** accept as-is. Rewrite to a parent-element helper instead (`containerEl.createEl('p')`).

What `--fix` does in v0.5.0: global `document.createElement('p')` → `createEl('p')` and `createEl('div')` → `createDiv()` are fixed when the types prove the helper exists; tag names typed as plain `string`, custom elements, and deprecated tags are reported with no fix. Elements created in an iframe's document (`iframe.contentDocument`) are not reported. Test and web worker files are exempt.

### Using Node.js modules without platform guard

**Rule:** `obsidianmd/no-nodejs-modules`

Node.js built-in modules (`fs`, `path`, `os`, etc.) are only available on desktop. Guard imports with `Platform.isDesktop`:

> This rule reads your `manifest.json`: it reports nothing when `"isDesktopOnly": true` (only a literal `true` counts — `"false"` or `1` keeps it reporting). In a desktop-only repo, raising its severity does **not** turn it back on; use `["error", { isDesktopOnly: false }]`. For tooling or a CLI with no manifest, scope `["warn", { isDesktopOnly: true }]` to those files. The rule can't be disabled inline.

```typescript
// Bad - breaks on mobile
import * as fs from 'fs';
fs.readFileSync(path);

// Good - guarded for desktop only
import { Platform } from 'obsidian';

if (Platform.isDesktop) {
    const fs = await import('fs');
    fs.readFileSync(path);
}
```

Also counted as guarded: the `else` of `if (!Platform.isDesktop)`, the right side of `Platform.isDesktop && …` or `!Platform.isDesktop || …`, and the body of a function whose first statement is `if (!Platform.isDesktop) return;` (but not its default parameters). Type-only imports (`import type { Stats } from 'fs'`) are not reported. v0.5.0 also reports `window.require('fs')`, `activeWindow.require('fs')`, `export … from 'fs'`, and `import fs = require('fs')`.

### Restricted HTTP/util imports (use Obsidian built-ins)

**Rule:** `@typescript-eslint/no-restricted-imports` (configured by `recommended`)

The recommended config flags HTTP clients and `moment`, because Obsidian bundles equivalents:

```typescript
// Bad — use requestUrl() instead (axios, got, ky, node-fetch, ofetch, superagent)
import axios from 'axios';

// Good
import { requestUrl } from 'obsidian';

// moment is bundled with Obsidian — don't add it as a dependency
// Bad
import moment from 'moment';

// Good — the value comes from 'obsidian'
import { moment } from 'obsidian';

// Type-only imports from 'moment' ARE allowed (allowTypeImports):
import type { Moment } from 'moment';
```

The same rule warns on restricted globals: `app` (use your plugin's reference), `fetch` (use `requestUrl`), and `localStorage` (use `App#saveLocalStorage`/`loadLocalStorage`).

## Running the Lint

Run from the project root so `package.json`, `manifest.json`, and `LICENSE` are linted too:

```bash
# Good — lints source plus package.json, manifest.json, LICENSE
npx eslint .

# Bad — never visits manifest.json/LICENSE/package.json; their checks silently do nothing
npx eslint src/
```

Type-checked linting is slower than basic linting because it loads the TypeScript program. For a typical Obsidian plugin, expect 3-10 seconds.

## Checklist Before Submission

1. `npm run build` succeeds
2. `npx eslint .` (from the project root) shows zero errors and zero warnings
3. All tests pass
4. No unguarded Node.js modules: every `require()`/`import()` of a Node built-in sits behind `Platform.isDesktop` (unless `isDesktopOnly: true`) — check with `grep -rn "require(\|import(" src/`
5. No `console.log` or `console.info` calls
6. No unhandled promises (search for `MarkdownRenderer.render`, `clipboard.writeText`, `workspace.revealLeaf` without `void`/`await`)
7. No bare `document` usage (use `activeDocument` or `el.doc`); no `window` for DOM work (use `activeWindow`), except timers
8. No bare `setTimeout`/`setInterval` and no `activeWindow.setTimeout()` (use `window.setTimeout()` etc.)
9. Use `getLanguage()` instead of `localStorage.getItem('language')` for i18n
10. DOM listeners on `document`/`window`/long-lived elements use `registerDomEvent()` — the linter does not flag manual `addEventListener` (check with `grep -rn "addEventListener" src/`)

## Troubleshooting

### `WARNING: You are currently running a version of TypeScript which is not officially supported`

**Cause:** You have old `@typescript-eslint/parser` v7.x installed, which only supports TypeScript <5.6.0. TypeScript 5.9+ triggers this warning.

**Fix:** Migrate to the unified `typescript-eslint` v8.x package:
```bash
npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint && \
npm install -D typescript@latest eslint typescript-eslint @typescript-eslint/parser eslint-plugin-obsidianmd
```

Then update your `eslint.config.mjs` to import the parser from `typescript-eslint`:
```js
import tseslint from "typescript-eslint";
// Use tseslint.parser or import @typescript-eslint/parser separately
```

### `ERESOLVE unable to resolve dependency tree`

**Cause:** npm refuses to install because of peer dependency conflicts. Usually means:
1. TypeScript version is too old (need >=4.8.4 for typescript-eslint 8.x)
2. Old @typescript-eslint packages are still in package.json

**Fix:** Uninstall old packages and upgrade TypeScript in one command:
```bash
npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint && \
npm install -D typescript@latest eslint typescript-eslint @typescript-eslint/parser eslint-plugin-obsidianmd
```

### `TypeError: scopeManager.addGlobals is not a function`

**Cause:** Version conflict between old `@typescript-eslint/*` packages (v5-7) and new `typescript-eslint` (v8+).

**Fix:** Remove the old packages completely:
```bash
npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D typescript-eslint @typescript-eslint/parser
```

### `Parsing error: Unexpected character 'e' found` (or similar)

**Cause:** TypeScript files aren't being parsed as TypeScript. Usually means:
1. TypeScript version is too old (need 5.x+ for typescript-eslint 8.x)
2. Parser isn't configured correctly
3. Version conflicts between packages

**Fix:**
```bash
npm install -D typescript@latest
# Then reinstall eslint packages
npm uninstall eslint typescript-eslint @typescript-eslint/parser eslint-plugin-obsidianmd
npm install -D eslint typescript-eslint @typescript-eslint/parser eslint-plugin-obsidianmd
```

### `Error while loading rule: You have used a rule which requires type information`

**Cause:** `parserOptions` isn't set, or the file being linted isn't included in any `tsconfig.json`.

**Fix:** Use `projectService` with `allowDefaultProject` for files outside your tsconfig:
```js
languageOptions: {
    parserOptions: {
        projectService: {
            allowDefaultProject: ["eslint.config.*"],
        },
    },
}
```

If using the older `project` approach instead, ensure your tsconfig.json includes your source files:
```json
{
    "include": ["src/**/*.ts"]
}
```

### "… requires type information" on `LICENSE`, `manifest.json`, or `package.json`

**Cause:** A type-checked config added without `files` (e.g. a top-level `...tseslint.configs.strictTypeChecked`) reaches the files the recommended config lints by name. New in v0.5.0 for `manifest.json` and `LICENSE`.

**Fix:** Scope it with `files: ["**/*.ts"]` (see [Layering stricter typescript-eslint configs](#layering-stricter-typescript-eslint-configs)). If the unscoped config comes from somewhere you can't edit, add these blocks **last**:
```js
{
    files: ["package.json", "manifest.json", "LICENSE", "LICENSE.md", "LICENSE.txt"],
    extends: [tseslint.configs.disableTypeChecked],
},
{
    files: ["**/*.ts"],
    rules: { "@typescript-eslint/no-misused-promises": "off" },
},
```

### `could not find plugin "@typescript-eslint"` (or `"import"`)

**Cause:** A rule-override block without `files` sets a `@typescript-eslint/*` or `import/*` rule and reaches `package.json`/`manifest.json`/`LICENSE`, where those plugins aren't registered.

**Fix:** Add `files: ["**/*.{ts,cts,mts,tsx,js,cjs,mjs,jsx}"]` to the block (see [Scope overrides with `files`](#scope-overrides-with-files)).

### `Cannot redefine plugin "json"` or `Cannot redefine plugin "@typescript-eslint"`

**Cause:** Your config imports `@eslint/json` or `typescript-eslint` itself, and your project has a different copy from the one the plugin uses. Most often `@eslint/json` 0.x next to v0.5.0's 2.x, or Yarn 1 with an exact version pin.

**Fix:** Upgrade `@eslint/json` to 2.x (or remove it if your config doesn't import it). With Yarn 1, use a caret range (`"^8.59.1"`) or `resolutions`. `npm ls typescript-eslint @eslint/json` lists the copies.

### `Cannot read properties of undefined (reading 'includes')` with `--fix-dry-run`

**Cause:** `parserOptions.project` + TypeScript 6 in typescript-eslint's single-run mode. The recommended config turns single-run off under `--fix-dry-run`. If you fix via ESLint's API with `CI=true`, set `parserOptions.disallowAutomaticSingleRunInference: true`, or use `projectService` instead.

### npm `ERESOLVE overriding peer dependency` with ESLint 10

**Cause:** Three bundled plugins (`@microsoft/eslint-plugin-sdl`, `eslint-plugin-import`, `eslint-plugin-react`) don't declare ESLint 10 support yet. Linting works; ignore the warnings. With `strict-peer-deps` the install fails — turn the setting off or use ESLint 9.

### `file not found in project` errors

**Cause:** The file being linted isn't included in your tsconfig.json's `include` pattern.

**Fix:** Update tsconfig.json to include all source files:
```json
{
    "include": ["src/**/*.ts"]
}
```

### Package manager conflicts (pnpm/npm/yarn mixing)

**Cause:** Using pnpm on a project that was set up with npm (or vice versa) causes packages to be moved to `node_modules/.ignored`.

**Fix:** Stick to one package manager. To switch cleanly:
```bash
rm -rf node_modules package-lock.json pnpm-lock.yaml yarn.lock
# Then use your preferred package manager:
npm install  # or pnpm install
```

### ESLint can't find the config file

**Cause:** Using `.eslintrc.*` (old format) instead of `eslint.config.mjs` (flat config).

**Fix:** ESLint 9+ uses flat config by default. Remove old config files and create `eslint.config.mjs`:
```bash
rm -f .eslintrc .eslintrc.js .eslintrc.json .eslintrc.yml
# Then create eslint.config.mjs with the config from this guide
```

### tsconfig.json shows errors in VSCode/VSCodium (TypeScript 5.9+)

**Cause:** TypeScript 5.9+ deprecated several tsconfig options:
- `moduleResolution: "node"` — deprecated, use `"bundler"` for esbuild projects or `"node10"` for tsc-only
- `baseUrl` — deprecated (removed in TS 7.0), remove if not using path aliases

**Fix:** Update tsconfig.json:
```json
{
    "compilerOptions": {
        "moduleResolution": "bundler"
        // Remove "baseUrl" if you're not using path aliases
    }
}
```
