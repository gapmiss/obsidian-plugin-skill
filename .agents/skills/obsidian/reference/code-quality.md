# Code Quality & Best Practices

Code quality ensures maintainability, reliability, and better user experience.

## Table of Contents
- [Remove Sample Code](#remove-sample-code)
- [Security Best Practices](#security-best-practices)
- [Platform Compatibility](#platform-compatibility)
- [API Usage Best Practices](#api-usage-best-practices)
- [Async/Await Patterns](#asyncawait-patterns)
- [DOM Helpers](#dom-helpers)
- [Deprecated & Replaceable Packages](#deprecated--replaceable-packages)
- [Obsidian API Deprecations](#obsidian-api-deprecations)
- [Miscellaneous Rules](#miscellaneous-rules)

---

## Remove Sample Code

### Remove Sample Code
Rule: `obsidianmd/no-sample-code`

Remove all sample/template code before publishing:
- Sample ribbon icons
- Example status bar items
- Template settings
- Boilerplate comments

---

### Rename Sample Class Names
Rule: `obsidianmd/sample-names`

❌ **INCORRECT**:
```typescript
class MyPlugin extends Plugin { }
interface MyPluginSettings { }
class SampleSettingTab extends PluginSettingTab { }
class SampleModal extends Modal { }
```

✅ **CORRECT**:
```typescript
class TodoPlugin extends Plugin { }
interface TodoPluginSettings { }
class TodoSettingTab extends PluginSettingTab { }
class TodoModal extends Modal { }
```

Rationale: Rename placeholder class names from the sample plugin template (`MyPlugin`, `MyPluginSettings`, `SampleSettingTab`, `SampleModal`) to meaningful names for your plugin.

---

## Security Best Practices

### Avoid innerHTML and outerHTML
Rule: Security best practice

❌ **INCORRECT**:
```typescript
element.innerHTML = '<div>' + userContent + '</div>';
element.outerHTML = '<p>' + text + '</p>';
```

✅ **CORRECT**:
```typescript
// Use DOM API
const div = element.createDiv();
div.textContent = userContent;

// Or use Obsidian helpers
const div = createDiv();
div.setText(userContent);
```

Rationale: Using `innerHTML`/`outerHTML` is a security risk (XSS vulnerability). Use DOM API or Obsidian helper functions instead.

---

## Platform Compatibility

### Avoid Regex Lookbehind
Rule: `obsidianmd/regex-lookbehind`

❌ **INCORRECT**:
```typescript
const pattern = /(?<=@)\w+/;  // Not supported on some iOS versions
const notAfter = /(?<!\\)\$/;  // Negative lookbehind — also reported (v0.5.0)
```

✅ **CORRECT**:
```typescript
const pattern = /@(\w+)/;
const match = text.match(pattern);
const username = match?.[1];
```

Rationale: Regex lookbehind — positive `(?<=…)` and negative `(?<!…)` — is not supported on iOS versions before 16.4. Desktop-only plugins (`"isDesktopOnly": true`) are exempt.

---

### Use Platform API for OS Detection
Rule: `obsidianmd/platform`

❌ **INCORRECT**:
```typescript
if (navigator.platform.includes('Mac')) { }
if (navigator.userAgent.includes('Windows')) { }
if (window.navigator.platform === 'Linux') { }
```

✅ **CORRECT**:
```typescript
import { Platform } from 'obsidian';

if (Platform.isMacOS) { }
if (Platform.isWin) { }
if (Platform.isLinux) { }
if (Platform.isMobile) { }
if (Platform.isIosApp) { }
if (Platform.isAndroidApp) { }
if (Platform.isDesktopApp) { }
```

Rationale: Avoid using the `navigator` API to detect the operating system. Use Obsidian's Platform API instead for better reliability and mobile support.

---

### Use window.setTimeout and window.setInterval
Rule: `obsidianmd/prefer-window-timers`

❌ **INCORRECT**:
```typescript
const timer: NodeJS.Timeout = setTimeout(() => {
  // do something
}, 1000);

const interval = setInterval(() => {
  // do something
}, 1000);

// Also flagged — fixed to window.setTimeout()
const other: number = activeWindow.setTimeout(() => {
  // do something
}, 1000);
```

✅ **CORRECT**:
```typescript
const timer: number = window.setTimeout(() => {
  // do something
}, 1000);

const interval: number = window.setInterval(() => {
  // do something
}, 1000);

// Clear them with:
window.clearTimeout(timer);
window.clearInterval(interval);
```

Rationale: Timers are the one exception to "use `activeWindow` instead of `window`". `prefer-window-timers` flags both bare calls and `activeWindow.*` calls for `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `requestAnimationFrame`, and `cancelAnimationFrame` — except `activeWindow.requestAnimationFrame()`/`cancelAnimationFrame()` (v0.5.1): a frame callback runs when its own window paints, and a minimized main window doesn't paint, so `window.requestAnimationFrame()` would stall a popout's animation. `--fix` rewrites them to `window.*` only where no type can change; a stored timer (like `timer` above) gets an editor suggestion instead, because its `NodeJS.Timeout` type must change to `number` with it. `prefer-active-doc` deliberately skips `window.<timer>()`, so the two rules agree. `activeWindow` follows focus, so a timer scheduled on it could be scheduled on a popout that later closes, and a later `activeWindow.clearTimeout()` could target a different window than the one that owns the ID. Also use `number` type instead of `NodeJS.Timeout` for browser compatibility.

---

## API Usage Best Practices

### Don't Use Global `app` Object
Rule: Best practice from official guidelines

❌ **INCORRECT**:
```typescript
// Don't use global app
const vault = app.vault;
const workspace = app.workspace;
```

✅ **CORRECT**:
```typescript
// Use the plugin instance reference
const vault = this.app.vault;
const workspace = this.app.workspace;
```

Rationale: Always use `this.app` from your plugin instance instead of the global `app` object for better encapsulation and reliability.

---

### Use requestUrl() Instead of fetch()
Rule: Best practice from official guidelines

❌ **INCORRECT**:
```typescript
// Don't use fetch()
const response = await fetch('https://api.example.com/data');
const data = await response.json();
```

✅ **CORRECT**:
```typescript
import { requestUrl } from 'obsidian';

// Use Obsidian's requestUrl() to bypass CORS
const response = await requestUrl('https://api.example.com/data');
const data = response.json;
```

Rationale: Don't use `fetch()`. Use Obsidian's `requestUrl()` instead to bypass CORS restrictions. The browser's fetch API is subject to CORS policies, but `requestUrl()` bypasses these restrictions.

---

### Type requestUrl() Responses at the Boundary
Rule: Best practice (supports `@typescript-eslint/no-unsafe-*` and no-`any` guidance)

`RequestUrlResponse.json` is typed `any` in `obsidian.d.ts`, so reading it lets `any` leak silently into the rest of the plugin.

❌ **INCORRECT**:
```typescript
const response = await requestUrl({ url, throw: false });
const items = response.json.results; // any — no type checking from here on
```

✅ **CORRECT**:
```typescript
interface ListingsResponse {
  count: number;
  results: Listing[];
}

const response = await requestUrl({ url, throw: false });
if (response.status >= 400) {
  throw new ApiResponseError(response.status, response.text);
}
// Parse and cast once, in the API layer only
const data = JSON.parse(response.text) as ListingsResponse;
const items = data.results; // Listing[]
```

Rationale: Parse `response.text` and cast (or validate with a type guard) in one place, the API client. Everything above that layer then gets real types, with no `any`. Use `throw: false` so you can inspect `status` and `headers` (e.g. `retry-after` on 429) instead of catching an opaque exception.

---

### Minimize Console Logging
Rule: Best practice from official guidelines

❌ **INCORRECT**:
```typescript
async onload() {
  console.log('Plugin loaded');
  console.log('Processing file:', file.path);
  console.log('Settings updated:', settings);
}

onunload() {
  console.log('Plugin unloaded');
}
```

✅ **CORRECT**:
```typescript
async onload() {
  // Only log errors by default
  console.error('Failed to process file:', error);

  // Use debug mode for development logging
  if (this.settings.debugMode) {
    console.log('Processing file:', file.path);
  }
}

onunload() {
  // No console.log in production
}
```

Rationale: The developer console should display errors by default, not debug messages. Minimize unnecessary console output. **In production, do not use console.log in onload and onunload** - these methods are called frequently and pollute the console. Use debug mode flags for development logging.

---

### Prefer AbstractInputSuggest
Rule: `obsidianmd/prefer-abstract-input-suggest`

❌ **INCORRECT**:
```typescript
// Don't use the custom TextInputSuggest implementation
// (frequently copied from Liam's code)
class MyTextInputSuggest extends TextInputSuggest<string> {
  // Uses createPopper with sameWidth modifier
}
```

✅ **CORRECT**:
```typescript
import { AbstractInputSuggest } from 'obsidian';

class MyInputSuggest extends AbstractInputSuggest<string> {
  getSuggestions(query: string): string[] {
    // Return suggestions
  }

  renderSuggestion(value: string, el: HTMLElement) {
    el.setText(value);
  }

  selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent) {
    // Handle selection
  }
}
```

Rationale: Use the built-in `AbstractInputSuggest` API instead of copying custom `TextInputSuggest` implementations that use `createPopper`.

---

### Use updateOptions() for Editor Extensions
Rule: Official guidelines

```typescript
// When reconfiguring editor extensions
this.app.workspace.updateOptions();
```

Rationale: When reconfiguring editor extensions, use `updateOptions()` to flush changes across all open editors.

---

### Target Main Workspace from Settings (v1.13.0+)
Rule: Multi-window compatibility

As of Obsidian 1.13.0, settings open in a **new window** instead of a modal. Code using `activeDocument` from settings callbacks will get the settings window's document, not the main vault window.

❌ **INCORRECT** (breaks in 1.13.0+):
```typescript
// In settings tab or settings callback
updateMainUI() {
  // activeDocument points to settings window, not main vault!
  const container = activeDocument.querySelector('.nav-files-container');
  container?.addClass('my-plugin-active');
}
```

✅ **CORRECT** (works in all versions):
```typescript
// In settings tab or settings callback
updateMainUI() {
  // Always targets the main workspace window
  const doc = this.app.workspace.containerEl.ownerDocument;
  const container = doc.querySelector('.nav-files-container');
  container?.addClass('my-plugin-active');
}
```

**When to use which:**
- **Main workspace UI** (nav, sidebar, workspace elements): Use `this.app.workspace.containerEl.ownerDocument`
- **Same-window UI** (modal contents, settings elements): `activeDocument` or `this.containerEl.ownerDocument` both work

Rationale: `workspace.containerEl.ownerDocument` always points to the main vault window regardless of which window triggered the call. This is backwards compatible with older Obsidian versions.

---

## Async/Await Patterns

### Prefer async/await over Promise chains
Rule: Code readability and maintainability

❌ **INCORRECT**:
```typescript
function loadData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 1000);
  });
}

getData()
  .then(result => processResult(result))
  .then(processed => saveData(processed))
  .catch(error => console.error(error))
  .finally(() => cleanup());
```

✅ **CORRECT**:
```typescript
async function loadData() {
  await sleep(1000);  // Use Obsidian's sleep() helper
  return data;
}

try {
  const result = await getData();
  const processed = await processResult(result);
  await saveData(processed);
} catch (error) {
  console.error(error);
} finally {
  cleanup();
}
```

Rationale: async/await is more readable and maintainable. Use Obsidian's `sleep()` function instead of `new Promise` with setTimeout.

---

## DOM Helpers

### Use Obsidian DOM Helpers
Rule: `obsidianmd/prefer-create-el`

❌ **INCORRECT**:
```typescript
const div = document.createElement('div');
const span = document.createElement('span');
const fragment = document.createDocumentFragment();
```

✅ **CORRECT**:
```typescript
// On any HTMLElement:
const div = containerEl.createDiv();
const span = containerEl.createSpan();
const el = containerEl.createEl('section');

// Or use global helpers:
const div = createDiv();
const span = createSpan();
const fragment = createFragment();

// In a popout, create on a parent that already lives in that window:
const row = containerEl.createDiv({ cls: 'my-row' });
row.createEl('p', { text: 'Hello' });

// Or, for a detached element in the focused window's document (not reported since v0.5.1):
const p = activeDocument.createElement('p');
```

❌ **INCORRECT** — does not compile:
```typescript
activeWindow.createEl('p');   // TS2339: 'createEl' does not exist on type 'Window'
el.doc.win.createDiv();       // same: Node.win is typed as a plain Window
```

Rationale: Obsidian's helper functions (`createDiv()`, `createSpan()`, `createEl()`, `createFragment()`) are more concise and integrate better with the API. They are declared as globals and on every `Node`/`HTMLElement` — **not** on `Window`, so `activeWindow.createEl()` and `doc.win.createEl()` fail type-checking. Since v0.5.1, `prefer-create-el` no longer reports `activeDocument.createElement()` or `el.doc.createElement()` — with Obsidian's types they are the right calls for a detached element in a popout window's document ([#240](https://github.com/obsidianmd/eslint-plugin/issues/240)). Don't call `activeDocument.createEl()`: on a node, `createEl()` appends the new element, and a document can't take a second root element.

---

## Deprecated & Replaceable Packages

The Obsidian community plugin scanner checks for npm packages that have been superseded by Node.js built-ins. Using flagged packages produces warnings that lower your Scorecard score.

### Replace `builtin-modules` with `node:module`
Rule: Scanner warning — deprecated package

The `builtin-modules` package provides a list of Node.js built-in module names. Node.js has shipped this natively as `module.builtinModules` since v9.3.0.

❌ **INCORRECT** (`esbuild.config.mjs`):
```javascript
import builtins from "builtin-modules";
// ...
external: [...builtins],
```

✅ **CORRECT** (`esbuild.config.mjs`):
```javascript
import { builtinModules } from "node:module";
// ...
external: [...builtinModules],
```

Then remove `builtin-modules` from `package.json` devDependencies.

### General Guidance

When the scanner flags a package with a "should be replaced with an alternative" warning:
1. Check [es-tooling/module-replacements](https://github.com/es-tooling/module-replacements) for the recommended replacement
2. Replace the import with the Node.js built-in or recommended alternative
3. Remove the flagged package from `package.json`
4. Verify the build still passes

---

## Obsidian API Deprecations

### `ButtonComponent.setWarning()` → `setDestructive()`

As of Obsidian 1.13+, `ButtonComponent.setWarning()` is deprecated. Use `setDestructive()` instead. For destructive primary actions, chain `.setDestructive().setCta()`.

❌ **INCORRECT**:
```typescript
new Setting(containerEl)
  .addButton(btn => btn.setWarning().setButtonText('Delete'));
```

✅ **CORRECT**:
```typescript
new Setting(containerEl)
  .addButton(btn => btn.setDestructive().setButtonText('Delete'));
```

> **Scope:** only `ButtonComponent.setWarning()` is deprecated. `MenuItem.setWarning(isWarning: boolean)` is a different, non-deprecated method that takes an argument — don't "fix" it to `setDestructive()`.

### `PluginSettingTab.display()` → `getSettingDefinitions()`

`display()` carries `@deprecated Since 1.13.0` in the 1.13 typings, so `@typescript-eslint/no-deprecated` flags every implementation of it — including plugins that legitimately still need it to support Obsidian below 1.13.0 (see [Path B](ui-ux.md#path-b-dual-support)).

**You cannot silence this inline.** `@typescript-eslint/no-deprecated` is on the bundled `eslint-comments/no-restricted-disable` list, so an `eslint-disable-next-line` for it is itself an error — see [Disabling rule `X` is not allowed](eslint-setup.md#disabling-rule-x-is-not-allowed). Use a file-scoped override in `eslint.config.mjs` instead:

```javascript
{
  // Path B: minAppVersion is below 1.13.0, so display() is still the render path.
  files: ["src/settings-tab.ts"],
  rules: { "@typescript-eslint/no-deprecated": "off" },
}
```

Scope it to the one file, and delete the override the moment you bump `minAppVersion` to 1.13.0 — otherwise it hides every *other* deprecation in that file. On Path A the warning is correct and the fix is to delete `display()`.

> **Note:** These deprecations only surface when the `obsidian` typings are current — stale typings silently hide them. Keep `"obsidian": "latest"` in **`devDependencies`** (it's a compile-time-only dependency; the runtime API is provided by the app).

> **Typings lag the app:** the `obsidian` npm package tracks the API surface, not the release train — it can sit a patch or two behind the public desktop build. A `1.13.x` app version doesn't guarantee a matching npm version exists.

---

## Miscellaneous Rules

### Don't Mutate Defaults with Object.assign
Rule: `obsidianmd/object-assign`

Avoid calling `Object.assign` with exactly two arguments where the first argument is a variable with "default" in its name. This mutates the defaults object unexpectedly.

❌ **INCORRECT**:
```typescript
// Mutates DEFAULT_SETTINGS - subsequent calls see modified defaults!
Object.assign(DEFAULT_SETTINGS, userSettings);
```

✅ **CORRECT**:
```typescript
// Merge into a fresh object - defaults stay intact
Object.assign({}, DEFAULT_SETTINGS, userSettings);

// Or use spread syntax (preferred):
const settings = { ...DEFAULT_SETTINGS, ...userSettings };
```

Rationale: When the target of `Object.assign` is a variable holding default values (name contains "default"), the defaults object itself is mutated. Pass an empty `{}` as the first argument or use spread syntax to avoid unexpected side-effects.

---

### Organize Multi-File Plugins into Folders
Rule: Best practice from official guidelines

✅ GOOD STRUCTURE:
```
my-plugin/
├── src/
│   ├── commands/
│   ├── modals/
│   ├── settings/
│   ├── utils/
│   └── main.ts
├── styles.css
├── manifest.json
└── README.md
```

Rationale: For plugins with multiple files, organize them into folders to improve maintainability and review processes.

---

### Validate manifest.json
Rule: `obsidianmd/validate-manifest` (`warn`; runs on `manifest.json` since v0.5.0 — it never ran before)

The rule follows the community scanner's manifest review:

- **Fields:** `id`, `name`, `version`, `minAppVersion`, `description`, `author`, `isDesktopOnly` required; `authorUrl`, `fundingUrl`, `helpUrl` optional; any other key (or a duplicate key) is reported
- **`id`** (only with `checkId: true`, v0.5.1+): no "obsidian"; must not end with "plugin" ("plugin" elsewhere is fine). Off by default because a published id can never change and the scanner doesn't check it
- **`name`:** no "Obsidian", no parts of it ("obsi", "sidian", or a leading "ob"), no "Plugin" anywhere
- **`description`:** 10–250 characters; ends with `.`, `!`, or `?`; no "Obsidian"; doesn't refer to itself ("This plugin", "This tool", "A plugin that", "The plugin …"); isn't the same as and doesn't start with the name. A lowercase start, emoji, and mentioning plugins in general are fine

❌ **INCORRECT**:
```json
{
  "id": "obsidian-task-plugin",
  "name": "Task Plugin",
  "description": "Task Plugin: this plugin manages tasks (beta)",
  "version": "1.0.0",
  "minAppVersion": "1.13.0",
  "author": "Your Name",
  "isDesktopOnly": false
}
```

✅ **CORRECT**:
```json
{
  "id": "task-board",
  "name": "Task Board",
  "version": "1.0.0",
  "minAppVersion": "1.13.0",
  "description": "Track tasks across notes on a drag-and-drop board.",
  "author": "Your Name",
  "authorUrl": "https://github.com/your-name",
  "isDesktopOnly": false
}
```

Before your first submission, turn the `id` check on in a block scoped to the manifest: `{ files: ["manifest.json"], rules: { "obsidianmd/validate-manifest": ["warn", { checkId: true }] } }`. Remove it once the plugin is published. A published id containing "obsidian" needs no `allowedWords` entry since v0.5.1 — delete one you added for v0.5.0.

---

### Validate LICENSE
Rule: `obsidianmd/validate-license` (`warn`; runs on `LICENSE`, `LICENSE.md`, `LICENSE.txt` since v0.5.0 — it never ran before)

The rule catches the sample plugin's `LICENSE` left unedited:

1. **Copyright holder**: A holder of "Dynalist Inc." (the sample plugin's default) is reported. Change it to your name.
2. **Copyright year**: Only while the holder is still "Dynalist Inc." is an outdated year also reported. Your own notice does **not** need the current year, and the FSF's own notice inside GPL-family licenses is not reported.

❌ **INCORRECT** (unchanged sample plugin LICENSE):
```
Copyright (C) 2020-2025 by Dynalist Inc.
```

✅ **CORRECT** (any year is fine once the holder is yours):
```
Copyright (c) 2024 Your Name
```

Rule options:
```javascript
"obsidianmd/validate-license": ["warn", {
  currentYear: 2026,           // Year to compare an unedited sample line against (defaults to current year)
  disableUnchangedYear: false, // Set true to skip the year check on an unedited sample line
}]
```

Recognized forms: `Copyright (C) 2020 by Name`, `Copyright (c) 2020-2025 Name`, `Copyright © 2020 Name`. File names are matched case-sensitively next to your ESLint config, so `License` or `COPYING` is not linted.

Rationale: The Obsidian sample plugin ships with Dynalist Inc. as copyright holder. Forgetting to update this before submission is a common mistake.
