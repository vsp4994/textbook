import type { KeyboardShortcutDefinition } from './types';

/**
 * The app-wide keyboard shortcut registry — the single place to add new
 * shortcuts. Each entry maps a key combination to a named action; consumers
 * pass handlers keyed by the same action names to `useKeyboardShortcuts`.
 */
export const KEYBOARD_SHORTCUTS: KeyboardShortcutDefinition[] = [
  // Switch to the next list on the web view (⌥⌘→ / Alt+Meta+ArrowRight).
  {
    action: 'navigation.nextList',
    combo: { metaKey: true, ctrlKey: true, key: 'ArrowRight' },
  },
  // Switch to the previous list on the web view (⌥⌘← / Alt+Meta+ArrowLeft).
  {
    action: 'navigation.previousList',
    combo: {
      metaKey: true, ctrlKey: true, key: 'ArrowLeft'
    },
  },
];
