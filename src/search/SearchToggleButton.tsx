import { Icon } from '../components/Icon';

export interface SearchToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Atom — the header button that opens (or closes) the search bar. Its icon
 * swaps to a close icon while the search overlay is open.
 */
export const SearchToggleButton = ({ isOpen, onToggle }: SearchToggleButtonProps) => {
  return (
    <button
      className="btn btn-outline"
      onClick={onToggle}
      type="button"
      title={isOpen ? 'Close search' : 'Search'}
      aria-label={isOpen ? 'Close search' : 'Search'}
    >
      <Icon name={isOpen ? 'ri-close-line' : 'ri-search-line'} />
    </button>
  );
};
