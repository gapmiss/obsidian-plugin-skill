# UI/UX Standards

Consistent UI/UX is essential for a native-feeling Obsidian plugin experience.

## Table of Contents
- [Sentence Case for UI Text](#sentence-case-for-ui-text)
- [Sentence Case for Locale Files](#sentence-case-for-locale-files)
- [Command Naming Conventions](#command-naming-conventions)
- [Settings & Configuration](#settings--configuration)
- [Declarative Settings (Obsidian 1.13+)](#declarative-settings-obsidian-113)

---

## Sentence Case for UI Text

### Enforce Sentence Case for UI Text
Rule: `obsidianmd/ui/sentence-case` (auto-fixable)

> **Note (v0.3.0):** This rule is disabled by default (not working as intended). Enable manually if needed.

Use sentence case (first word capitalized, rest lowercase except proper nouns) for all UI text.

❌ **INCORRECT**:
```typescript
.setName('Advanced Settings')
.setDesc('Configure Advanced Options')
.setButtonText('Save Changes')
new Notice('File Successfully Saved')
```

✅ **CORRECT**:
```typescript
.setName('Advanced settings')
.setDesc('Configure advanced options')
.setButtonText('Save changes')
new Notice('File successfully saved')
```

Configuration options:
```javascript
'obsidianmd/ui/sentence-case': ['warn', {
  brands: ['Obsidian', 'GitHub'],      // Preserve brand names
  acronyms: ['API', 'URL', 'HTML'],    // Preserve acronyms
  enforceCamelCaseLower: true,         // Fix camelCase to sentence case
}]
```

Applies to:
- `.setName()`, `.setDesc()`, `.setText()`, `.setTitle()`
- `.setButtonText()`, `.setPlaceholder()`, `.setTooltip()`
- `createEl()` text and attributes
- `new Notice()` messages
- `addCommand()` names
- `.setAttribute()` for `aria-label`, `aria-description`, `title`, `placeholder`
- `textContent`, `innerText` assignments

---

## Sentence Case for Locale Files

Plugins that externalize UI strings into locale files must also enforce sentence case.

### Sentence Case for JSON Locale Files
Rule: `obsidianmd/ui/sentence-case-json` (auto-fixable)

Enforces sentence case for English locale strings stored in JSON files (e.g. `en.json`, `locales/en.json`).

❌ **INCORRECT** (`en.json`):
```json
{
  "openSettings": "Open Settings",
  "saveChanges": "Save Changes",
  "deleteFile": "Delete File"
}
```

✅ **CORRECT** (`en.json`):
```json
{
  "openSettings": "Open settings",
  "saveChanges": "Save changes",
  "deleteFile": "Delete file"
}
```

---

### Sentence Case for TypeScript/JavaScript Locale Modules
Rule: `obsidianmd/ui/sentence-case-locale-module` (auto-fixable)

Enforces sentence case for English locale strings exported from TS/JS modules (e.g. `en.ts`, `locales/en.js`).

❌ **INCORRECT** (`en.ts`):
```typescript
export default {
  openSettings: "Open Settings",
  saveChanges: "Save Changes",
};
```

✅ **CORRECT** (`en.ts`):
```typescript
export default {
  openSettings: "Open settings",
  saveChanges: "Save changes",
};
```

---

### Enable Locale Checks with recommendedWithLocalesEn

To enable all three sentence-case rules (TypeScript sources + JSON + TS/JS locale modules), use the `recommendedWithLocalesEn` config instead of `recommended`:

```javascript
// eslint.config.mjs
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
  // Use this config to also lint en*.json, en*.ts, en*.js locale files
  ...obsidianmd.configs.recommendedWithLocalesEn,
];
```

The `recommended` config only checks `ui/sentence-case` (inline TypeScript strings). The `recommendedWithLocalesEn` config additionally enables:
- `ui/sentence-case-json` — checks `en*.json` and `en/**/*.json`
- `ui/sentence-case-locale-module` — checks `en*.ts`, `en*.js`, and `en/**/*`

---

## Command Naming Conventions

### No Redundant "Command" in Names
Rules:
- `obsidianmd/commands/no-command-in-command-id`
- `obsidianmd/commands/no-command-in-command-name`

❌ **INCORRECT**:
```typescript
this.addCommand({
  id: 'open-settings-command',
  name: 'Open settings command',
});
```

✅ **CORRECT**:
```typescript
this.addCommand({
  id: 'open-settings',
  name: 'Open settings',
});
```

---

### No Plugin ID/Name in Command IDs
Rules:
- `obsidianmd/commands/no-plugin-id-in-command-id`
- `obsidianmd/commands/no-plugin-name-in-command-name`

❌ **INCORRECT**:
```typescript
// If plugin id is "my-plugin"
this.addCommand({
  id: 'my-plugin-open-settings',
  name: 'My Plugin: Open settings',
});
```

✅ **CORRECT**:
```typescript
this.addCommand({
  id: 'open-settings',
  name: 'Open settings',
});
```

Rationale: Obsidian automatically namespaces commands with the plugin ID.

---

### No Default Hotkeys
Rule: `obsidianmd/commands/no-default-hotkeys`

❌ **INCORRECT**:
```typescript
this.addCommand({
  id: 'toggle-feature',
  name: 'Toggle feature',
  hotkeys: [{ modifiers: ['Mod'], key: 't' }],  // Don't set defaults
});
```

✅ **CORRECT**:
```typescript
this.addCommand({
  id: 'toggle-feature',
  name: 'Toggle feature',
  // Let users configure their own hotkeys
});
```

Rationale: Avoid hotkey conflicts. Let users choose their own shortcuts.

---

### Use Appropriate Command Callbacks
Rule: Official guidelines

Choose the right callback type for your commands:

```typescript
// callback: Always executes
this.addCommand({
  id: 'show-info',
  name: 'Show info',
  callback: () => {
    new Notice('Always works!');
  }
});

// checkCallback: Conditional execution (returns true if executed)
this.addCommand({
  id: 'format-selection',
  name: 'Format selection',
  checkCallback: (checking: boolean) => {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) {
      if (!checking) {
        // Perform the action
        const editor = view.editor;
        const selection = editor.getSelection();
        editor.replaceSelection(selection.toUpperCase());
      }
      return true;
    }
    return false;
  }
});

// editorCallback: Only available when editor is active
this.addCommand({
  id: 'insert-timestamp',
  name: 'Insert timestamp',
  editorCallback: (editor: Editor, view: MarkdownView) => {
    editor.replaceSelection(new Date().toISOString());
  }
});
```

Rationale:
- Use `callback` for unconditional execution
- Use `checkCallback` for conditional execution (command only shows when available)
- Use `editorCallback` for editor-dependent commands

---

## Settings & Configuration

### No Manual HTML Headings in Settings
Rule: `obsidianmd/settings-tab/no-manual-html-headings`

❌ **INCORRECT**:
```typescript
containerEl.createEl('h3', { text: 'Appearance' });
```

✅ **CORRECT**:
```typescript
new Setting(containerEl).setName('Appearance').setHeading();
```

Rationale: Use Obsidian's built-in heading API for consistency.

---

### No Problematic Settings Headings
Rule: `obsidianmd/settings-tab/no-problematic-settings-headings` (auto-fixable)

❌ **INCORRECT**:
```typescript
new Setting(containerEl)
  .setName('General settings')  // Don't use "General"
  .setHeading();

new Setting(containerEl)
  .setName('Plugin options')  // Don't use "settings" or "options"
  .setHeading();

new Setting(containerEl)
  .setName('My Plugin preferences')  // Don't include plugin name
  .setHeading();
```

✅ **CORRECT**:
```typescript
new Setting(containerEl)
  .setName('Appearance')
  .setHeading();

new Setting(containerEl)
  .setName('Behavior')
  .setHeading();

new Setting(containerEl)
  .setName('Advanced')
  .setHeading();
```

Rationale: Avoid redundant words in settings headings:
- Don't use "settings" or "options" (user already knows they're in settings)
- Don't use generic "General" heading
- Don't include the plugin name (already shown in settings tab title)

---

## Declarative Settings (Obsidian 1.13+)

As of Obsidian 1.13.0, `PluginSettingTab` supports a declarative API: override `getSettingDefinitions()` to return an array of setting definitions. Obsidian handles rendering, persistence, validation, and search indexing. You describe the settings, not the DOM.

### Migration Paths

| Your `minAppVersion` | Path | What to do |
|---|---|---|
| `>= 1.13.0` | **Path A** (preferred) | Implement `getSettingDefinitions()` only. Delete `display()`. |
| `< 1.13.0` | **Path B** (dual support) | Keep `display()` and add `getSettingDefinitions()` alongside it. Both must stay in sync. |
| `< 1.13.0`, no need for new features | No change | The API is opt-in. Leave the plugin as-is. |

### Path A: Clean 1.13-only Migration

1. Bump `minAppVersion` to `"1.13.0"` in `manifest.json`.
2. Override `getSettingDefinitions()` — return an array of definition objects.
3. For each setting, write `{ name, desc, control: { type, key } }`. The `key` maps to a property on `this.plugin.settings`. Obsidian reads, writes, and persists automatically.
4. Move value-shape validation (regex, range, format) from `onChange` into a `validate` callback on the control.
5. Delete `display()` and remove unused imports (typically `Setting`).

```typescript
import { App, PluginSettingTab } from 'obsidian';

class MySettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions() {
    return [
      {
        name: 'Enable feature',
        desc: 'Turns the feature on or off.',
        control: { type: 'toggle', key: 'enabled' },
      },
      {
        name: 'Mode',
        control: {
          type: 'dropdown',
          key: 'mode',
          defaultValue: 'fast',
          options: { fast: 'Fast', thorough: 'Thorough' },
        },
      },
      {
        name: 'Cache key',
        desc: 'Alphanumeric only.',
        control: {
          type: 'text',
          key: 'cacheKey',
          placeholder: 'default',
          validate: (value: string) =>
            /^[a-z0-9]*$/i.test(value.trim()) ? undefined : 'Use letters and digits only.',
        },
      },
    ];
  }
}
```

### Path B: Dual Support

Keep `display()` as-is and add `getSettingDefinitions()` alongside it. On 1.13.0+, Obsidian calls `getSettingDefinitions()` and skips `display()`. On older versions, `display()` runs as before.

> **Warning:** The two implementations must stay in sync. Every time you add or change a setting, update both. If the maintenance overhead isn't worth it, prefer Path A and bump `minAppVersion`.

### Control Types

`toggle`, `dropdown`, `text`, `textarea`, `number`, `slider`, `color`, `file`, `folder`

### Definition Kinds

`control`, `render`, and `action` on a definition are mutually exclusive. Definitions can also be empty (heading-only), groups, lists (`addItem`/`onDelete`/`onReorder`), and sub-pages.

### When to Use `render` Instead of `control`

Use a `render` callback when `control` + `validate` isn't enough:
- **Side effects on change** — call a method, update a status bar, refresh another view
- **Inverted or derived values** — a toggle that drives a string config, a slider that drives a complex calculation
- **Custom suggesters** — a command picker, tag picker, or anything using `AbstractInputSuggest`

For conditional visibility, use the `visible` predicate instead of `render`.

### Data-Shape Gotcha

Auto-persist calls `saveData(plugin.settings)`, so **all persisted plugin data must live inside the `settings` object**. Sibling keys stored via `saveData()` outside `settings` will be clobbered.

❌ **INCORRECT**:
```typescript
// Sibling key — clobbered when declarative settings auto-save
await this.saveData({ ...this.settings, bookmarks: this.bookmarks });
```

✅ **CORRECT**:
```typescript
// All persisted data under settings
interface MySettings {
  enabled: boolean;
  bookmarks: string[];
}
```

### Pitfalls

- `getSettingDefinitions()` runs on every `update()` AND once at registration for search indexing. Keep it cheap — no I/O, no network calls.
- A `render` callback does **not** auto-save. Always `await this.plugin.saveData(this.plugin.settings)` after mutating settings.
- `validate` is a UI gate — it shows inline errors but doesn't modify stored values. Re-validate stored data in `loadSettings()` for data saved by older plugin versions.
- Page names must be unique among siblings at the same depth.
- When an `action` callback depends on row position, use the `index` argument — don't capture index from an outer `map` (it goes stale after reorder/delete).
- To refresh the tab after data changes, call `this.update()`. On 1.13.0+, `display()` is bypassed when `getSettingDefinitions()` returns a non-empty array.
- `desc` accepts `string` or `DocumentFragment`. For rich descriptions with formatting or links, pass a `DocumentFragment` built with `createFragment(...)`.

### Relationship to Existing Rules

- Heading rules (`no-manual-html-headings`, `no-problematic-settings-headings`) apply to legacy `display()` implementations
- Sentence case still applies to `name`, `desc`, and `options` values in declarative definitions
- Settings window opened in a new window since 1.13 — see [Target Main Workspace from Settings](../reference/code-quality.md#target-main-workspace-from-settings-v1130)
