import { useMemo } from 'react';

// Distinguishes a real mobile/touch device from a web/desktop browser.
//
// The physical capability is what matters, not the viewport width: a desktop
// window shrunk to 600px (or a touchscreen laptop whose primary pointer is
// still a mouse/trackpad) reports a fine, hovering primary pointer and must be
// treated as a web device. Only a device whose primary input is a coarse,
// hover-less pointer — a phone or tablet — counts as mobile.
const detectIsMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return true; // conservative first paint / SSR
  const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const coarsePrimaryPointer = window.matchMedia('(pointer: coarse)').matches;
  const primaryPointerHovers = window.matchMedia('(hover: hover)').matches;
  return touchCapable && coarsePrimaryPointer && !primaryPointerHovers;
};

/**
 * Returns whether the app is running on a mobile/touch device (as opposed to a
 * web/desktop browser). Computed once per mount — the physical device never
 * changes at runtime — and used to gate mobile-only gestures (e.g. the
 * horizontal-swipe list navigation) instead of a fixed viewport-width breakpoint.
 */
export const useIsMobileDevice = (): boolean =>
  useMemo(() => detectIsMobileDevice(), []);
