import { Icon } from '../components/Icon';
import { SearchInput } from './SearchInput';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

/**
 * Molecule — the full-width search bar pinned to the top of the overlay. The
 * text input stretches to fill the whole header width (same footprint as the
 * sync panel it replaces), with an explicit close button beside it.
 */
export const SearchBar = ({ value, onChange, onClose }: SearchBarProps) => {
  return (
    <div className="search-bar">
      <SearchInput value={value} onChange={onChange} />
      <button
        type="button"
        className="btn btn-outline search-bar__close"
        onClick={onClose}
        title="Close search"
        aria-label="Close search"
      >
        <Icon name="ri-close-line" />
      </button>
    </div>
  );
};
