import { useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

// Minimum clearance between a menu's edge and the viewport bottom before the
// menu flips upward.
const FLIP_MARGIN = 8;

// Vertical gap between the trigger and its menu. Must match the CSS
// `.dropdown-menu` `top/bottom: calc(100% + 4px)` offsets.
const MENU_GAP = 4;

/**
 * Flip-aware positioning for the shared `.dropdown` menus (the task/category
 * 3-dot menus). Those menus are `position: absolute` and normally open
 * downward (`top: 100%`), which pushes the bottom edge past the viewport when
 * the trigger sits near the bottom of the screen — and on the desktop kanban
 * layout, past `.categories-grid`'s `overflow-y: hidden`, where a downward
 * menu is unreachable (there is no vertical scrollbar to reveal it).
 *
 * Attach the returned `ref` to the `.dropdown` wrapper and merge `flip` into
 * its className (`flip-up`). While `isOpen`, it measures the wrapper + menu
 * height and reports whether the menu would spill past the bottom edge; the
 * CSS then anchors the menu above the trigger instead. It also re-measures on
 * scroll (capture phase, so it fires while inner containers scroll) and on
 * resize, keeping the menu on the correct side while it stays open.
 */
export const useDropdownFlip = (
  isOpen: boolean
): { ref: RefObject<HTMLDivElement | null>; flip: boolean } => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [flip, setFlip] = useState(false);

  useLayoutEffect(() => {
    if (!isOpen) {
      // Closed: no listeners, and no reset — the next open re-measures (below)
      // before paint, so a stale `flip` value is never visible.
      return;
    }

    const measure = () => {
      const wrapper = ref.current;
      const menu = wrapper?.querySelector<HTMLElement>('.dropdown-menu');
      if (!wrapper || !menu) return;
      // Measure the trigger position and the menu height independently rather
      // than the menu's current rect: reading our own flip state back would
      // make the flag oscillate while hovering right at the edge.
      const wrapperRect = wrapper.getBoundingClientRect();
      const menuHeight = menu.offsetHeight;
      const spillsBelow =
        wrapperRect.bottom + MENU_GAP + menuHeight > window.innerHeight - FLIP_MARGIN;
      setFlip(spillsBelow);
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [isOpen]);

  return { ref, flip };
};
