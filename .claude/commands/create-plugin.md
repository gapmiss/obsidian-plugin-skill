---
description: Interactive guide for creating a new Obsidian plugin with best practices
---

You are helping the user create a new Obsidian plugin. Follow these steps:

## Setup Options

Present the user with two options:

1. **Automated Setup** (Recommended): Use the interactive boilerplate generator script
   - Run: `node /path/to/obsidian-plugin-skill/tools/create-plugin.js`
   - This creates a minimal, best-practice plugin structure automatically
   - Detects existing projects and only adds missing files
   - All generated code follows the Obsidian Plugin Development Skill guidelines

2. **Manual Setup**: Guide the user through creating files step-by-step
   - Walk through each required file
   - Explain what each file does
   - Provide code that follows best practices from the skill

## After Setup

Once the boilerplate is created (either way):

1. Verify all files follow the skill's best practices:
   - No sample code (MyPlugin, SampleModal, etc.)
   - Proper use of registerEvent() for cleanup
   - Sentence case in UI text
   - Obsidian CSS variables in styles
   - Accessibility-ready templates

2. Help customize the plugin:
   - Ask what the plugin will do
   - Suggest appropriate API usage patterns
   - Reference specific sections of the skill as needed

3. Guide through initial development:
   - Setting up the dev environment
   - Testing in Obsidian
   - Common next steps

## Important Reminders

- Always apply the Obsidian Plugin Development Skill guidelines
- Ensure accessibility from the start (keyboard navigation, ARIA labels, focus indicators)
- Use TypeScript best practices (instanceof, not type casting)
- Follow memory management rules (proper event registration)
- Use Obsidian CSS variables for theming

Ask the user which setup option they prefer, then proceed accordingly.
