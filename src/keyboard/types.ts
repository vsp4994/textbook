/**
 * Types for the app-wide keyboard shortcut system.
 *
 * Definitions live in `keyboardShortcuts.ts` (the registry), the shared
 * keydown listener in `useKeyboardShortcuts.ts`, and future shortcuts are added
 * by extending the registry — the hook and its callers stay unchanged.
 */

/** The exact key (e.g. 'ArrowLeft', 'a') plus any modifier flags that must be down. */
export interface KeyboardShortcutCombo {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

/** One registered shortcut: a key combination mapped to a named action. */
export interface KeyboardShortcutDefinition {
  /**
   * Unique action name. It doubles as the key of the handler map the consuming
   * component passes to `useKeyboardShortcuts` (e.g. 'navigation.nextList').
   */
  action: string;
  /** The key combination that triggers the action. */
  combo: KeyboardShortcutCombo;
}
