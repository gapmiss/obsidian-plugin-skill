---
name: obsidian
description: Comprehensive guidelines for Obsidian.md plugin development including all 36 ESLint rules from eslint-plugin-obsidianmd v0.2.8, TypeScript best practices, memory management, API usage (requestUrl vs fetch), UI/UX standards, locale file sentence-case enforcement, popout window compatibility, and submission requirements. Use when working with Obsidian plugins, main.ts files, manifest.json, Plugin class, MarkdownView, TFile, vault operations, or any Obsidian API development.
license: MIT
metadata: 
  version: 1.6.0
---

# Obsidian Plugin Development Guidelines

Follow these comprehensive guidelines derived from the official Obsidian ESLint plugin rules, submission requirements, and best practices.

## Getting Started

### Quick Start Tool

For new plugin projects, an interactive boilerplate generator is available:
- **Script**: `tools/create-plugin.js` in the skill repository
- **Command**: Invoke `create-plugin` using your agent's method (`/create-plugin`, `$create-plugin`, or `@create-plugin`)
- Generates minimal, best-practice boilerplate with no sample code
- Detects existing projects and only adds missing files

Recommend the boilerplate generator when users ask how to create a new plugin, want to start a new project, or need help setting up the basic structure.

---

## Rules Reference (eslint-plugin-obsidianmd v0.2.8)

### Submission & Naming
| # | Rule | ✅ Do | ❌ Don't |
|---|------|--------|----------|
| 1 | Plugin ID | Omit "obsidian"; don't end with "plugin" | Include "obsidian" or end with "plugin" |
| 2 | Plugin name | Omit "Obsidian"; don't end with "Plugin" | Include "Obsidian" or end with "Plugin" |
| 3 | Plugin name | Don't start with "Obsi" or end with "dian" | Start with "Obsi" or end with "dian" |
| 4 | Description | Omit "Obsidian", "This plugin", etc. | Use "Obsidian" or "This plugin" |
| 5 | Description | End with `.?!)` punctuation | Leave description without terminal punctuation |

### Memory & Lifecycle
| # | Rule | ✅ Do | ❌ Don't |
|---|------|--------|----------|
| 6 | Event cleanup | Use `registerEvent()` for automatic cleanup | Register events without cleanup |
| 7 | View references | Return views/components directly | Store view references in plugin properties or pass plugin as component to `MarkdownRenderer` |
| 8 | Leaf detachment | Let Obsidian handle leaf cleanup | Call `detachLeavesOfType()` in `onunload` |

### Type Safety
| # | Rule | ✅ Do | ❌ Don't |
|---|------|--------|----------|
| 9 | TFile/TFolder | Use `instanceof` for type checking | Cast to TFile/TFolder; use `any`; use `var` |
| 10 | DOM instanceof | Use `.instanceOf(T)` for DOM Nodes/UIEvents | Use `instanceof` for cross-window DOM checks |

### UI/UX
| # | Rule | ✅ Do | ❌ Don't |
|---|------|--------|----------|
| 11 | UI text | Sentence case — "Advanced settings" | Title Case — "Advanced Settings" |
| 12 | JSON locale | Sentence case in JSON locale files (`recommendedWithLocalesEn`) | Title case in locale JSON |
| 13 | TS/JS locale | Sentence case in TS/JS locale modules | Title case in locale modules |
| 14 | Command names | Omit "command" in command names/IDs | Include "command" in names/IDs |
| 15 | Command IDs | Omit plugin ID/name from command IDs/names | Duplicate plugin ID in command IDs |
| 16 | Hotkeys | No default hotkeys | Set default hotkeys |
| 17 | Settings headings | Use `.setHeading()` | Create manual HTML headings; use "General", "settings", or plugin name in headings |

### API Best Practices
| # | Rule | ✅ Do | ❌ Don't |
|---|------|--------|----------|
| 18 | Active file edits | Use Editor API | Use `Vault.modify()` for active file edits |
| 19 | Background file mods | Use `Vault.process()` | Use `Vault.modify()` for background modifications |
| 20 | File deletion | Use `FileManager.trashFile()` | Use `Vault.trash()` or `Vault.delete()` directly |
| 21 | File lookup | Use `Vault.getAbstractFileByPath()` | Iterate all files with `Vault.getFiles().find()` |
| 22 | User paths | Use `normalizePath()` | Hardcode `.obsidian` path; use raw user paths |
| 23 | OS detection | Use `Platform` API | Use `navigator.platform`/`userAgent` |
| 24 | Network requests | Use `requestUrl()` | Use `fetch()` |
| 25 | Logging | Minimize console logging; none in `onload`/`onunload` in production | Use `console.log` in `onload`/`onunload` |
| 26 | Input suggest | Use built-in `AbstractInputSuggest` | Copy Liam's `TextInputSuggest` implementation |
| 27 | API compatibility | Check `minAppVersion` for API availability | Use APIs not available in declared minAppVersion |
| 28 | Language detection | Use Obsidian's `getLanguage()` | Use `localStorage.getItem('language')` or `i18next-browser-languagedetector` |

### Popout Window Compatibility
| # | Rule | ✅ Do | ❌ Don't |
|---|------|--------|----------|
| 29 | Document/Window | Use `activeDocument` and `activeWindow` | Use global `document` and `window` |
| 30 | Timers | Use `activeWindow.setTimeout()`, `setInterval()`, etc. | Use bare `setTimeout()`, `setInterval()` |

### Event Handling
| # | Rule | ✅ Do | ❌ Don't |
|---|------|--------|----------|
| 31 | Editor drop/paste | Check `evt.defaultPrevented` and call `evt.preventDefault()` | Handle editor-drop/paste without checking defaultPrevented |

### Styling
| # | Rule | ✅ Do | ❌ Don't |
|---|------|--------|----------|
| 32 | CSS variables | Use Obsidian CSS variables for all styling | Hardcode colors, sizes, or spacing |
| 33 | CSS scope | Scope CSS to plugin containers | Use broad CSS selectors |
| 34 | Style elements | Use `styles.css` file (`no-forbidden-elements`) | Create `<link>` or `<style>` elements; assign styles via JavaScript |

### Security & Compatibility
| # | Rule | ✅ Do | ❌ Don't |
|---|------|--------|----------|
| 35 | DOM creation | Use Obsidian DOM helpers (`createEl()`, `createDiv()`, `createSpan()`, `createSvg()`, `createFragment()`) via `prefer-create-el` | Use `document.createElement()`, `document.createDocumentFragment()`, etc. |
| 36 | Node.js modules | Guard Node.js imports with `Platform.isDesktop` check (`no-nodejs-modules`) | Import Node.js modules without platform guard |
| 37 | iOS compat | Avoid regex lookbehind (iOS < 16.4 incompatibility) | Use regex lookbehind |

### Accessibility (MANDATORY)
| # | Rule | ✅ Do | ❌ Don't |
|---|------|--------|----------|
| 38 | Keyboard access | Make all interactive elements keyboard accessible; Tab through all elements | Create inaccessible interactive elements |
| 39 | ARIA labels | Provide ARIA labels for icon buttons; use `data-tooltip-position` for tooltips | Use icon buttons without ARIA labels |
| 40 | Focus indicators | Use `:focus-visible` with Obsidian CSS variables; touch targets ≥ 44×44px | Remove focus indicators; make touch targets < 44×44px |

### Code Quality
| Rule | ✅ Do | ❌ Don't |
|------|--------|----------|
| Sample code | Remove all sample/template code | Keep class names like MyPlugin, SampleModal |
| Object.assign | `Object.assign({}, defaults, overrides)` (`object-assign`) | `Object.assign(defaultsVar, other)` — mutates defaults |
| LICENSE | Copyright holder must not be "Dynalist Inc."; year must be current (`validate-license`) | Leave "Dynalist Inc." as holder or use an outdated year |
| Async | Use async/await | Use Promise chains |

---

## Detailed Guidelines

For comprehensive information on specific topics, see the reference files:

### [Memory Management & Lifecycle](reference/memory-management.md)
- Using `registerEvent()`, `addCommand()`, `registerDomEvent()`, `registerInterval()`
- Avoiding view references in plugin
- Not using plugin as component
- Proper leaf cleanup

### [Type Safety](reference/type-safety.md)
- Using `instanceof` instead of type casting
- Avoiding `any` type
- Using `const` and `let` over `var`

### [UI/UX Standards](reference/ui-ux.md)
- Sentence case enforcement (TypeScript, JSON locale, TS/JS locale modules)
- `recommendedWithLocalesEn` config for locale file checks
- Command naming conventions (no "command", no plugin name, no plugin ID)
- Settings and configuration best practices

### [File & Vault Operations](reference/file-operations.md)
- View access patterns
- Editor vs Vault API
- Atomic file operations
- File management
- Path handling

### [CSS Styling Best Practices](reference/css-styling.md)
- Avoiding inline styles
- Using Obsidian CSS variables
- Scoping plugin styles
- Theme support
- Spacing and layout

### [Accessibility (A11y)](reference/accessibility.md)
- Keyboard navigation (MANDATORY)
- ARIA labels and roles (MANDATORY)
- Tooltips and accessibility
- Focus management (MANDATORY)
- Focus visible styles (MANDATORY)
- Screen reader support (MANDATORY)
- Mobile and touch accessibility (MANDATORY)
- Accessibility checklist

### [Code Quality & Best Practices](reference/code-quality.md)
- Removing sample code
- Security best practices
- Platform compatibility
- API usage best practices
- Async/await patterns
- DOM helpers

### [Plugin Submission Requirements](reference/submission.md)
- Repository structure
- Submission process
- Semantic versioning
- Testing checklist
- Additional resources and important notes

### [ESLint Setup Guide](reference/eslint-setup.md)
- Complete ESLint config for community scanner compliance
- Why `typescript-eslint` recommendedTypeChecked is required
- Common violations and fixes (floating promises, require imports, etc.)
- Popout window compatibility rules

---

## Plugin Submission Validation Workflow

Before submitting a plugin, follow this sequence:

1. **Run ESLint** — `npx eslint .` using `eslint-plugin-obsidianmd`; fix all errors (warnings are informational)
2. **Validate manifest** — Confirm `id`, `name`, `description`, `version`, and `minAppVersion` meet naming and formatting rules (rules 1–5)
3. **Check LICENSE** — Copyright holder must not be "Dynalist Inc." and the year must be current
4. **Test on mobile** — Verify no regex lookbehind, no `fetch()`, and touch targets ≥ 44×44px (skip only if plugin is declared desktop-only)
5. **Keyboard accessibility audit** — Tab through all interactive elements; confirm focus indicators and ARIA labels are present
6. **Submit** — Open a PR to the community plugins repository with the updated `manifest.json` and `community-plugins.json` entry

If ESLint reports new errors after fixing, re-run from step 1.

---

## When Reviewing/Writing Code

Use this checklist for code review and implementation:

1. **Memory management**: Are components and views properly managed?
2. **Type safety**: Using `instanceof` instead of casts?
3. **UI text**: Is everything in sentence case?
4. **Command naming**: No redundant words?
5. **File operations**: Using preferred APIs?
6. **Mobile compatibility**: No iOS-incompatible features?
7. **Sample code**: Removed all boilerplate?
8. **Manifest**: Correct version, valid structure?
9. **Accessibility**: Keyboard navigation, ARIA labels, focus indicators?
10. **Testing**: Can you use the plugin without a mouse?
11. **Touch targets**: Are all interactive elements at least 44×44px?
12. **Focus styles**: Using `:focus-visible` and proper CSS variables?

---

## Common Patterns

### Proper Command Registration

```typescript
// ✅ CORRECT
this.addCommand({
  id: 'insert-timestamp',
  name: 'Insert timestamp',
  editorCallback: (editor: Editor, view: MarkdownView) => {
    editor.replaceSelection(new Date().toISOString());
  }
});
```

### Safe Type Narrowing

```typescript
// ✅ CORRECT
const file = this.app.vault.getAbstractFileByPath(path);
if (file instanceof TFile) {
  // TypeScript now knows it's a TFile
  await this.app.vault.read(file);
}
```

### Keyboard Accessible Button

```typescript
// ✅ CORRECT
const button = containerEl.createEl('button', {
  attr: {
    'aria-label': 'Open settings',
    'data-tooltip-position': 'top'
  }
});
button.setText('⚙️');

button.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    performAction();
  }
});
```

### Themed CSS

```css
/* ✅ CORRECT */
.my-plugin-modal {
  background: var(--modal-background);
  color: var(--text-normal);
  padding: var(--size-4-4);
  border-radius: var(--radius-m);
  font-size: var(--font-ui-medium);
}

.my-plugin-button:focus-visible {
  outline: 2px solid var(--interactive-accent);
  outline-offset: 2px;
}
```

---

When helping with Obsidian plugin development, proactively apply these rules and suggest improvements based on these guidelines. Refer to the detailed reference files for comprehensive information on specific topics.
