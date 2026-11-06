import { Icon } from '../components/Icon';
import type { SearchResult, SearchResultKind } from './types';

const KIND_ICONS: Record<SearchResultKind, string> = {
  list: 'ri-list-unordered',
  category: 'ri-folder-line',
  task: 'ri-task-line',
};

export interface SearchResultItemProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

/**
 * Atom — a single search hit rendered as a big, tappable button with its kind
 * icon, matched title, and a location breadcrumb underneath.
 */
export const SearchResultItem = ({ result, onSelect }: SearchResultItemProps) => {
  return (
    <button
      type="button"
      className="search-result-item"
      onClick={() => onSelect(result)}
    >
      <Icon name={KIND_ICONS[result.kind]} className="search-result-item__icon" />
      <span className="search-result-item__text">
        <span className="search-result-item__title">{result.title}</span>
        <span className="search-result-item__context" title={result.context}>
          {result.context}
        </span>
      </span>
      <Icon name="ri-arrow-right-up-line" className="search-result-item__go" />
    </button>
  );
};
