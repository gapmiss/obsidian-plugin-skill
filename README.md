# Obsidian Plugin Development - Agent Skill

A comprehensive agent skill for developing high-quality Obsidian plugins that follow best practices, pass code review, and adhere to official submission guidelines.

## Overview

This skill provides your coding agent with deep knowledge of Obsidian plugin development standards, including:

- All 36 ESLint rules from `eslint-plugin-obsidianmd` v0.2.8
- Official Plugin Guidelines from Obsidian documentation
- Submission requirements for the community plugins directory
- Memory management and lifecycle best practices
- Security guidelines and XSS prevention
- Platform compatibility (including iOS considerations)
- Network request best practices (requestUrl vs fetch)

## Prerequisites

- A coding agent supporting the [Agent Skills standard](https://agentskills.io) (Claude Code, OpenAI Codex, or Windsurf)
- An Obsidian plugin project (or starting a new one)

## Installation

### Quick Install

```bash
npx skills add https://github.com/gapmiss/obsidian-plugin-skill --skill obsidian
```

### Setup

#### Option 1: Installer Script (Recommended)

1. Clone this repository:
   ```bash
   git clone https://github.com/gapmiss/obsidian-plugin-skill.git
   cd obsidian-plugin-skill
   ```

2. Run the installer:
   ```bash
   ./install-skill.sh
   ```

3. Select your provider(s):
   - **All providers** — installs to both `.agents/skills/` and `.claude/skills/`
   - **Claude Code** — installs to `.claude/skills/` with slash commands
   - **Codex (OpenAI)** — installs to `.agents/skills/`
   - **Windsurf** — installs to `.agents/skills/`

4. Choose installation target (current directory or custom path)

#### Option 2: Manual Install

<details>
<summary>Claude Code</summary>

```bash
git clone https://github.com/gapmiss/obsidian-plugin-skill.git
cd obsidian-plugin-skill

# Copy skill
mkdir -p your-project/.claude/skills/obsidian
cp -r .agents/skills/obsidian/* your-project/.claude/skills/obsidian/

# Copy slash commands
mkdir -p your-project/.claude/commands
cp .claude/commands/obsidian.md your-project/.claude/commands/
cp .claude/commands/create-plugin.md your-project/.claude/commands/
```
</details>

<details>
<summary>Codex (OpenAI) / Windsurf</summary>

```bash
git clone https://github.com/gapmiss/obsidian-plugin-skill.git
cd obsidian-plugin-skill

# Copy skill
mkdir -p your-project/.agents/skills/obsidian
cp -r .agents/skills/obsidian/* your-project/.agents/skills/obsidian/
```
</details>

#### Option 3: Use as Standalone

Just open this directory with your coding agent — no installation needed!

### Skill Structure

The skill uses **progressive disclosure** for optimal performance:

```
.agents/skills/obsidian/
├── SKILL.md                          # Main overview (285 lines)
└── reference/                        # Detailed documentation
    ├── memory-management.md          # Lifecycle & cleanup patterns
    ├── type-safety.md                # Type narrowing & safety
    ├── ui-ux.md                      # UI standards & commands
    ├── file-operations.md            # Vault & file API
    ├── css-styling.md                # Theming & styling
    ├── accessibility.md              # A11y requirements (MANDATORY)
    ├── code-quality.md               # Best practices & security
    ├── submission.md                 # Publishing guidelines
    └── eslint-setup.md               # Complete ESLint config guide
```

SKILL.md provides a concise overview with all 36 rules, while reference files contain comprehensive details on specific topics.

## Quick Start: Creating a New Plugin

### Interactive Boilerplate Generator

The fastest way to start a new Obsidian plugin with all best practices built-in:

```bash
node /path/to/obsidian-plugin-skill/tools/create-plugin.js
```

**Features:**
- Generates clean TypeScript boilerplate with **no sample code**
- Creates `src/` directory structure with `main.ts` and `settings.ts`
- **Validates plugin metadata in real-time** against Obsidian's submission bot rules
- Prompts for target directory to avoid overwriting existing files
- Detects existing projects and only adds missing files
- All generated code follows the skill's best practices automatically

**What it creates:**
```
your-plugin/
├── src/
│   ├── main.ts           # Plugin class with settings integration
│   └── settings.ts       # Settings interface, defaults, and tab
├── manifest.json         # Validated plugin metadata
├── styles.css           # CSS with Obsidian variables
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies
├── esbuild.config.mjs   # Build configuration
├── eslint.config.mjs    # ESLint configuration
├── version-bump.mjs     # Version management script
├── versions.json        # Version tracking
├── .gitignore          # Git ignore rules
└── LICENSE             # MIT license
```

**Interactive prompts:**
1. Target directory (default: current directory)
2. Plugin name (validates: no "Obsidian", can't end with "Plugin")
3. Plugin ID (validates: no "obsidian", can't end with "plugin", lowercase only)
4. Description (validates: no "Obsidian"/"This plugin", must end with punctuation)
5. Author name
6. GitHub username (optional, auto-generates authorUrl)
7. Minimum Obsidian version

**Real-time validation catches common mistakes:**
```
❌ Validation Errors:
   • Plugin ID cannot contain "obsidian"
   • Plugin name cannot end with "Plugin"
   • Description must end with punctuation: . ? ! or )
```

---

## Usage

### Invoking the Skill

| Provider | Load skill | Create plugin |
|----------|-----------|---------------|
| Claude Code | `/obsidian` | `/create-plugin` |
| Codex (OpenAI) | `$obsidian` | — |
| Windsurf | `@obsidian` | — |

Skills are automatically discovered by your agent when present in the project directory. You can also invoke them explicitly using the commands above.

Just ask your agent naturally:

```
Help me implement a new command for my Obsidian plugin
```

Your agent will automatically use the Obsidian skill guidelines while helping you write code.

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

### Most Critical Rules (eslint-plugin-obsidianmd v0.2.8)

The main SKILL.md file highlights the most important rules organized by category:

**Submission & Naming:**
1. Plugin ID: no "obsidian", can't end with "plugin"
2. Plugin name: no "Obsidian", can't end with "Plugin"
3. Plugin name: can't start with "Obsi" or end with "dian"
4. Description: no "Obsidian", "This plugin", etc.
5. Description must end with `.?!)` punctuation

**Memory & Lifecycle:**
6. Use `registerEvent()` for automatic cleanup
7. Don't store view references in plugin
8. Don't call `detachLeavesOfType()` in `onunload`

**Type Safety:**
9. Use `instanceof` instead of type casting for TFile/TFolder
10. Use `.instanceOf(T)` for cross-window DOM checks

**UI/UX:**
11. Use sentence case for all UI text
12. Sentence case in locale JSON files
13. Sentence case in TS/JS locale modules
14. No "command" in command names/IDs
15. No plugin ID/name in command IDs/names
16. No default hotkeys
17. Use `.setHeading()` for settings headings

**API Best Practices:**
18. Use Editor API for active file edits
19. Use `Vault.process()` for background file mods
20. Use `FileManager.trashFile()` for file deletion
21. Use `Vault.getAbstractFileByPath()` instead of iterating files
22. Use `normalizePath()` for user paths
23. Use `Platform` API for OS detection
24. Use `requestUrl()` instead of `fetch()`
25. No console.log in onload/onunload in production
26. Use built-in `AbstractInputSuggest`
27. Check `minAppVersion` for API compatibility

**Popout Window Compatibility:**
28. Use `activeDocument`/`activeWindow` instead of globals
29. Use `activeWindow.setTimeout()` for timers

**Event Handling:**
30. Check `evt.defaultPrevented` in editor-drop/paste handlers

**Styling:**
31. Use Obsidian CSS variables
32. Scope CSS to plugin containers
33. Don't create `<link>` or `<style>` elements

**Accessibility (MANDATORY):**
34. Make all interactive elements keyboard accessible
35. Provide ARIA labels for icon buttons
36. Define clear focus indicators

**Security & Compatibility:**
- Don't use `innerHTML`/`outerHTML`
- Avoid regex lookbehind

**Code Quality:**
- Remove all sample/template code
- Don't mutate defaults with `Object.assign`
- Validate LICENSE copyright holder and year

### Detailed Coverage by Topic

**[Memory Management & Lifecycle](/.agents/skills/obsidian/reference/memory-management.md)**
- Using `registerEvent()`, `addCommand()`, `registerDomEvent()`, `registerInterval()`
- Avoiding view references in plugin
- Not using plugin as component
- Proper leaf cleanup

**[Type Safety](/.agents/skills/obsidian/reference/type-safety.md)**
- Using `instanceof` instead of type casting
- Avoiding `any` type
- Using `const` and `let` over `var`

**[UI/UX Standards](/.agents/skills/obsidian/reference/ui-ux.md)**
- Sentence case enforcement
- Command naming conventions
- Settings and configuration best practices

**[File & Vault Operations](/.agents/skills/obsidian/reference/file-operations.md)**
- View access patterns
- Editor vs Vault API
- Atomic file operations (Vault.process, processFrontMatter)
- File management and path handling

**[CSS Styling Best Practices](/.agents/skills/obsidian/reference/css-styling.md)**
- Avoiding inline styles
- Using Obsidian CSS variables
- Scoping plugin styles
- Theme support (light/dark)
- Spacing and layout (4px grid)

**[Accessibility (A11y)](/.agents/skills/obsidian/reference/accessibility.md)** - MANDATORY
- Keyboard navigation for all interactive elements
- ARIA labels and roles
- Tooltips with proper positioning
- Focus management
- Focus visible styles (`:focus-visible`)
- Screen reader support
- Mobile and touch accessibility (44×44px minimum)

**[Code Quality & Best Practices](/.agents/skills/obsidian/reference/code-quality.md)**
- Removing sample code
- Security best practices (XSS prevention)
- Platform compatibility (iOS, mobile)
- API usage patterns
- Async/await patterns
- DOM helpers

**[Plugin Submission Requirements](/.agents/skills/obsidian/reference/submission.md)**
- **Naming and description validation rules** (enforced by Obsidian's release bot)
- Plugin ID, name, and description requirements
- Repository structure and manifest synchronization
- Submission process to obsidianmd/obsidian-releases
- Semantic versioning
- Testing checklist

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

**Submission Validation (will fail bot checks if incorrect):**
- [ ] Plugin ID: no "obsidian", doesn't end with "plugin", lowercase only
- [ ] Plugin name: no "Obsidian", doesn't end with "Plugin"
- [ ] Plugin name: doesn't start with "Obsi" or end with "dian"
- [ ] Description: no "Obsidian" or "This plugin" phrases
- [ ] Description ends with proper punctuation (. ? ! or ))
- [ ] Description under 250 characters (recommended)
- [ ] manifest.json ID, name, description match submission entry

**Code Quality:**
- [ ] No memory leaks (views/components properly managed)
- [ ] Type safety (using `instanceof` instead of casts)
- [ ] All UI text in sentence case
- [ ] No redundant words in command names
- [ ] Using preferred APIs (Editor API, Vault.process, etc.)
- [ ] No iOS-incompatible features (regex lookbehind)
- [ ] All sample code removed (MyPlugin, SampleModal, etc.)
- [ ] No security issues (innerHTML, XSS vulnerabilities)

**Accessibility (MANDATORY):**
- [ ] **All interactive elements keyboard accessible (Tab, Enter, Space)**
- [ ] **ARIA labels on all icon buttons (`aria-label`)**
- [ ] **Clear focus indicators (`:focus-visible` with proper CSS)**
- [ ] **Touch targets at least 44×44px (mobile)**
- [ ] **Tooltips positioned with `data-tooltip-position`**

**Release Requirements:**
- [ ] manifest.json valid and version correct
- [ ] LICENSE file included
- [ ] Mobile tested (if not desktop-only)
- [ ] Repository has issues enabled

## ESLint Integration

For automatic checking, install the official ESLint plugin **and** typescript-eslint:

```bash
npm install --save-dev eslint typescript-eslint @typescript-eslint/parser eslint-plugin-obsidianmd
```

**Important:** The community plugin scanner uses **both** `eslint-plugin-obsidianmd` AND `typescript-eslint` type-checked rules. Most submission failures come from missing the typescript-eslint setup.

See the **[complete ESLint setup guide](/.agents/skills/obsidian/reference/eslint-setup.md)** for:
- Full `eslint.config.mjs` that matches the community scanner
- Why `recommendedTypeChecked` is required (not just `recommended`)
- Common violations and how to fix them
Quick config example:

```javascript
// eslint.config.mjs
import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
  { ignores: ["node_modules/**", "main.js"] },
  // Type-checked rules — this is what most people miss
  ...tseslint.configs.recommendedTypeChecked.map(c => ({ ...c, files: ["src/**/*.ts"] })),
  // Obsidian-specific rules
  ...obsidianmd.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: "./tsconfig.json" },
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
- Agent Skills Standard: https://agentskills.io

## Contributing

Found a missing guideline or rule? Please contribute!

1. Fork this repository
2. Add the guideline to the appropriate file:
   - Main overview: `.agents/skills/obsidian/SKILL.md`
   - Detailed coverage: `.agents/skills/obsidian/reference/*.md`
3. Update this README if needed
4. Submit a pull request

### Adding New Guidelines

When adding new content:
- Keep SKILL.md under 500 lines (progressive disclosure principle)
- Add detailed content to appropriate reference files
- Use consistent formatting and examples
- Include both incorrect and correct examples

## Migration from `.claude/skills/`

If you previously installed this skill to `.claude/skills/obsidian/`, you can migrate:

```bash
# Move skill files to the new location
mv .claude/skills/obsidian .agents/skills/obsidian

# Keep .claude/commands/ as-is (Claude Code only)
```

The `.claude/skills/` path still works for Claude Code, but `.agents/skills/` is the standard location recognized by all providers.

## License

MIT License - See LICENSE file for details

## Acknowledgments

This skill is based on:
- The official Obsidian Plugin Guidelines
- The `eslint-plugin-obsidianmd` package (not yet production-ready)
- Community best practices from plugin developers
- Agent Skills standard best practices (progressive disclosure pattern)

---

## Design Philosophy

This skill follows **Agent Skills standard best practices**:

- **Progressive Disclosure**: Main SKILL.md (263 lines) provides overview; reference files contain details
- **Context Window Efficiency**: "The context window is a public good" - optimized token usage
- **One-Level-Deep References**: All reference files directly under `reference/` (no nesting)
- **Topic-Based Organization**: Each reference file focuses on a specific domain
- **Consistent Terminology**: Same terms used throughout for clarity

This structure allows your coding agent to load the essential information quickly while having access to comprehensive details when needed.

---

Note: Guidelines in this skill are based on `eslint-plugin-obsidianmd` v0.2.8. The plugin is under active development and rules may evolve.
