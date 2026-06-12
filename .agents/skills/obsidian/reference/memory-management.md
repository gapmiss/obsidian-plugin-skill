# Memory Management & Lifecycle

Proper memory management is critical in Obsidian plugins to prevent memory leaks and ensure smooth performance.

## Use registerEvent() and addCommand() for Cleanup
Rule: Official guidelines

✅ **CORRECT**:
```typescript
async onload() {
  // These are automatically cleaned up on unload
  this.registerEvent(
    this.app.workspace.on('file-open', (file) => {
      // Handle file open
    })
  );

  this.addCommand({
    id: 'my-command',
    name: 'My command',
    callback: () => { }
  });

  // For DOM events, use registerDomEvent
  this.registerDomEvent(document, 'click', (evt) => {
    // Handle click
  });

  // For intervals, use registerInterval
  this.registerInterval(
    window.setInterval(() => {
      // Do something periodically
    }, 5000)
  );
}

onunload() {
  // No manual cleanup needed!
  // Obsidian handles it automatically
}
```

Rationale: Use `registerEvent()`, `addCommand()`, `registerDomEvent()`, and `registerInterval()` for automatic cleanup when the plugin unloads. This prevents memory leaks.

---

## Use registerDomEvent() Instead of Manual addEventListener
Rule: Best practice (NOT caught by the linter)

The linter enforces `activeDocument` over `document` and `registerEvent()` for Obsidian events, but it does **not** flag manual `addEventListener` calls paired with manual cleanup. That pattern hides a subtle leak: `activeDocument` and `activeWindow` are dynamic getters that follow window focus, so calling them at setup and again at cleanup can return **different documents** (e.g., focus moved to a popout or the settings window in between).

❌ **INCORRECT** (leaks when focus changes between setup and cleanup):
```typescript
export default class MyPlugin extends Plugin {
  private onClick = (evt: MouseEvent) => { /* ... */ };

  onload() {
    // Registers on whichever document is focused NOW
    activeDocument.addEventListener('click', this.onClick);
  }

  onunload() {
    // May be a DIFFERENT document — the original listener is never removed
    activeDocument.removeEventListener('click', this.onClick);
  }
}
```

✅ **CORRECT**:
```typescript
onload() {
  // Target is captured once at registration; removal is automatic on unload
  this.registerDomEvent(activeDocument, 'click', (evt) => {
    // Handle click
  });
}
```

If manual management is truly unavoidable, capture the document once and use the same reference for both calls:

```typescript
const doc = activeDocument;
doc.addEventListener('click', this.onClick);
// later, in the cleanup path:
doc.removeEventListener('click', this.onClick);
```

### Scope Listeners to the Owning Component

`registerDomEvent()` is a `Component` method, so views and modals have it too. Register on the component whose lifecycle matches the listener — not always the plugin:

```typescript
export class MyView extends ItemView {
  async onOpen() {
    // Cleaned up when the view unloads, not when the plugin unloads
    this.registerDomEvent(this.containerEl.ownerDocument, 'mousemove', (evt) => {
      // ...
    });
  }
}
```

Helper classes that can't extend `Component` should receive the owning view/component and call its `registerDomEvent()` instead of managing cleanup themselves.

### Covering Popout Windows

A listener registered on one document never fires in other windows. For app-wide listeners, register on each window as it opens:

```typescript
this.registerDomEvent(document, 'click', this.onClick);  // main window
this.registerEvent(
  this.app.workspace.on('window-open', (workspaceWindow) => {
    this.registerDomEvent(workspaceWindow.doc, 'click', this.onClick);
  })
);
```

**When plain `addEventListener` is fine:** listeners on short-lived elements your own code creates (e.g., a button inside a settings tab) are garbage-collected with the element. The managed pattern is mandatory for long-lived targets — `document`, `window`, workspace containers — and anything that outlives the registering code.

Rationale: `registerDomEvent()` captures the event target at registration time and removes the listener automatically when the owning component unloads. This eliminates both the manual-cleanup burden and the `activeDocument` drift bug.

---

## Don't Store View References in Plugin
Rule: `obsidianmd/no-view-references-in-plugin`

❌ **INCORRECT**:
```typescript
this.registerView(VIEW_TYPE, (leaf) => {
  this.view = new MyCustomView(leaf);  // Memory leak!
  return this.view;
});
```

✅ **CORRECT**:
```typescript
this.registerView(VIEW_TYPE, (leaf) => {
  return new MyCustomView(leaf);  // Create and return directly
});
```

Rationale: Storing view instances as plugin properties prevents proper cleanup and causes memory leaks.

---

## Don't Use Plugin as Component
Rule: `obsidianmd/no-plugin-as-component`

❌ **INCORRECT**:
```typescript
// Passing plugin instance
MarkdownRenderer.render(app, markdown, el, sourcePath, this);

// Inline new Component()
MarkdownRenderer.render(app, markdown, el, sourcePath, new Component());
```

✅ **CORRECT**:
```typescript
const component = new Component();
MarkdownRenderer.render(app, markdown, el, sourcePath, component);
// Later: component.unload() when done
```

Rationale: Plugin lifecycle is too long, causing memory leaks. Components must be stored to call `unload()`.

---

## Don't Detach Leaves in onunload
Rule: `obsidianmd/detach-leaves` (auto-fixable)

❌ **INCORRECT**:
```typescript
onunload() {
  this.app.workspace.detachLeavesOfType(VIEW_TYPE);
}
```

✅ **CORRECT**:
```typescript
onunload() {
  // Let Obsidian handle leaf cleanup automatically
}
```

Rationale: Obsidian handles leaf cleanup automatically. Manual detachment can cause issues.

---

## Use getActiveLeavesOfType() Instead of Storing Views
Rule: Official guidelines (relates to no-view-references-in-plugin)

❌ **INCORRECT**:
```typescript
// Don't store view references
this.customViews = [];
```

✅ **CORRECT**:
```typescript
// Get views when needed
const views = this.app.workspace.getLeavesOfType(VIEW_TYPE)
  .map(leaf => leaf.view as MyCustomView);
```

Rationale: Don't store references to custom views. Use `getLeavesOfType()` or `getActiveLeavesOfType()` to access them when needed.
