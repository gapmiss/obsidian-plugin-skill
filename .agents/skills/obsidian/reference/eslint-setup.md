# Setting Up ESLint for Obsidian Community Plugin Submission

The Obsidian community plugin review runs an automated scan that checks your code against a specific set of lint rules. If your local ESLint setup doesn't match what the scanner checks, you'll submit with a clean local lint and get back a wall of violations.

This guide covers the complete setup so your local `npx eslint .` catches exactly what the community scanner catches.

## What the Community Scanner Actually Checks

The scanner runs `eslint-plugin-obsidianmd`'s recommended config, which **as of v0.4.0 bundles the `typescript-eslint` recommended type-checked rules itself** (plus `import`, `@microsoft/sdl`, `depend`, and `no-unsanitized`). In older versions you had to add the typescript-eslint type-checked rules separately; now `...obsidianmd.configs.recommended` alone gives you the same ruleset the scanner uses.

Full scanner behavior (rule sets, checks beyond ESLint, Scorecard mechanics) is documented in [community-scanner.md](community-scanner.md).

## Prerequisites

### For New Projects

```bash
npm install -D eslint @eslint/js @eslint/json typescript-eslint eslint-plugin-obsidianmd
```

`@eslint/js`, `@eslint/json`, `eslint`, and `typescript-eslint` are peer dependencies of v0.4.0 (npm 7+ auto-installs them). You don't need `@typescript-eslint/parser` separately — `typescript-eslint` provides the parser as `tseslint.parser`.

### Migrating Existing Projects (IMPORTANT)

If your project has old ESLint packages (common in plugins created before 2024), you must clean up before installing.

#### Quick Migration (One Command)

If you have TypeScript 4.x, this single command upgrades everything at once:

```bash
npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint && \
npm install -D typescript@latest eslint typescript-eslint @typescript-eslint/parser eslint-plugin-obsidianmd
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

`typescript-eslint` v8.x requires **TypeScript >=4.8.4**. Include TypeScript in the install to avoid ERESOLVE errors:

```bash
npm install -D typescript@latest eslint typescript-eslint @typescript-eslint/parser eslint-plugin-obsidianmd
```

> **Why include TypeScript?** If your project has TypeScript 4.7.x or older, npm will refuse to install `typescript-eslint` with `ERESOLVE unable to resolve dependency tree`. Installing TypeScript in the same command resolves this.

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
- `ERESOLVE unable to resolve dependency tree` — TypeScript too old, or old packages still installed
- `TypeError: scopeManager.addGlobals is not a function` — version conflict between old and new packages
- `Parsing error: Unexpected character 'e' found` — parser not loading due to version mismatch
- `peer eslint@"^6.0.0 || ^7.0.0 || ^8.0.0"` warnings — old @typescript-eslint packages don't support ESLint 9+

### Version Requirements

Versions at time of writing:
- `eslint-plugin-obsidianmd` 0.4.0
- `typescript-eslint` 8.x
- `eslint` 9.19+ (flat config)
- `typescript` 5.x+ (required for typescript-eslint 8.x)

v0.4.0 declares `@eslint/js`, `@eslint/json`, `eslint`, and `typescript-eslint` as **peer dependencies** (npm 7+ auto-installs them). Everything else the config needs — `eslint-plugin-import`, `@microsoft/eslint-plugin-sdl`, `eslint-plugin-depend`, `eslint-plugin-no-unsanitized`, `eslint-comments` — ships bundled inside the plugin, so you don't install those yourself.

**TypeScript 5.9+ notes:**
- `moduleResolution: "node"` shows deprecation warning → use `"bundler"` for esbuild/bundler projects, or `"node10"` for tsc-only builds
- `baseUrl` is deprecated (removed in TS 7.0) → remove if not using path aliases

**v0.4.0 changes:**
- `configs.recommended` is now self-contained: it bundles `typescript-eslint` recommendedTypeChecked, `import`, `@microsoft/sdl`, `depend`, `no-unsanitized`, and `eslint-comments`, and injects the Obsidian globals. You no longer add the typescript-eslint type-checked config yourself.
- New `recommendedWithLocalesEn` config adds sentence-case checks for English locale files.
- Most Obsidian rules are now `warn` (were `error` in v0.3.0); see the severity table below.
- `ui/sentence-case` is re-enabled (`warn`); `prefer-active-doc` remains `off`.
- Four new `settings-tab` declarative-settings rules (Obsidian 1.13+): `require-display`, `prefer-setting-definitions`, `prefer-update-over-display`, `no-deprecated-display` — all gated on your manifest's `minAppVersion`.
- `no-global-this` and `@typescript-eslint/no-deprecated` added (both `warn`).
- `no-nodejs-modules` now reads `manifest.json` (`off` when `isDesktopOnly`).
- `moment`, `axios`, `got`, `ky`, `node-fetch`, etc. are restricted imports (use Obsidian's `moment` / `requestUrl`); type-only `moment` imports are allowed.
- `eslint-comments` rules enforced: disable directives need descriptions, and `obsidianmd/*` (plus `no-console`, etc.) can't be disabled inline.

## The Complete ESLint Config

### Recommended Config (start here)

As of **v0.4.0**, `obsidianmd.configs.recommended` is self-contained — it bundles ESLint's `js.recommended`, `typescript-eslint` (recommendedTypeChecked for `.ts`), all Obsidian rules, plus `import`, `@microsoft/sdl`, `depend`, `no-unsanitized`, and `eslint-comments`, and it injects the Obsidian globals (`activeDocument`, `createDiv`, `sleep`, …). You no longer compose `tseslint.configs.recommendedTypeChecked` yourself. This is the same ruleset the community scanner runs.

You only add one thing: a TypeScript block that points the type-checked rules at your `tsconfig.json`.

```js
// eslint.config.mjs
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
    { ignores: ["node_modules/**", "main.js", "*.mjs"] },
    ...obsidianmd.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
            },
        },
    },
]);
```

> **Don't ignore `package.json`.** The recommended config lints it (via `@eslint/json` + `depend/ban-dependencies`) to catch dependencies replaceable by built-ins. The older config ignored it — drop `package.json`, `tsconfig.json`, and `versions.json` from `ignores`.

> **Match the bundle's glob.** The recommended config applies type-checked rules to every `**/*.ts` file, so scope your `parserOptions.project` block to `**/*.ts` (not `src/**/*.ts`), or you'll get "you have used a rule which requires type information" on any `.ts` outside `src/`. Alternatively set `parserOptions.projectService: true` to auto-discover the tsconfig per file.

### Locale checks: `recommendedWithLocalesEn`

For sentence-case enforcement on English locale files, swap `recommended` for `recommendedWithLocalesEn` — it adds `ui/sentence-case-json` (matches `en*.json`) and `ui/sentence-case-locale-module` (matches `en*.ts` / `en*.js`) on top of everything in `recommended`.

### Customizing rules

The recommended set is opinionated, and the scanner forbids disabling certain rules inline (see "Disabling rule `X` is not allowed" below), so prefer config-level overrides over `eslint-disable` comments:

```js
export default defineConfig([
    ...obsidianmd.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: { project: "./tsconfig.json", sourceType: "module" },
        },
        rules: {
            "obsidianmd/sample-names": "off",        // turn a rule off
            "obsidianmd/prefer-active-doc": "warn",  // opt into a rule that's off by default
        },
    },
]);
```

### Default severities (v0.4.0)

Most Obsidian rules are **`warn`** in v0.4.0 (warnings are publicly visible on your Scorecard, so fix them too). These are the exceptions:

| Severity | Rules |
|----------|-------|
| **`error`** | `detach-leaves`, `no-forbidden-elements`, `no-sample-code`, `no-static-styles-assignment`, `platform`, `regex-lookbehind`, `sample-names`, `no-plugin-as-component`, `no-view-references-in-plugin`, `no-unsupported-api`, `rule-custom-message`, `settings-tab/no-manual-html-headings`, `settings-tab/no-problematic-settings-headings` |
| **`off`** | `prefer-active-doc` (enable manually for popout support) |
| **`warn`** | everything else — `commands/*`, `no-global-this`, `no-nodejs-modules`†, `object-assign`, `prefer-create-el`, `prefer-instanceof`, `prefer-window-timers`, `prefer-get-language`, `ui/sentence-case`, `vault/iterate`, and all four `settings-tab/*` declarative rules |

† `no-nodejs-modules` reads your `manifest.json`: **`off`** when `isDesktopOnly: true`, otherwise `warn`.

### Why type-aware linting matters (now bundled)

The recommended config already extends `typescript-eslint`'s **`recommendedTypeChecked`** for `.ts` files, so you get the type-aware rules automatically:

| Config | Type-aware | What it catches |
|--------|-----------|-----------------|
| `recommended` | No | Basic TS issues (no-explicit-any, etc.) |
| `recommendedTypeChecked` | Yes | + no-floating-promises, no-require-imports, restrict-template-expressions, no-unnecessary-type-assertion, require-await, no-misused-promises, await-thenable, no-base-to-string |
| `strictTypeChecked` | Yes | + no-unsafe-assignment, no-unsafe-member-access, no-unsafe-return, no-unsafe-call |

The only thing you must supply is `parserOptions.project` (or `projectService`) so these rules can load type information — without it ESLint throws "you have used a rule which requires type information".

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
    containerEl: HTMLElement = document.createElement('div');
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

### `require()` style import is forbidden

**Rule:** `@typescript-eslint/no-require-imports`

Obsidian plugins run in Electron, so Node.js modules (`fs`, `path`, `os`, etc.) are available. Use top-level ES imports — esbuild converts them to `require()` in the CJS bundle:

```typescript
// Bad
const fs = require('fs') as typeof import('fs');

// Good
import * as fs from 'fs';
```

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

**Rule:** `@typescript-eslint/no-misused-promises`

Async callbacks in `addEventListener` or other void-expecting contexts:

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

The community scanner forbids `eslint-disable` comments for certain rules. In v0.4.0 this is enforced by the bundled `eslint-comments/no-restricted-disable` rule, which covers `obsidianmd/*`, `no-console`, `no-restricted-globals`, `@typescript-eslint/no-restricted-imports`, `no-alert`, `@typescript-eslint/no-deprecated`, `@typescript-eslint/no-explicit-any`, `no-eval`, the `@microsoft/sdl` rules, and `no-nodejs-modules`. Fix the underlying issue instead of suppressing it. Unused disable directives are also reported as errors (`reportUnusedDisableDirectives`).

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

**Rule:** `obsidianmd/prefer-active-doc`

For popout window compatibility, use `activeDocument` and `activeWindow`:

```typescript
// Bad
document.createElement('div');
window.setTimeout(() => {}, 100);

// Good
activeDocument.createElement('div');
activeWindow.setTimeout(() => {}, 100);
```

**Caution:** `activeDocument`/`activeWindow` are dynamic getters that follow window focus — two calls may return different objects. Capture the value in a variable when the same document is needed later (e.g., listener cleanup), or use `registerDomEvent()`, which captures the target at registration. The linter does not catch this; see [memory-management.md](memory-management.md) for the full pattern.

### Using bare `setTimeout`/`setInterval`

**Rule:** `obsidianmd/prefer-window-timers` (named `prefer-active-window-timers` before v0.4.0)

```typescript
// Bad
setTimeout(() => {}, 100);
setInterval(() => {}, 1000);

// Good
activeWindow.setTimeout(() => {}, 100);
activeWindow.setInterval(() => {}, 1000);
```

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

**Rule:** `obsidianmd/prefer-create-el` (new in v0.2.5)

Obsidian provides DOM helper methods that are cleaner and more consistent:

```typescript
// Bad
const div = document.createElement('div');
const frag = document.createDocumentFragment();

// Good
const div = createDiv();
const div2 = containerEl.createDiv({ cls: 'my-class' });
const frag = createFragment();
```

### Using Node.js modules without platform guard

**Rule:** `obsidianmd/no-nodejs-modules`

Node.js built-in modules (`fs`, `path`, `os`, etc.) are only available on desktop. Guard imports with `Platform.isDesktop`:

> **v0.4.0:** this rule reads your `manifest.json` — it's automatically **off** when `isDesktopOnly: true`, and `warn` otherwise. You don't need to disable it manually in desktop-only plugins.

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

### Restricted HTTP/util imports (use Obsidian built-ins)

**Rule:** `@typescript-eslint/no-restricted-imports` (configured by `recommended`)

v0.4.0 flags HTTP clients and `moment`, because Obsidian bundles equivalents:

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

```bash
npx eslint src/
```

Type-checked linting is slower than basic linting because it loads the TypeScript program. For a typical Obsidian plugin, expect 3-10 seconds.

## Checklist Before Submission

1. `npm run build` succeeds
2. `npx eslint src/` shows zero errors
3. All tests pass
4. No `require()` calls in source (check with `grep -r "require(" src/ --include="*.ts"`)
5. No `console.log` or `console.info` calls
6. No unhandled promises (search for `MarkdownRenderer.render`, `clipboard.writeText`, `workspace.revealLeaf` without `void`/`await`)
7. No bare `document`/`window` usage (use `activeDocument`/`activeWindow`)
8. No bare `setTimeout`/`setInterval` (use `activeWindow.setTimeout()` etc.)
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

**Cause:** The `parserOptions.project` isn't set, or `tsconfig.json` doesn't include the files being linted.

**Fix:** Ensure your eslint.config.mjs has:
```js
parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
}
```

And your tsconfig.json includes your source files:
```json
{
    "include": ["src/**/*.ts"]
}
```

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
