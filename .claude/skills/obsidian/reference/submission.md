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

## Submission Process

### 1. Create GitHub Release

- Tag must match version in `manifest.json`
- Include: `manifest.json`, `main.js`, `styles.css`

### 2. Submit to community-plugins.json

Fork `obsidianmd/obsidian-releases` and add entry:

```json
{
  "id": "your-plugin-id",
  "name": "Your Plugin Name",
  "author": "Your Name",
  "description": "Short description",
  "repo": "username/repo-name"
}
```

Create pull request.

### 3. Follow Developer Policies

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
- Verify all ESLint rules pass
- Remove all sample/template code
- Ensure manifest.json is valid
- Include LICENSE file
