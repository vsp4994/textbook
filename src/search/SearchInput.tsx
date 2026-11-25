import { useEffect, useRef } from 'react';
import { Icon } from '../components/Icon';
import { useI18n } from '../i18n';

export interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

/**
 * Atom — the text field at the top of the search overlay. Auto-focuses on mount
 * and shows a clear (×) button whenever the user has typed something.
 */
export const SearchInput = ({ value, placeholder, onChange }: SearchInputProps) => {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="search-input">
      <Icon name="ri-search-line" className="search-input__icon" />
      <input
        ref={inputRef}
        type="text"
        className="search-input__field"
        value={value}
        placeholder={placeholder ?? t('search.placeholder')}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-input__clear"
          onClick={() => onChange('')}
          title={t('search.clear')}
          aria-label={t('search.clear')}
        >
          <Icon name="ri-close-circle-fill" />
        </button>
      )}
    </div>
  );
};
