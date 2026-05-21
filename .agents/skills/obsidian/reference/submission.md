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

---

## Scorecard System

Published plugins receive a **Scorecard** on community.obsidian.md that users see when browsing. A poor Scorecard can deter users from installing your plugin.

### Overall Score (percentage)

Composite of Health and Review metrics. Examples: 96% (excellent), 65% (needs work).

### Health (Excellent / Good / Poor)

| Metric | What it measures | Tips |
|--------|------------------|------|
| Hygiene | readme, license, description, contributing guide | Add CONTRIBUTING.md |
| Maintenance | Commit frequency, release recency | Release regularly |
| Responsiveness | Issue close rate | Triage issues promptly |
| Adoption | Installations, stars | Promote your plugin |

### Review (Satisfactory / Caution)

Automated scans of your latest release. **ESLint violations become publicly visible here.**

**Passed Checks:**
- No known vulnerable dependencies
- No network requests detected (or properly disclosed)
- Build verified against source
- `main.js` and `styles.css` have verified GitHub artifact attestation

**Risks:**
- Unsafe API calls (e.g., `range.createContextualFragment`)

**Warnings (can be 100+):**
- Unnecessary type assertions
- Unexpected `any` types
- Direct style manipulation via `setAttribute` or `element.style`
- Missing `activeDocument`/`activeWindow` usage
- Floating promises (must be awaited or voided)
- Unused variables (prefix with `_` if intentional)
- Deprecated packages (e.g., `builtin-modules`, `indent-str`)
- `setInterval` combined with network calls (periodic data transmission concern)
- Plugin description missing punctuation

### Disclosures (informational, not penalized)

These are shown to users but don't affect your score:

| Disclosure | Trigger |
|------------|---------|
| Clipboard Access | `navigator.clipboard` usage |
| base64 calls | `atob()` / `btoa()` usage |
| Vault Read | `vault.read`, `vault.cachedRead` |
| Vault Write | `vault.modify`, `vault.create` |
| Vault Enumeration | `vault.getFiles()`, `getMarkdownFiles()` |
| Network Requests | `fetch()`, `XMLHttpRequest` count |
| Dynamic Code Execution | `eval()`, `new Function()` |
| System Identity | hostname, user info, env vars |
| ES5 Transpilation | `__esModule`, `__generator` helpers in bundle |

### Other Flags

- Missing GitHub artifact attestation on release assets
- Build verification not available

### Improving Your Scorecard

1. **Fix ALL ESLint warnings**, not just errors — warnings are publicly visible
2. **Use `typescript-eslint/recommendedTypeChecked`** for type-aware checks
3. **Add GitHub artifact attestation** to your release workflow
4. **Maintain regular commits and releases** for good Health metrics
5. **Respond to issues promptly** to improve Responsiveness
6. **Add a CONTRIBUTING.md** file for perfect Hygiene
