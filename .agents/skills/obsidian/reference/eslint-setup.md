# Setting Up ESLint for Obsidian Community Plugin Submission

The Obsidian community plugin review runs an automated scan that checks your code against a specific set of lint rules. If your local ESLint setup doesn't match what the scanner checks, you'll submit with a clean local lint and get back a wall of violations.

This guide covers the complete setup so your local `npx eslint .` catches exactly what the community scanner catches.

## What the Community Scanner Actually Checks

The scanner uses **two rule sets together**:

1. **`eslint-plugin-obsidianmd`** — 36 Obsidian-specific rules (DOM safety, command naming, platform APIs, popout window compatibility, etc.)
2. **`typescript-eslint` recommended type-checked** — Standard TypeScript rules (`no-floating-promises`, `no-require-imports`, `restrict-template-expressions`, `no-unnecessary-type-assertion`, etc.)

The critical mistake is configuring only the obsidianmd plugin rules without the typescript-eslint type-checked rules. You must add both.

## Prerequisites

```bash
npm install -D eslint typescript-eslint @typescript-eslint/parser eslint-plugin-obsidianmd
```

Versions at time of writing:
- `eslint-plugin-obsidianmd` 0.2.8
- `typescript-eslint` 8.x
- `eslint` 9.x or 10.x (flat config)

## The Complete ESLint Config

### Simple Config (Recommended)

As of v0.2.5, `configs.recommended` properly scopes TypeScript rules to `.ts` files:

```js
// eslint.config.mjs
import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
    { ignores: ["node_modules/**", "main.js", "*.mjs", "package.json", "package-lock.json", "versions.json", "tsconfig.json"] },
    ...tseslint.configs.recommendedTypeChecked.map(config => ({
        ...config,
        files: ["src/**/*.ts"],
    })),
    ...obsidianmd.configs.recommended,
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
            },
        },
    },
];
```

### Explicit Config (Full Control)

If you need to customize rule severity or add overrides:

```js
// eslint.config.mjs
import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
    {
        ignores: ["node_modules/**", "main.js", "*.mjs", "package.json", "package-lock.json", "versions.json", "tsconfig.json"],
    },
    // TypeScript-ESLint recommended rules WITH type checking
    ...tseslint.configs.recommendedTypeChecked.map(config => ({
        ...config,
        files: ["src/**/*.ts"],
    })),
    // Obsidian plugin rules + project config
    {
        files: ["src/**/*.ts"],
        plugins: {
            obsidianmd,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
            },
            globals: {
                activeDocument: "readonly",
                activeWindow: "readonly",
            },
        },
        rules: {
            // All obsidianmd rules (v0.2.8)
            "obsidianmd/commands/no-command-in-command-id": "error",
            "obsidianmd/commands/no-command-in-command-name": "error",
            "obsidianmd/commands/no-default-hotkeys": "error",
            "obsidianmd/commands/no-plugin-id-in-command-id": "error",
            "obsidianmd/commands/no-plugin-name-in-command-name": "error",
            "obsidianmd/settings-tab/no-manual-html-headings": "error",
            "obsidianmd/settings-tab/no-problematic-settings-headings": "error",
            "obsidianmd/vault/iterate": "error",
            "obsidianmd/detach-leaves": "error",
            "obsidianmd/editor-drop-paste": "error",
            "obsidianmd/hardcoded-config-path": "error",
            "obsidianmd/no-forbidden-elements": "error",
            "obsidianmd/no-nodejs-modules": "error",
            "obsidianmd/no-plugin-as-component": "error",
            "obsidianmd/no-sample-code": "error",
            "obsidianmd/no-tfile-tfolder-cast": "error",
            "obsidianmd/no-view-references-in-plugin": "error",
            "obsidianmd/no-static-styles-assignment": "error",
            "obsidianmd/object-assign": "error",
            "obsidianmd/platform": "error",
            "obsidianmd/prefer-create-el": "error",
            "obsidianmd/prefer-file-manager-trash-file": "warn",
            "obsidianmd/prefer-instanceof": "error",
            "obsidianmd/prefer-get-language": "error",
            "obsidianmd/prefer-abstract-input-suggest": "error",
            "obsidianmd/prefer-active-window-timers": "error",
            "obsidianmd/prefer-active-doc": "error",
            "obsidianmd/regex-lookbehind": "error",
            "obsidianmd/sample-names": "error",
            "obsidianmd/no-unsupported-api": "error",
            "obsidianmd/ui/sentence-case": ["error", { enforceCamelCaseLower: true }],
            // Console: scanner allows warn, error, debug only
            "no-console": ["error", { allow: ["warn", "error", "debug"] }],
            // Allow underscore-prefixed unused params
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
        },
    },
];
```

### Why `recommendedTypeChecked` Specifically

The `typescript-eslint` package exports several config levels:

| Config | Type-aware | What it catches |
|--------|-----------|-----------------|
| `recommended` | No | Basic TS issues (no-explicit-any, etc.) |
| `recommendedTypeChecked` | Yes | + no-floating-promises, no-require-imports, restrict-template-expressions, no-unnecessary-type-assertion, require-await, no-misused-promises, await-thenable, no-base-to-string |
| `strictTypeChecked` | Yes | + no-unsafe-assignment, no-unsafe-member-access, no-unsafe-return, no-unsafe-call |

The community scanner uses rules from the **`recommendedTypeChecked`** level. If you only use `recommended` (non-type-checked), you'll miss the most common violations.

## tsconfig.json Requirements

The type-checked rules need `project` in parser options, which means your `tsconfig.json` must cover all linted files:

```json
{
    "compilerOptions": {
        "module": "ESNext",
        "target": "ES6",
        "moduleResolution": "node",
        "strictNullChecks": true,
        "lib": ["DOM", "ES5", "ES6", "ES7"]
    },
    "include": ["src/**/*.ts"]
}
```

If you get "file not found in project" errors from ESLint, your `include` pattern doesn't match your source files.

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

The community scanner forbids `eslint-disable` comments for certain obsidianmd rules. Fix the underlying issue instead of suppressing it.

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

### Using bare `setTimeout`/`setInterval`

**Rule:** `obsidianmd/prefer-active-window-timers`

```typescript
// Bad
setTimeout(() => {}, 100);
setInterval(() => {}, 1000);

// Good
activeWindow.setTimeout(() => {}, 100);
activeWindow.setInterval(() => {}, 1000);
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

**Rule:** `obsidianmd/no-nodejs-modules` (updated in v0.2.6)

Node.js built-in modules (`fs`, `path`, `os`, etc.) are only available on desktop. Guard imports with `Platform.isDesktop`:

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
