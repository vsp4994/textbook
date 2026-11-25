import { Icon } from '../components/Icon';
import { useI18n } from '../i18n';

export interface SearchToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Atom — the header button that opens (or closes) the search bar. Its icon
 * swaps to a close icon while the search overlay is open, and a text label
 * reinforces the action ("Search" / "Close search").
 */
export const SearchToggleButton = ({ isOpen, onToggle }: SearchToggleButtonProps) => {
  const { t } = useI18n();
  return (
    <button
      className="btn btn-outline"
      onClick={onToggle}
      type="button"
      title={isOpen ? t('search.close') : t('search.search')}
      aria-label={isOpen ? t('search.close') : t('search.search')}
    >
      <Icon name={isOpen ? 'ri-close-line' : 'ri-search-line'} />
      <span className="search-toggle-label">
        {isOpen ? t('search.close') : t('search.search')}
      </span>
    </button>
  );
};
