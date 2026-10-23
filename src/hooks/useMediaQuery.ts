import { useEffect, useState } from 'react';

// Matches the `@media (min-width: 601px)` breakpoint in styles.scss: widths
// >= 601px render the desktop "web view" (horizontal kanban board), everything
// below renders the mobile single-column layout. Keeping the query in sync with
// the CSS is what makes the "desktop-only depth-1 always open" behavior line up
// exactly with the web layout.
export const WEB_VIEW_QUERY = '(min-width: 601px)';

/**
 * Reactive matchMedia hook. Returns whether `query` currently matches and
 * re-renders when the underlying media query state flips (e.g. crossing the
 * desktop/mobile breakpoint on resize). Defaults to `false` on the first render
 * so the initial paint always assumes the conservative (mobile) behavior.
 *
 * If the `query` changes, the state is re-seeded during render via the
 * render-time adjustment pattern (React's documented replacement for an effect
 * here, same as Category.tsx) so we never call setState directly in an effect.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setMatches(typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  }

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};
