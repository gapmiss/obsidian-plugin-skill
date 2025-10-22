# Obsidian Plugin Development Guidelines

You are assisting with Obsidian plugin development. Follow these comprehensive guidelines derived from the official Obsidian ESLint plugin rules, submission requirements, and best practices.

## Core Principles

1. Memory Safety: Prevent memory leaks through proper resource management
2. Type Safety: Use proper type narrowing and avoid unsafe casts
3. API Best Practices: Follow Obsidian's recommended patterns
4. User Experience: Maintain consistency in UI/UX across plugins
5. Platform Compatibility: Ensure cross-platform support (including iOS)

---

## Memory Management & Lifecycle

### Use registerEvent() and addCommand() for Cleanup
Rule: Official guidelines

✅ **CORRECT**:
```typescript
async onload() {
  // These are automatically cleaned up on unload
  this.registerEvent(
    this.app.workspace.on('file-open', (file) => {
      // Handle file open
    })
  );

  this.addCommand({
    id: 'my-command',
    name: 'My command',
    callback: () => { }
  });

  // For DOM events, use registerDomEvent
  this.registerDomEvent(document, 'click', (evt) => {
    // Handle click
  });

  // For intervals, use registerInterval
  this.registerInterval(
    window.setInterval(() => {
      // Do something periodically
    }, 5000)
  );
}

onunload() {
  // No manual cleanup needed!
  // Obsidian handles it automatically
}
```

Rationale: Use `registerEvent()`, `addCommand()`, `registerDomEvent()`, and `registerInterval()` for automatic cleanup when the plugin unloads. This prevents memory leaks.

---

### Don't Store View References in Plugin
Rule: `obsidianmd/no-view-references-in-plugin`

❌ **INCORRECT**:
```typescript
this.registerView(VIEW_TYPE, (leaf) => {
  this.view = new MyCustomView(leaf);  // Memory leak!
  return this.view;
});
```

✅ **CORRECT**:
```typescript
this.registerView(VIEW_TYPE, (leaf) => {
  return new MyCustomView(leaf);  // Create and return directly
});
```

Rationale: Storing view instances as plugin properties prevents proper cleanup and causes memory leaks.

---

### Don't Use Plugin as Component
Rule: `obsidianmd/no-plugin-as-component`

❌ **INCORRECT**:
```typescript
// Passing plugin instance
MarkdownRenderer.render(app, markdown, el, sourcePath, this);

// Inline new Component()
MarkdownRenderer.render(app, markdown, el, sourcePath, new Component());
```

✅ **CORRECT**:
```typescript
const component = new Component();
MarkdownRenderer.render(app, markdown, el, sourcePath, component);
// Later: component.unload() when done
```

Rationale: Plugin lifecycle is too long, causing memory leaks. Components must be stored to call `unload()`.

---

### Don't Detach Leaves in onunload
Rule: `obsidianmd/detach-leaves` (auto-fixable)

❌ **INCORRECT**:
```typescript
onunload() {
  this.app.workspace.detachLeavesOfType(VIEW_TYPE);
}
```

✅ **CORRECT**:
```typescript
onunload() {
  // Let Obsidian handle leaf cleanup automatically
}
```

Rationale: Obsidian handles leaf cleanup automatically. Manual detachment can cause issues.

---

## Type Safety

### Avoid Type Casting to TFile/TFolder
Rule: `obsidianmd/no-tfile-tfolder-cast`

❌ **INCORRECT**:
```typescript
const file = abstractFile as TFile;
const folder = <TFolder>abstractFile;
```

✅ **CORRECT**:
```typescript
if (abstractFile instanceof TFile) {
  // TypeScript now knows it's a TFile
  const file = abstractFile;
}

if (abstractFile instanceof TFolder) {
  const folder = abstractFile;
}
```

Rationale: Type casting bypasses type safety. Use `instanceof` for safe type narrowing.

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

## UI/UX Standards

### Enforce Sentence Case for UI Text
Rule: `obsidianmd/ui/sentence-case` (auto-fixable)

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

## File & Vault Operations

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

### Use getActiveViewOfType() for View Access
Rule: Official guidelines

❌ **INCORRECT**:
```typescript
const view = this.app.workspace.activeLeaf?.view;
```

✅ **CORRECT**:
```typescript
const view = this.app.workspace.getActiveViewOfType(MarkdownView);
if (view) {
  // Work with view
}
```

Rationale: Use `getActiveViewOfType()` instead of directly accessing `workspace.activeLeaf` for safer view access.

---

### Use getActiveLeavesOfType() Instead of Storing Views
Rule: Official guidelines (relates to no-view-references-in-plugin)

❌ **INCORRECT**:
```typescript
// Don't store view references
this.customViews = [];
```

✅ **CORRECT**:
```typescript
// Get views when needed
const views = this.app.workspace.getLeavesOfType(VIEW_TYPE)
  .map(leaf => leaf.view as MyCustomView);
```

Rationale: Don't store references to custom views. Use `getLeavesOfType()` or `getActiveLeavesOfType()` to access them when needed.

---

### Prefer Editor API over Vault.modify()
Rule: Official guidelines

❌ **INCORRECT**:
```typescript
// For active file edits
const activeFile = this.app.workspace.getActiveFile();
await this.app.vault.modify(activeFile, newContent);
```

✅ **CORRECT**:
```typescript
// Use Editor API for active file
const view = this.app.workspace.getActiveViewOfType(MarkdownView);
if (view) {
  const editor = view.editor;
  editor.setValue(newContent);
  // Or use editor methods to preserve cursor
  editor.replaceRange(text, from, to);
}
```

Rationale: Use Editor API for active file edits to preserve cursor position and selection. Use `Vault.modify()` only for non-active files.

---

### Use Vault.process() for Background Modifications
Rule: Official guidelines

❌ **INCORRECT**:
```typescript
// Direct modification can conflict with other plugins
const content = await this.app.vault.read(file);
const modified = content.replace(/old/g, 'new');
await this.app.vault.modify(file, modified);
```

✅ **CORRECT**:
```typescript
// Vault.process() prevents conflicts
await this.app.vault.process(file, (data) => {
  return data.replace(/old/g, 'new');
});
```

Rationale: Use `Vault.process()` for background file modifications—it prevents conflicts with other plugins through atomic operations.

---

### Use FileManager.processFrontMatter() for YAML
Rule: Official guidelines

❌ **INCORRECT**:
```typescript
const content = await this.app.vault.read(file);
const updated = content.replace(/tags:.*/, 'tags: [new-tag]');
await this.app.vault.modify(file, updated);
```

✅ **CORRECT**:
```typescript
await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
  frontmatter.tags = ['new-tag'];
  frontmatter.modified = new Date().toISOString();
});
```

Rationale: Use `FileManager.processFrontMatter()` for YAML modifications to ensure atomic operations and consistent formatting.

---

### Prefer Vault API over Adapter API
Rule: Official guidelines

❌ **INCORRECT**:
```typescript
// Adapter API bypasses Obsidian's safety mechanisms
const content = await this.app.vault.adapter.read(file.path);
await this.app.vault.adapter.write(file.path, newContent);
```

✅ **CORRECT**:
```typescript
// Vault API provides safety and serialization
const content = await this.app.vault.read(file);
await this.app.vault.modify(file, newContent);
```

Rationale: Prefer the Vault API over the Adapter API for better performance and safety through serialized operations.

---

### Use normalizePath() for User-Defined Paths
Rule: Official guidelines

❌ **INCORRECT**:
```typescript
const file = this.app.vault.getAbstractFileByPath(userPath);
```

✅ **CORRECT**:
```typescript
import { normalizePath } from 'obsidian';

const normalizedPath = normalizePath(userPath);
const file = this.app.vault.getAbstractFileByPath(normalizedPath);
```

Rationale: Apply `normalizePath()` to user-defined paths to ensure cross-platform compatibility (handles backslashes, etc.).

---

### Prefer FileManager for Deletion
Rules:
- `obsidianmd/prefer-file-manager-trash`
- `obsidianmd/prefer-file-manager-trash-file`

❌ **INCORRECT**:
```typescript
await this.app.vault.trash(file, system);
```

✅ **CORRECT**:
```typescript
await this.app.fileManager.trashFile(file);
```

Rationale: `fileManager.trashFile()` handles additional cleanup like backlinks.

---

### Avoid Full Vault Iteration
Rule: `obsidianmd/vault/iterate`

❌ **INCORRECT**:
```typescript
// Iterating all files to find one
const files = this.app.vault.getMarkdownFiles();
const target = files.find(f => f.path === targetPath);
```

✅ **CORRECT**:
```typescript
// Direct lookup
const target = this.app.vault.getAbstractFileByPath(targetPath);
```

Rationale: Use direct lookup methods instead of iterating all files for better performance.

---

## Settings & Configuration

### No Manual HTML Headings in Settings
Rule: `obsidianmd/settings-tab/no-manual-html-headings`

❌ **INCORRECT**:
```typescript
containerEl.createEl('h3', { text: 'General settings' });
```

✅ **CORRECT**:
```typescript
new Setting(containerEl).setName('General settings').setHeading();
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

## Code Quality

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

Rationale: Rename placeholder class names from the sample plugin template (`MyPlugin`, `MyPluginSettings`, `SampleSettingTab`, `SampleModal`) to meaningful names for your plugin

---

### Object.assign Must Have 3 Parameters
Rule: `obsidianmd/object-assign`

❌ **INCORRECT**:
```typescript
Object.assign(settings);  // Missing target
```

✅ **CORRECT**:
```typescript
Object.assign({}, DEFAULT_SETTINGS, settings);
```

---

### Avoid Regex Lookbehind
Rule: `obsidianmd/regex-lookbehind`

❌ **INCORRECT**:
```typescript
const pattern = /(?<=@)\w+/;  // Not supported on some iOS versions
```

✅ **CORRECT**:
```typescript
const pattern = /@(\w+)/;
const match = text.match(pattern);
const username = match?.[1];
```

Rationale: Regex lookbehind not supported on iOS versions before 16.4.

---

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

### Avoid Inline Styles
Rule: `obsidianmd/no-static-styles-assignment`

❌ **INCORRECT**:
```typescript
element.style.color = 'red';
element.style.fontSize = '14px';
element.setAttribute('style', 'margin: 10px;');
```

✅ **CORRECT**:
```typescript
// Add class in TypeScript
element.addClass('my-custom-element');

// Define styles in styles.css
.my-custom-element {
  color: red;
  font-size: 14px;
  margin: 10px;
}
```

Rationale: Move all styles to CSS for better theme/snippet adaptability.

---

### Avoid TypeScript `any`
Rule: Type safety best practice

❌ **INCORRECT**:
```typescript
function processData(data: any) {
  return data.value;
}
```

✅ **CORRECT**:
```typescript
// Use specific types
function processData(data: FileData) {
  return data.value;
}

// Or use unknown for truly unknown data
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
}
```

Rationale: `any` bypasses type checking. Use specific types or `unknown` for type safety.

---

### Prefer const and let over var
Rule: Official guidelines (TypeScript best practice)

❌ **INCORRECT**:
```typescript
var count = 0;
var settings = {};
```

✅ **CORRECT**:
```typescript
let count = 0;
const settings = {};
```

Rationale: Use `const` for values that won't be reassigned and `let` for values that will. Avoid `var` for better scoping and fewer bugs.

---

### Use updateOptions() for Editor Extensions
Rule: Official guidelines

```typescript
// When reconfiguring editor extensions
this.app.workspace.updateOptions();
```

Rationale: When reconfiguring editor extensions, use `updateOptions()` to flush changes across all open editors.

---

### Don't Create `<link>` or `<style>` Elements
Rule: `obsidianmd/no-forbidden-elements`

❌ **INCORRECT**:
```typescript
// Don't manually create and append stylesheets
const styleSheet = document.createElement('link');
styleSheet.rel = 'stylesheet';
styleSheet.href = 'path/to/styles.css';
document.head.appendChild(styleSheet);

// Don't create inline style elements
const style = document.createElement('style');
style.textContent = 'body { color: red; }';
document.head.appendChild(style);

// Also forbidden with Obsidian helpers
containerEl.createEl('link');
containerEl.createEl('style');
```

✅ **CORRECT**:
```typescript
// Use styles.css file in your plugin root
// Obsidian automatically loads it for you
// No manual CSS loading needed!
```

Rationale: Creating and attaching `<link>` or `<style>` elements is not allowed. For loading CSS, use a `styles.css` file in your plugin directory, which Obsidian loads automatically.

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

## API Usage & Best Practices

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

### Minimize Console Logging
Rule: Best practice from official guidelines

❌ **INCORRECT**:
```typescript
console.log('Plugin loaded');
console.log('Processing file:', file.path);
console.log('Settings updated:', settings);
```

✅ **CORRECT**:
```typescript
// Only log errors by default
console.error('Failed to process file:', error);

// Use debug mode for development
if (this.settings.debugMode) {
  console.log('Processing file:', file.path);
}
```

Rationale: The developer console should display errors by default, not debug messages. Minimize unnecessary console output.

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

### Use window.setTimeout and window.setInterval
Rule: Platform compatibility

❌ **INCORRECT**:
```typescript
const timer: NodeJS.Timeout = setTimeout(() => {
  // do something
}, 1000);

const interval = setInterval(() => {
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

Rationale: Use `window.setTimeout/setInterval` with `number` type instead of `NodeJS.Timeout` for browser compatibility.

---

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

### Use Obsidian DOM Helpers
Rule: Prefer Obsidian API over vanilla DOM

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
```

Rationale: Obsidian's helper functions (`createDiv()`, `createSpan()`, `createEl()`, `createFragment()`) are more concise and integrate better with the API.

---

### Don't Hardcode Config Directory
Rule: `obsidianmd/hardcoded-config-path`

❌ **INCORRECT**:
```typescript
const configPath = '.obsidian/plugins/my-plugin/';
const pluginDir = vault.adapter.basePath + '/.obsidian/plugins/my-plugin';
```

✅ **CORRECT**:
```typescript
// Access the configured directory
const configDir = this.app.vault.configDir;  // Might not be '.obsidian'
const pluginDir = `${configDir}/plugins/${this.manifest.id}`;

// Or better yet, use the data APIs:
await this.loadData();
await this.saveData(data);
```

Rationale: Obsidian's configuration directory isn't necessarily `.obsidian` - it can be configured by the user. Access it via `Vault#configDir`.

---

## Validation Rules

### Validate manifest.json
Rule: `obsidianmd/validate-manifest`

Ensure your `manifest.json` is valid:
```json
{
  "id": "unique-plugin-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "minAppVersion": "0.15.0",
  "description": "Short description",
  "author": "Your Name",
  "authorUrl": "https://...",
  "isDesktopOnly": false
}
```

---

### Validate LICENSE
Rule: `obsidianmd/validate-license`

Must include a valid LICENSE file (MIT recommended).

---

## Plugin Submission Requirements

### Repository Structure
```
your-plugin/
├── manifest.json       # Required: Plugin metadata
├── main.js            # Required: Compiled plugin code
├── styles.css         # Optional: Plugin styles
├── LICENSE            # Required: License file
└── README.md          # Recommended: Usage documentation
```

### Submission Process

1. Create GitHub Release:
   - Tag must match version in `manifest.json`
   - Include: `manifest.json`, `main.js`, `styles.css`

2. Submit to community-plugins.json:
   - Fork `obsidianmd/obsidian-releases`
   - Add entry to `community-plugins.json`:
     ```json
     {
       "id": "your-plugin-id",
       "name": "Your Plugin Name",
       "author": "Your Name",
       "description": "Short description",
       "repo": "username/repo-name"
     }
     ```
   - Create pull request

3. Follow Developer Policies:
   - Comply with Obsidian's terms of service
   - No malicious code
   - Respect user privacy
   - No analytics without disclosure

---

## Best Practices Summary

### Do's ✅
1. Use `instanceof` for type checking (not type casting)
2. Return views/components directly (don't store unnecessarily)
3. Use sentence case for all UI text (not Title Case)
4. Use `fileManager.trashFile()` for deletions
5. Use Obsidian's data APIs (`loadData()`/`saveData()`)
6. Use `window.setTimeout/setInterval` with `number` type
7. Use async/await instead of Promise chains
8. Use Obsidian DOM helpers (`createDiv()`, `createSpan()`, `createEl()`)
9. Use `vault.configDir` to access config directory
10. Use `.setHeading()` instead of `<h1>`, `<h2>`, `<h3>`
11. Move all styles to CSS (better theme adaptability)
12. Use specific types or `unknown` instead of `any`
13. Use Platform API for OS detection (`Platform.isMacOS`, etc.)
14. Use `AbstractInputSuggest` for autocomplete suggestions
15. Let Obsidian handle leaf cleanup automatically
16. Remove all sample/template code and class names
17. Test on mobile (if not desktop-only)
18. Use direct file lookups instead of vault iteration
19. Follow semantic versioning

### Don'ts ❌
1. Don't use regex lookbehind (iOS < 16.4 incompatibility)
2. Don't hardcode `.obsidian` path (use `vault.configDir`)
3. Don't cast to TFile/TFolder (use `instanceof`)
4. Don't use innerHTML/outerHTML (security risk - XSS)
5. Don't assign styles via JavaScript (move to CSS)
6. Don't create `<link>` or `<style>` elements (use `styles.css` file)
7. Don't include "command" in command names/IDs
8. Don't use Title Case in UI (use sentence case)
9. Don't use bare `setTimeout/setInterval` (use `window.` prefix)
10. Don't create manual HTML headings (use `.setHeading()`)
11. Don't use "General", "settings", or plugin name in settings headings
12. Don't use `any` type (use specific types or `unknown`)
13. Don't use Promise chains (use async/await)
14. Don't use `document.createElement` (use Obsidian helpers)
15. Don't use `navigator.platform/userAgent` (use Platform API)
16. Don't use custom TextInputSuggest (use AbstractInputSuggest)
17. Don't keep sample class names (MyPlugin, SampleModal, etc.)
18. Don't store view references in plugin properties
19. Don't pass plugin as component to MarkdownRenderer
20. Don't detach leaves in `onunload()`
21. Don't duplicate plugin ID in command IDs
22. Don't set default hotkeys
23. Don't iterate vault when direct lookup exists

---

## When Reviewing/Writing Code

1. Check memory management: Are components and views properly managed?
2. Verify type safety: Using `instanceof` instead of casts?
3. Review UI text: Is everything in sentence case?
4. Check command naming: No redundant words?
5. Validate file operations: Using preferred APIs?
6. Test mobile compatibility: No iOS-incompatible features?
7. Clean sample code: Removed all boilerplate?
8. Verify manifest: Correct version, valid structure?

---

## Additional Resources

- ESLint Plugin: `eslint-plugin-obsidianmd` (install for automatic checking)
- Obsidian API Docs: https://docs.obsidian.md
- Sample Plugin: https://github.com/obsidianmd/obsidian-sample-plugin
- Community: Obsidian Discord, Forum

---

Note: These guidelines are based on `eslint-plugin-obsidianmd` which is under active development. Rules marked as auto-fixable can be automatically corrected with ESLint's `--fix` flag.

When helping with Obsidian plugin development, proactively apply these rules and suggest improvements based on these guidelines.
