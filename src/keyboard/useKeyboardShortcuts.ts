import { useEffect, useRef } from 'react';
import { KEYBOARD_SHORTCUTS } from './keyboardShortcuts';
import type { KeyboardShortcutCombo } from './types';

/** Map of shortcut action name -> callback, e.g. { 'navigation.nextList': () => ... }. */
export type ShortcutHandlers = Record<string, () => void>;

const isEditableElement = (element: Element | null): boolean =>
  element instanceof HTMLElement &&
  (element.isContentEditable ||
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'SELECT');

const matchesCombo = (event: KeyboardEvent, combo: KeyboardShortcutCombo): boolean =>
  event.key === combo.key &&
  Boolean(combo.altKey) === event.altKey &&
  Boolean(combo.ctrlKey) === event.ctrlKey &&
  Boolean(combo.metaKey) === event.metaKey &&
  Boolean(combo.shiftKey) === event.shiftKey;

export interface UseKeyboardShortcutsOptions {
  /** Handlers keyed by the action names declared in the shortcut registry. */
  handlers: ShortcutHandlers;
  /** When `false` the global listener is not attached (e.g. not on this view). */
  enabled?: boolean;
  /**
   * Skip the shortcut while focus is in an editable field so typing and native
   * text-editing shortcuts are never hijacked. Defaults to `true`.
   */
  ignoreEditableTargets?: boolean;
}

/**
 * Registers the app-wide keyboard shortcuts (see KEYBOARD_SHORTCUTS) on the
 * window while `enabled`. Handlers are kept in a ref after every render so the
 * listener itself never needs to re-attach; only the `enabled` flag (and the
 * editable-target policy) controls when it is (re-)created.
 */
export const useKeyboardShortcuts = ({
  handlers,
  enabled = true,
  ignoreEditableTargets = true,
}: UseKeyboardShortcutsOptions) => {
  const handlersRef = useRef(handlers);
  // Keep the latest handlers in the ref, refreshed after every render (same
  // pattern as useHorizontalSwipe), so the attached listener always calls fresh
  // values and never needs to re-attach when only the handlers change.
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (ignoreEditableTargets && isEditableElement(document.activeElement)) return;

      const shortcut = KEYBOARD_SHORTCUTS.find(({ combo }) => matchesCombo(event, combo));
      if (!shortcut) return;
      const handler = handlersRef.current[shortcut.action];
      if (!handler) return;

      // Swallow the key so the browser never also acts on it (e.g. macOS
      // Safari maps ⌥⌘←/→ to back/forward history navigation).
      event.preventDefault();
      handler();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, ignoreEditableTargets]);
};
