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

### Top 20 Most Critical Rules (Quick Reference)

The main SKILL.md file highlights the most important rules:

1. Use `registerEvent()` for automatic cleanup
2. Use `instanceof` instead of type casting
3. Use sentence case for all UI text
4. Don't store view references in plugin
5. Use Editor API for active file edits
6. Use Obsidian CSS variables
7. Scope CSS to plugin containers
8. Make all interactive elements keyboard accessible
9. Provide ARIA labels for icon buttons
10. Don't use `innerHTML`/`outerHTML`
11. No "command" in command names/IDs
12. No plugin ID in command IDs
13. No default hotkeys
14. Use `.setHeading()` for settings headings
15. Use `Vault.process()` for background file mods
16. Use `normalizePath()` for user paths
17. Avoid regex lookbehind
18. Use `Platform` API for OS detection
19. Remove all sample/template code
20. Define clear focus indicators

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
- Repository structure
- Submission process
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
