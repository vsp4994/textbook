import { createPortal } from 'react-dom';
import type { AppDocument } from '../types';
import { SearchBar } from './SearchBar';
import { SearchResultsList } from './SearchResultsList';
import { SearchToggleButton } from './SearchToggleButton';
import type { SearchResult } from './types';
import { useGlobalSearch } from './useGlobalSearch';

export interface GlobalSearchProps {
  document: AppDocument | null;
  /** Called when the user picks a result; App reveals + navigates to it. */
  onNavigate: (result: SearchResult) => void;
}

/**
 * Organism — the whole search feature. Renders the header toggle button and,
 * once opened, a full-screen overlay: a full-width search bar on top and a
 * scrollable results dropdown filling the rest of the screen with light
 * padding. Picking a result calls onNavigate and hides the search UI.
 *
 * The overlay is rendered through a portal into `document.body`: it is mounted
 * inside the sticky `.app-header` (which forms a stacking context), so without
 * the portal the bottom tab bar would paint above it. Portaling to the body
 * lets the overlay's z-index compete in the root stacking context and cover
 * every screen element (header, content, and bottom nav) while searching.
 */
export const GlobalSearch = ({ document, onNavigate }: GlobalSearchProps) => {
  const { isOpen, query, results, open, close, handleQueryChange, handleSelect } = useGlobalSearch({
    document,
    onNavigate,
  });

  return (
    <div className="global-search">
      <SearchToggleButton isOpen={isOpen} onToggle={isOpen ? close : open} />

      {isOpen &&
        createPortal(
          <div
            className="global-search__overlay"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <div className="global-search__panel" onClick={(e) => e.stopPropagation()}>
              <SearchBar value={query} onChange={handleQueryChange} onClose={close} />
              {query.trim() && (
                <SearchResultsList results={results} query={query} onSelect={handleSelect} />
              )}
            </div>
          </div>,
          // `globalThis.document` (not the `document` prop, which shadows the
          // global DOM document when destructured above).
          globalThis.document.body
        )}
    </div>
  );
};
