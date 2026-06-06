#!/usr/bin/env node

/**
 * Interactive Obsidian Plugin Boilerplate Generator
 *
 * This script creates a minimal, best-practice Obsidian plugin structure
 * following the guidelines from the Obsidian Plugin Development Skill.
 *
 * Features:
 * - Prompts for target directory before generating files
 * - Detects existing projects and only adds missing files
 * - Generates clean boilerplate with no sample code
 * - Follows all SKILL best practices automatically
 * - Interactive prompts with sensible defaults
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to prompt user with default value
function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const displayDefault = defaultValue ? ` (${defaultValue})` : '';
    rl.question(`${question}${displayDefault}: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Helper to check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper to write file only if it doesn't exist
function writeFileIfNotExists(filePath, content) {
  if (fileExists(filePath)) {
    console.log(`  ⏭️  Skipping ${filePath} (already exists)`);
    return false;
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✅ Created ${filePath}`);
  return true;
}

// Generate main.ts
function generateMainTs(pluginClassName, pluginName) {
  return `import { Plugin } from 'obsidian';
import { PluginSettings, SettingsTab, DEFAULT_SETTINGS } from './settings';

export default class ${pluginClassName}Plugin extends Plugin {
	settings: PluginSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new SettingsTab(this.app, this));

		// Register commands
		this.addCommand({
			id: 'run-example',
			name: 'Run example',
			callback: () => {
				// TODO: Implement your command
			}
		});
	}

	onunload(): void {
		// Cleanup handled automatically by Obsidian
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<PluginSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
`;
}

// Generate manifest.json
function generateManifest(id, name, version, description, author, authorUrl, minAppVersion) {
  return JSON.stringify({
    id,
    name,
    version,
    minAppVersion,
    description,
    author,
    authorUrl,
    isDesktopOnly: false
  }, null, 2) + '\n';
}

// Generate settings.ts
function generateSettings(pluginClassName) {
  return `import { App, PluginSettingTab, Setting } from 'obsidian';
import type ${pluginClassName}Plugin from './main';

export interface PluginSettings {
	exampleSetting: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	exampleSetting: 'default'
};

export class SettingsTab extends PluginSettingTab {
	plugin: ${pluginClassName}Plugin;

	constructor(app: App, plugin: ${pluginClassName}Plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Example setting')
			.setDesc('This is an example setting')
			.addText(text => text
				.setPlaceholder('Enter value')
				.setValue(this.plugin.settings.exampleSetting)
				.onChange(async (value) => {
					this.plugin.settings.exampleSetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
`;
}

// Generate styles.css
function generateStyles(pluginId) {
  return `/*
 * Styles for ${pluginId}
 *
 * Best practices:
 * - Use Obsidian CSS variables for all styling
 * - Scope all selectors to plugin containers
 * - Support both light and dark themes via CSS variables
 * - Follow Obsidian's 4px spacing grid (var(--size-4-*))
 */
`;
}

// Generate tsconfig.json
function generateTsConfig() {
  return JSON.stringify({
    "compilerOptions": {
      "inlineSourceMap": true,
      "inlineSources": true,
      "module": "ESNext",
      "target": "ES6",
      "allowJs": true,
      "noImplicitAny": true,
      "moduleResolution": "bundler",
      "importHelpers": true,
      "isolatedModules": true,
      "strictNullChecks": true,
      "lib": [
        "DOM",
        "ES5",
        "ES6",
        "ES7"
      ]
    },
    "include": [
      "src/**/*.ts"
    ]
  }, null, 2) + '\n';
}

// Generate package.json
function generatePackageJson(id, version, description, author) {
  return JSON.stringify({
    "name": id,
    "version": version,
    "description": description,
    "main": "main.js",
    "scripts": {
      "dev": "node esbuild.config.mjs",
      "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production",
      "lint": "eslint src/",
      "version": "node version-bump.mjs && git add manifest.json versions.json"
    },
    "keywords": [
      "obsidian",
      "obsidian-plugin"
    ],
    "author": author,
    "license": "MIT",
    "devDependencies": {
      "@eslint/js": "^9.30.1",
      "@types/node": "^16.11.6",
      "@typescript-eslint/parser": "^8.35.1",
      "esbuild": "^0.25.5",
      "eslint": "^9.30.1",
      "eslint-plugin-no-unsanitized": "^4.1.2",
      "eslint-plugin-obsidianmd": "^0.3.0",
      "globals": "^14.0.0",
      "jiti": "^2.6.1",
      "tslib": "^2.4.0",
      "typescript": "^5.8.2",
      "typescript-eslint": "^8.35.1"
    },
    "dependencies": {
      "obsidian": "latest"
    }
  }, null, 2) + '\n';
}

// Generate esbuild.config.mjs
function generateEsbuildConfig() {
  return `import esbuild from "esbuild";
import process from "process";
import { builtinModules } from "node:module";

const banner =
\`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
\`;

const prod = (process.argv[2] === "production");

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtinModules],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
`;
}

// Generate version-bump.mjs
function generateVersionBump() {
  return `import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

// read minAppVersion from manifest.json and bump version to target version
let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\\t"));

// update versions.json with target version and minAppVersion from manifest.json
let versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[targetVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\\t"));
`;
}

// Generate versions.json
function generateVersionsJson(version, minAppVersion) {
  const versions = {};
  versions[version] = minAppVersion;
  return JSON.stringify(versions, null, '\t') + '\n';
}

// Generate eslint.config.mjs
function generateEslintConfig() {
  return `import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
    { ignores: ["node_modules/**", "main.js", "*.mjs", "package.json", "package-lock.json", "versions.json", "tsconfig.json"] },
    // TypeScript-ESLint recommended rules WITH type checking
    ...tseslint.configs.recommendedTypeChecked.map(config => ({
        ...config,
        files: ["src/**/*.ts"],
    })),
    // Obsidian plugin rules (v0.3.0+)
    ...obsidianmd.configs.recommended,
    // Project-specific config
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
            },
        },
        rules: {
            // Console: scanner allows warn, error, debug only
            "no-console": ["error", { allow: ["warn", "error", "debug"] }],
            // Allow underscore-prefixed unused params
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
        },
    },
];
`;
}

// Generate .gitignore
function generateGitignore() {
  return `# Logs
*.log
npm-debug.log*

# Dependency directories
node_modules/

# Build output
main.js
*.js.map

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# TypeScript cache
*.tsbuildinfo

# Privacy
data.json
.env

# Agent settings (local)
.claude/settings.local.json
.agents/settings.local.json
`;
}

// Generate LICENSE
function generateLicense(author) {
  const year = new Date().getFullYear();
  return `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
}

// Convert plugin name to class name (PascalCase)
function toClassName(name) {
  return name
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Convert plugin name to ID (kebab-case)
function toPluginId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Validate plugin metadata against Obsidian submission rules
function validateMetadata(id, name, description) {
  const errors = [];
  const warnings = [];

  // Plugin ID validation
  if (/obsidian/i.test(id)) {
    errors.push('Plugin ID cannot contain "obsidian"');
  }
  if (/plugin$/i.test(id)) {
    errors.push('Plugin ID cannot end with "plugin"');
  }
  if (!/^[a-z0-9_-]+$/.test(id)) {
    errors.push('Plugin ID must only contain lowercase letters, numbers, dashes, and underscores');
  }

  // Plugin name validation
  if (/obsidian/i.test(name)) {
    errors.push('Plugin name cannot contain "Obsidian"');
  }
  if (/plugin$/i.test(name)) {
    errors.push('Plugin name cannot end with "Plugin"');
  }
  if (/^obsi/i.test(name) || /dian$/i.test(name)) {
    errors.push('Plugin name cannot start with "Obsi" or end with "dian"');
  }

  // Description validation
  if (/obsidian/i.test(description)) {
    errors.push('Description cannot include "Obsidian"');
  }
  if (/this plugin|this is a plugin|this plugin allows/i.test(description)) {
    errors.push('Description cannot use phrases like "This plugin", "This is a plugin", etc.');
  }
  if (!/[.?!)]$/.test(description)) {
    errors.push('Description must end with punctuation: . ? ! or )');
  }
  if (description.length > 250) {
    warnings.push(`Description is ${description.length} characters (recommended max: 250)`);
  }

  return { errors, warnings };
}

// Main execution
async function main() {
  console.log('\n🔮 Obsidian Plugin Boilerplate Generator\n');
  console.log('This tool creates a minimal, best-practice plugin structure.');
  console.log('Existing files will NOT be overwritten.\n');

  // Ask for target directory
  const targetDir = await prompt('Where should the plugin be created?\n  (leave blank for current directory)\n  Target directory', '');

  if (targetDir) {
    // Create target directory if it doesn't exist
    fs.mkdirSync(targetDir, { recursive: true });
    process.chdir(targetDir);
    console.log(`\n📁 Working in: ${process.cwd()}\n`);
  }

  // Detect if we're in an existing project
  const hasPackageJson = fileExists('package.json');
  const hasManifest = fileExists('manifest.json');
  const isExistingProject = hasPackageJson || hasManifest;

  if (isExistingProject) {
    console.log('📁 Existing project detected. Missing files will be added.\n');
  }

  // Gather information
  const name = await prompt('Plugin name', 'My Helper');
  const id = await prompt('Plugin ID (kebab-case)', toPluginId(name));
  const version = await prompt('Initial version', '0.1.0');
  const description = await prompt('Description', 'Enhance your workflow.');
  const author = await prompt('Author name', '');
  const githubUsername = await prompt('GitHub username (optional)', '');
  const authorUrl = githubUsername ? `https://github.com/${githubUsername}` : '';
  const minAppVersion = await prompt('Minimum Obsidian version', '0.15.0');

  const className = toClassName(name);

  // Validate metadata against Obsidian submission rules
  console.log('\n🔍 Validating metadata...\n');
  const validation = validateMetadata(id, name, description);

  if (validation.errors.length > 0) {
    console.log('❌ Validation Errors:\n');
    validation.errors.forEach(err => console.log(`   • ${err}`));
    console.log('\n⚠️  Files will still be generated, but your plugin will fail submission validation.');
    console.log('   Please fix these issues before submitting to the Obsidian plugin directory.\n');
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    validation.warnings.forEach(warn => console.log(`   • ${warn}`));
    console.log('');
  }

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    console.log('✅ Metadata validation passed!\n');
  }

  console.log('📝 Generating files...\n');

  // Create src directory
  if (!fileExists('src')) {
    fs.mkdirSync('src', { recursive: true });
    console.log('  ✅ Created src/ directory');
  }

  // Create files
  let createdCount = 0;

  if (writeFileIfNotExists('src/main.ts', generateMainTs(className, name))) createdCount++;
  if (writeFileIfNotExists('src/settings.ts', generateSettings(className))) createdCount++;
  if (writeFileIfNotExists('manifest.json', generateManifest(id, name, version, description, author, authorUrl, minAppVersion))) createdCount++;
  if (writeFileIfNotExists('styles.css', generateStyles(id))) createdCount++;
  if (writeFileIfNotExists('tsconfig.json', generateTsConfig())) createdCount++;
  if (writeFileIfNotExists('package.json', generatePackageJson(id, version, description, author))) createdCount++;
  if (writeFileIfNotExists('esbuild.config.mjs', generateEsbuildConfig())) createdCount++;
  if (writeFileIfNotExists('eslint.config.mjs', generateEslintConfig())) createdCount++;
  if (writeFileIfNotExists('version-bump.mjs', generateVersionBump())) createdCount++;
  if (writeFileIfNotExists('versions.json', generateVersionsJson(version, minAppVersion))) createdCount++;
  if (writeFileIfNotExists('LICENSE', generateLicense(author))) createdCount++;

  // Always write .gitignore (overwrite if exists to ensure plugin-specific rules)
  fs.writeFileSync('.gitignore', generateGitignore(), 'utf8');
  console.log('  ✅ Created .gitignore');
  createdCount++;

  console.log(`\n✨ Done! Created ${createdCount} file(s).\n`);

  if (createdCount > 0) {
    console.log('📚 Next steps:');
    console.log('  1. Run: npm install');
    console.log('  2. Run: npm run dev');
    console.log('  3. Enable the plugin in Obsidian settings');
    console.log('  4. Before submitting: npm run lint');
    console.log('\n💡 Tip: This boilerplate includes ESLint configured for community scanner compliance.');
    console.log('   Run "npm run lint" to catch issues before submission!\n');
  } else {
    console.log('ℹ️  No new files were created (all files already exist).\n');
  }

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
