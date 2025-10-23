# Obsidian Plugin Development - Claude Skill

A comprehensive Claude Code skill for developing high-quality Obsidian plugins that follow best practices, pass code review, and adhere to official submission guidelines.

## Overview

This skill provides Claude with deep knowledge of Obsidian plugin development standards, including:

- 32 ESLint rules from `eslint-plugin-obsidianmd`
- Official Plugin Guidelines from Obsidian documentation
- Submission requirements for the community plugins directory
- Memory management and lifecycle best practices
- Security guidelines and XSS prevention
- Platform compatibility (including iOS considerations)

## Installation

This skill is located in `.claude/skills/obsidian/SKILL.md` and works with Claude Code CLI.

### Prerequisites

- [Claude Code CLI](https://docs.claude.com/en/docs/claude-code) installed
- An Obsidian plugin project (or starting a new one)

### Setup

1. Clone or download this repository:
   ```bash
   git clone <repository-url>
   cd obsidian-plugin-skill
   ```

2. Copy the skill to your project:
   ```bash
   # Option 1: Copy to your project's .claude directory
   mkdir -p your-project/.claude/skills/obsidian
   cp .claude/skills/obsidian/SKILL.md your-project/.claude/skills/obsidian/

   # Also copy the slash command
   mkdir -p your-project/.claude/commands
   cp .claude/commands/obsidian.md your-project/.claude/commands/

   # Option 2: Use as a standalone skill repository
   # Just open this directory with Claude Code
   ```

3. The skill is now available to Claude Code!

## Usage

### How Skills Work

**Skills are automatically invoked by Claude** - you don't need to explicitly call them. When you work on Obsidian plugin development in a directory containing this skill, Claude will automatically load and apply these guidelines based on your requests.

Just ask Claude naturally:

```
Help me implement a new command for my Obsidian plugin
```

Claude will automatically use the Obsidian skill guidelines while helping you write code.

### Optional: Manual Invocation

If you want to explicitly load the skill, you can use the slash command:

```
/obsidian
```

Or reference the skill directly:

```
Following the Obsidian plugin guidelines, help me refactor this code...
```

### What the Skill Helps With

#### Code Quality
- Prevents common memory leaks
- Enforces type safety (no unsafe casts)
- Ensures proper resource cleanup
- Follows Obsidian's API patterns

#### UI/UX Standards
- Enforces sentence case for all UI text
- Prevents redundant naming patterns
- Ensures consistent settings UI

#### Accessibility (A11y)
- **MANDATORY keyboard navigation** for all interactive elements
- **MANDATORY ARIA labels** for icon buttons and controls
- **MANDATORY focus indicators** with proper CSS styling
- Touch target size requirements (44×44px minimum)
- Screen reader support and announcements
- Tooltip positioning with `data-tooltip-position`

#### Security
- Prevents XSS vulnerabilities (no innerHTML/outerHTML)
- Validates manifest structure
- Ensures proper path handling

#### Platform Compatibility
- iOS compatibility checks (no regex lookbehind)
- Cross-platform path handling
- Mobile-friendly API usage

#### Submission Ready
- Removes template/sample code
- Validates manifest.json
- Ensures LICENSE compliance
- Follows submission requirements

## What's Covered

### Memory Management & Lifecycle
- Use `registerEvent()` and `addCommand()` for cleanup
- Don't store view references in plugin
- Don't use plugin as component
- Don't detach leaves in onunload

### Type Safety
- Avoid type casting to TFile/TFolder (use `instanceof`)
- Avoid TypeScript `any` (use specific types or `unknown`)
- Prefer `const` and `let` over `var`

### Command Best Practices
- No redundant "command" in names
- No plugin ID/name in command IDs
- No default hotkeys
- Appropriate callback types (callback vs checkCallback vs editorCallback)

### UI/UX Standards
- Sentence case for all UI text (auto-fixable)
- Use `.setHeading()` instead of `<h1>`, `<h2>`, `<h3>`
- No "General", "settings", or plugin name in settings headings

### File & Vault Operations
- Use `getActiveViewOfType()` for view access
- Prefer Editor API over `Vault.modify()` for active files
- Use `Vault.process()` for background modifications
- Use `FileManager.processFrontMatter()` for YAML
- Prefer Vault API over Adapter API
- Use `normalizePath()` for user-defined paths
- Use `fileManager.trashFile()` for deletions
- Avoid full vault iteration (use direct lookups)

### Code Quality
- Remove all sample code and template class names
- Object.assign must have 3 parameters
- Avoid regex lookbehind (iOS < 16.4 incompatibility)
- Avoid innerHTML/outerHTML (XSS security risk)
- Move styles to CSS (no inline styles)
- Don't create `<link>` or `<style>` elements
- Use Platform API (not navigator.platform)
- Use AbstractInputSuggest (not custom TextInputSuggest)

### API Best Practices
- Don't use global `app` (use `this.app`)
- Minimize console logging
- Organize multi-file plugins into folders
- Use `window.setTimeout/setInterval` with `number` type
- Prefer async/await over Promise chains
- Use Obsidian DOM helpers (createDiv, createSpan, createEl)
- Don't hardcode config directory (use `vault.configDir`)

### Validation & Submission
- Validate manifest.json structure
- Include LICENSE file
- Follow repository structure requirements
- Follow submission process to obsidian-releases

## Examples

### Before (Incorrect)
```typescript
// Multiple issues
class MyPlugin extends Plugin {
  view: CustomView;

  async onload() {
    this.registerView(VIEW_TYPE, (leaf) => {
      this.view = new CustomView(leaf);  // Memory leak!
      return this.view;
    });

    this.addCommand({
      id: 'my-plugin-show-command',  // Redundant naming
      name: 'Show Command',  // Title Case
      hotkeys: [{ modifiers: ['Mod'], key: 's' }],  // Default hotkey
    });

    const file = abstractFile as TFile;  // Unsafe cast
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);  // Don't do this
  }
}
```

### After (Correct)
```typescript
// Following all guidelines
class TodoPlugin extends Plugin {
  async onload() {
    this.registerView(VIEW_TYPE, (leaf) => {
      return new CustomView(leaf);  // Create and return directly
    });

    this.addCommand({
      id: 'show',  // Clean naming
      name: 'Show todo',  // Sentence case
      // Let users set their own hotkeys
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
          if (!checking) {
            // Perform action
          }
          return true;
        }
        return false;
      }
    });

    if (abstractFile instanceof TFile) {
      // Safe type narrowing
      const file = abstractFile;
    }
  }

  onunload() {
    // Let Obsidian handle cleanup
  }
}
```

## Checklist for Plugin Review

Use this checklist before submitting your plugin:

- [ ] No memory leaks (views/components properly managed)
- [ ] Type safety (using `instanceof` instead of casts)
- [ ] All UI text in sentence case
- [ ] No redundant words in command names
- [ ] Using preferred APIs (Editor API, Vault.process, etc.)
- [ ] No iOS-incompatible features (regex lookbehind)
- [ ] All sample code removed (MyPlugin, SampleModal, etc.)
- [ ] manifest.json valid and version correct
- [ ] LICENSE file included
- [ ] No security issues (innerHTML, XSS vulnerabilities)
- [ ] **All interactive elements keyboard accessible (Tab, Enter, Space)**
- [ ] **ARIA labels on all icon buttons (`aria-label`)**
- [ ] **Clear focus indicators (`:focus-visible` with proper CSS)**
- [ ] **Touch targets at least 44×44px (mobile)**
- [ ] **Tooltips positioned with `data-tooltip-position`**
- [ ] Mobile tested (if not desktop-only)

## ESLint Integration

For automatic checking, install the official ESLint plugin:

```bash
npm install --save-dev eslint eslint-plugin-obsidianmd
```

Create `eslint.config.js`:

```javascript
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
  ...obsidianmd.configs.recommended,
  {
    rules: {
      // Customize rules as needed
      "obsidianmd/ui/sentence-case": ["warn", {
        brands: ["Obsidian", "GitHub"],
        acronyms: ["API", "URL", "HTML"],
        enforceCamelCaseLower: true,
      }],
    },
  },
];
```

Many rules are auto-fixable with:
```bash
npx eslint --fix .
```

## Resources

- Obsidian API Docs: https://docs.obsidian.md
- ESLint Plugin: https://github.com/obsidianmd/eslint-plugin
- Sample Plugin: https://github.com/obsidianmd/obsidian-sample-plugin
- Plugin Guidelines: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- Submission Repo: https://github.com/obsidianmd/obsidian-releases

## Contributing

Found a missing guideline or rule? Please contribute!

1. Fork this repository
2. Add the guideline to `.claude/skills/obsidian/SKILL.md`
3. Update this README if needed
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Acknowledgments

This skill is based on:
- The official Obsidian Plugin Guidelines
- The `eslint-plugin-obsidianmd` package (not yet production-ready)
- Community best practices from plugin developers

---

Note: The ESLint plugin is under active development. Guidelines in this skill reflect current best practices but may evolve as the Obsidian API matures.
