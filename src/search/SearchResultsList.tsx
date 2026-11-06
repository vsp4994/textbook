import { SearchResultItem } from './SearchResultItem';
import type { SearchResult } from './types';

export interface SearchResultsListProps {
  results: SearchResult[];
  query: string;
  onSelect: (result: SearchResult) => void;
}

/**
 * Molecule — the scrollable results dropdown that hangs below the search bar.
 * It is the only scroll container of the overlay, so any number of hits can be
 * browsed without pushing the search bar off-screen.
 */
export const SearchResultsList = ({ results, query, onSelect }: SearchResultsListProps) => {
  if (results.length === 0) {
    return (
      <div className="search-results search-results--empty">
        <div className="search-results__empty">No results for “{query}”</div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results__scroll">
        {results.map((result) => (
          <SearchResultItem
            key={`${result.kind}-${result.id}`}
            result={result}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};
