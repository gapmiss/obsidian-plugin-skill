# Obsidian Plugin Development - Claude Skill

A comprehensive Claude Code skill for developing high-quality Obsidian plugins that follow best practices, pass code review, and adhere to official submission guidelines.

## Overview

This skill provides Claude with deep knowledge of Obsidian plugin development standards, including:

- All 27 ESLint rules from `eslint-plugin-obsidianmd`
- Official Plugin Guidelines from Obsidian documentation
- Submission requirements for the community plugins directory
- Memory management and lifecycle best practices
- Security guidelines and XSS prevention
- Platform compatibility (including iOS considerations)
- Network request best practices (requestUrl vs fetch)

## Installation

This skill is located in `.claude/skills/obsidian/` and works with Claude Code CLI.

### Prerequisites

- [Claude Code CLI](https://docs.claude.com/en/docs/claude-code) installed
- An Obsidian plugin project (or starting a new one)

### Setup

#### Option 1: Quick Install (Recommended)

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd obsidian-plugin-skill
   ```

2. Run the installer:
   ```bash
   ./install-skill.sh
   ```

3. Choose installation option:
   - **Option 1**: Install to current directory
   - **Option 2**: Specify a custom directory path

The installer will copy all skill files and the slash command to your project's `.claude` directory.

#### Option 2: Manual Install

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd obsidian-plugin-skill
   ```

2. Copy the skill to your project:
   ```bash
   # Copy to your project's .claude directory
   mkdir -p your-project/.claude/skills/obsidian
   cp -r .claude/skills/obsidian/* your-project/.claude/skills/obsidian/

   # Also copy the slash command
   mkdir -p your-project/.claude/commands
   cp .claude/commands/obsidian.md your-project/.claude/commands/
   ```

#### Option 3: Use as Standalone

Just open this directory with Claude Code - no installation needed!

### Skill Structure

The skill uses **progressive disclosure** for optimal performance:

```
.claude/skills/obsidian/
├── SKILL.md                          # Main overview (312 lines)
└── reference/                        # Detailed documentation
    ├── memory-management.md          # Lifecycle & cleanup patterns
    ├── type-safety.md                # Type narrowing & safety
    ├── ui-ux.md                      # UI standards & commands
    ├── file-operations.md            # Vault & file API
    ├── css-styling.md                # Theming & styling
    ├── accessibility.md              # A11y requirements (MANDATORY)
    ├── code-quality.md               # Best practices & security
    └── submission.md                 # Publishing guidelines
```

SKILL.md provides a concise overview with the top 20 critical rules, while reference files contain comprehensive details on specific topics.

## Quick Start: Creating a New Plugin

### Interactive Boilerplate Generator

The fastest way to start a new Obsidian plugin with all best practices built-in:

```bash
node /path/to/obsidian-plugin-skill/tools/create-plugin.js
```

**Features:**
- ✅ Generates clean TypeScript boilerplate with **no sample code**
- ✅ Creates `src/` directory structure with `main.ts` and `settings.ts`
- ✅ **Validates plugin metadata in real-time** against Obsidian's submission bot rules
- ✅ Detects existing projects and only adds missing files
- ✅ All generated code follows the skill's best practices automatically

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
├── version-bump.mjs     # Version management script
├── versions.json        # Version tracking
└── .gitignore          # Git ignore rules
```

**Interactive prompts:**
1. Plugin name (validates: no "Obsidian", can't end with "Plugin")
2. Plugin ID (validates: no "obsidian", can't end with "plugin", lowercase only)
3. Description (validates: no "Obsidian"/"This plugin", must end with punctuation)
4. Author name
5. GitHub username (optional, auto-generates authorUrl)
6. Minimum Obsidian version

**Real-time validation catches common mistakes:**
```
❌ Validation Errors:
   • Plugin ID cannot contain "obsidian"
   • Plugin name cannot end with "Plugin"
   • Description must end with punctuation: . ? ! or )
```

### Using the Slash Command

For guided plugin creation with Claude's help:

```
/create-plugin
```

Claude will guide you through the setup process and help customize the generated code.

---

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

### Top 27 Most Critical Rules (Quick Reference)

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

**Type Safety:**
8. Use `instanceof` instead of type casting

**UI/UX:**
9. Use sentence case for all UI text
10. No "command" in command names/IDs
11. No plugin ID in command IDs
12. No default hotkeys
13. Use `.setHeading()` for settings headings

**API Best Practices:**
14. Use Editor API for active file edits
15. Use `Vault.process()` for background file mods
16. Use `normalizePath()` for user paths
17. Use `Platform` API for OS detection
18. Use `requestUrl()` instead of `fetch()`
19. No console.log in onload/onunload in production

**Styling:**
20. Use Obsidian CSS variables
21. Scope CSS to plugin containers

**Accessibility (MANDATORY):**
22. Make all interactive elements keyboard accessible
23. Provide ARIA labels for icon buttons
24. Define clear focus indicators

**Security & Compatibility:**
25. Don't use `innerHTML`/`outerHTML`
26. Avoid regex lookbehind

**Code Quality:**
27. Remove all sample/template code

### Detailed Coverage by Topic

**[Memory Management & Lifecycle](/.claude/skills/obsidian/reference/memory-management.md)**
- Using `registerEvent()`, `addCommand()`, `registerDomEvent()`, `registerInterval()`
- Avoiding view references in plugin
- Not using plugin as component
- Proper leaf cleanup

**[Type Safety](/.claude/skills/obsidian/reference/type-safety.md)**
- Using `instanceof` instead of type casting
- Avoiding `any` type
- Using `const` and `let` over `var`

**[UI/UX Standards](/.claude/skills/obsidian/reference/ui-ux.md)**
- Sentence case enforcement
- Command naming conventions
- Settings and configuration best practices

**[File & Vault Operations](/.claude/skills/obsidian/reference/file-operations.md)**
- View access patterns
- Editor vs Vault API
- Atomic file operations (Vault.process, processFrontMatter)
- File management and path handling

**[CSS Styling Best Practices](/.claude/skills/obsidian/reference/css-styling.md)**
- Avoiding inline styles
- Using Obsidian CSS variables
- Scoping plugin styles
- Theme support (light/dark)
- Spacing and layout (4px grid)

**[Accessibility (A11y)](/.claude/skills/obsidian/reference/accessibility.md)** - MANDATORY
- Keyboard navigation for all interactive elements
- ARIA labels and roles
- Tooltips with proper positioning
- Focus management
- Focus visible styles (`:focus-visible`)
- Screen reader support
- Mobile and touch accessibility (44×44px minimum)

**[Code Quality & Best Practices](/.claude/skills/obsidian/reference/code-quality.md)**
- Removing sample code
- Security best practices (XSS prevention)
- Platform compatibility (iOS, mobile)
- API usage patterns
- Async/await patterns
- DOM helpers

**[Plugin Submission Requirements](/.claude/skills/obsidian/reference/submission.md)**
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
2. Add the guideline to the appropriate file:
   - Main overview: `.claude/skills/obsidian/SKILL.md`
   - Detailed coverage: `.claude/skills/obsidian/reference/*.md`
3. Update this README if needed
4. Submit a pull request

### Adding New Guidelines

When adding new content:
- Keep SKILL.md under 500 lines (progressive disclosure principle)
- Add detailed content to appropriate reference files
- Use consistent formatting and examples
- Include both ❌ incorrect and ✅ correct examples

## License

MIT License - See LICENSE file for details

## Acknowledgments

This skill is based on:
- The official Obsidian Plugin Guidelines
- The `eslint-plugin-obsidianmd` package (not yet production-ready)
- Community best practices from plugin developers
- Anthropic's best practices for agent skills (progressive disclosure pattern)

---

## Design Philosophy

This skill follows **Anthropic's best practices for agent skills**:

- **Progressive Disclosure**: Main SKILL.md (312 lines) provides overview; reference files contain details
- **Context Window Efficiency**: "The context window is a public good" - optimized token usage
- **One-Level-Deep References**: All reference files directly under `reference/` (no nesting)
- **Topic-Based Organization**: Each reference file focuses on a specific domain
- **Consistent Terminology**: Same terms used throughout for clarity

This structure allows Claude to load the essential information quickly while having access to comprehensive details when needed.

---

Note: The ESLint plugin is under active development. Guidelines in this skill reflect current best practices but may evolve as the Obsidian API matures.
