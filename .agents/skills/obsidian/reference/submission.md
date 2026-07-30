# Plugin Submission Requirements

Guidelines for publishing your plugin to the Obsidian community plugin directory.

## Repository Structure

```
your-plugin/
├── manifest.json       # Required: Plugin metadata
├── main.js            # Required: Compiled plugin code
├── styles.css         # Optional: Plugin styles
├── LICENSE            # Required: License file
└── README.md          # Recommended: Usage documentation
```

---

## Naming and Description Guidelines

The Obsidian release validation bot (`validate-plugin-entry.yml`) enforces these rules:

### Plugin ID (Required)
- **Cannot contain "obsidian"** (case-insensitive)
- **Cannot end with "plugin"**
- **Must use only**: lowercase alphanumeric characters, dashes (`-`), and underscores (`_`)
- Must be unique (not used by existing or removed plugins)
- Keep it short and simple (used for plugin folder name)

### Plugin Name (Required)
- **Cannot contain "Obsidian"** (case-insensitive)
- **Cannot end with "Plugin"**
- **Cannot start with "Obsi" or end with "dian"**
- Must be unique among existing plugins
- Use a clear, descriptive name

### Description (Required)
- **Cannot include "Obsidian"** (case-insensitive)
- **Cannot use phrases**: "This plugin", "This is a plugin", "This plugin allows"
- **Must end with punctuation**: `.`, `?`, `!`, or `)`
- **Recommended max 250 characters** (longer descriptions trigger readability warnings)
- Focus on what the plugin does, not what it is

### Author (Required)
- Must be the repository owner or a public member of the organization
- Repository must have issues enabled (warning)
- Must include a valid open source license

### Repository (Required)
- Format: `"owner/repo-name"`
- Must match the actual GitHub repository

### Manifest Synchronization
- Plugin `id`, `name`, and `description` must match `manifest.json` in the repository

---

**Examples:**

✅ Good:
```json
{
  "id": "daily-notes-helper",
  "name": "Daily Notes Helper",
  "description": "Enhance your daily notes workflow with templates and quick actions.",
  "author": "YourUsername",
  "repo": "YourUsername/daily-notes-helper"
}
```

❌ Bad:
```json
{
  "id": "obsidian-daily-notes-plugin",  // Contains "obsidian" and ends with "plugin"
  "name": "Obsidian Daily Notes Plugin", // Contains "Obsidian" and ends with "Plugin"
  "description": "This is an Obsidian plugin that helps with daily notes" // Contains "Obsidian" and "This is...plugin", no punctuation
}
```

---

## Submission Process

### 1. Create GitHub Release

- Tag must match version in `manifest.json` (e.g., `1.0.0`)
- Attach binary assets: `main.js`, `manifest.json`, `styles.css` (optional)
- Consider adding GitHub artifact attestation for better Scorecard

### 2. Submit via community.obsidian.md

1. Sign in at **community.obsidian.md**
2. Link your GitHub account to your Obsidian profile
3. Navigate to **Plugins → New plugin**
4. Enter your repository URL
5. Review Developer policies and confirm support commitment
6. Submit for review

### 3. Address Feedback

- Automated review provides guidance on required corrections
- Update your repository and publish a new release with incremented version
- The directory processes `manifest.json` from your repository's default branch

### 4. Follow Developer Policies

- Comply with Obsidian's terms of service
- No malicious code
- Respect user privacy
- No analytics without disclosure

---

## Semantic Versioning

Follow semantic versioning:
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

---

## Testing Before Submission

- Test on mobile (if not desktop-only)
- Test with keyboard navigation
- Test in both light and dark themes
- Verify all ESLint rules pass (errors AND warnings)
- Remove all sample/template code
- Ensure manifest.json is valid
- Include LICENSE file

### Declarative Settings Verification (1.13+)

If your plugin uses `getSettingDefinitions()`:
- Walk the settings tab top to bottom — every setting renders and reflects the current value
- Changes persist across a reload
- Global settings search finds each setting by name (and `aliases`, if set)
- For each `validate` callback, enter invalid input — inline error appears, value is not saved
- For any `type: 'list'` groups, add/delete/reorder rows — `plugin.settings` updates correctly
- For any sub-pages, navigate in and back
- If using Path B (dual support), test on an Obsidian version below 1.13.0 to verify `display()` still works

---

## Scorecard System

Published plugins receive a **Scorecard** on community.obsidian.md that users see when browsing. Scorecard mechanics (Overall Score, Health metrics, Review checks, Disclosures, and improvement tips) are documented in [community-scanner.md](community-scanner.md#scorecard-system).
