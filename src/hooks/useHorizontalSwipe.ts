import { useEffect, useRef } from 'react';

interface HorizontalSwipeOptions {
  /** Fired when the finger swipes toward the left (e.g. next list). */
  onSwipeLeft: () => void;
  /** Fired when the finger swipes toward the right (e.g. previous list). */
  onSwipeRight: () => void;
  /**
   * Horizontal distance (px) the finger must travel before a swipe registers.
   * The travel must also clearly outweigh any vertical drift so normal vertical
   * scrolling is never hijacked.
   * @default 60
   */
  threshold?: number;
  /**
   * Veto a gesture that starts on a given target (e.g. text inputs/textareas
   * where the user is typing or scrolling). Return `true` to ignore it.
   */
  shouldIgnoreTarget?: (target: EventTarget | null) => boolean;
  /** When `false` the listeners are not attached (e.g. desktop layout). */
  enabled?: boolean;
}

/**
 * Detects horizontal swipes on the attached element and fires
 * `onSwipeLeft` / `onSwipeRight`. Built on Pointer Events (already used across
 * this app) so it handles touch, pen, and mouse (primary button) with no
 * dependency — mouse/trackpad drags are included so the gesture is easy to
 * test outside real touch hardware. A swipe is only registered when horizontal
 * travel clearly dominates vertical travel, so existing vertical scrolling
 * keeps working untouched; when the browser claims the gesture (a native scroll
 * or an inner horizontally-scrollable block) it fires `pointercancel` and the
 * pending swipe is discarded. Attach the returned ref to the element that
 * should accept swipes.
 */
export const useHorizontalSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  shouldIgnoreTarget = () => false,
  enabled = true,
}: HorizontalSwipeOptions) => {
  const elementRef = useRef<HTMLElement | null>(null);

  // Keep the latest callbacks in refs, refreshed after every render, so the
  // listeners (attached once per `enabled` state) always invoke fresh values.
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  const shouldIgnoreTargetRef = useRef(shouldIgnoreTarget);
  useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft;
    onSwipeRightRef.current = onSwipeRight;
    shouldIgnoreTargetRef.current = shouldIgnoreTarget;
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    let startX = 0;
    let startY = 0;
    let activePointerId: number | null = null;

    const onPointerDown = (event: PointerEvent) => {
      // Track a single gesture at a time. Mouse is allowed so it can be tested
      // with a trackpad/mouse, but only the primary (left) button starts one —
      // right/middle-button drags (context menu, autoscroll) are not swipes.
      if (activePointerId !== null) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (shouldIgnoreTargetRef.current(event.target)) return;

      activePointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
    };

    // Listen for the release on `window` so a fast swipe that lifts off
    // outside the element still registers.
    const finishGesture = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return;
      activePointerId = null;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      // Require a clean horizontal gesture: enough travel AND clearly more
      // horizontal than vertical. Anything shorter is a tap; anything more
      // vertical is a scroll.
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return;

      if (dx < 0) onSwipeLeftRef.current();
      else onSwipeRightRef.current();
    };

    // The browser took over (native scroll, inner horizontal scroll, …) — drop
    // any pending swipe so navigation is never triggered accidentally.
    const cancelGesture = (event: PointerEvent) => {
      if (event.pointerId === activePointerId) activePointerId = null;
    };

    element.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', finishGesture);
    window.addEventListener('pointercancel', cancelGesture);
    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', finishGesture);
      window.removeEventListener('pointercancel', cancelGesture);
    };
  }, [enabled, threshold]);

  return elementRef;
};
