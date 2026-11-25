import { Icon } from '../components';
import { useI18n } from './I18nContext';
import { LANGUAGE_META, LANGUAGES } from './types';

/**
 * Compact language toggle for the header bar. Clicking cycles to the next
 * supported language (the design supports several languages, not just two);
 * the button shows the current language's short code next to a globe icon.
 */
export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useI18n();

  const handleClick = () => {
    const currentIndex = LANGUAGES.indexOf(language);
    const next = LANGUAGES[(currentIndex + 1) % LANGUAGES.length];
    setLanguage(next);
  };

  return (
    <button
      type="button"
      className="language-switcher"
      onClick={handleClick}
      title={t('language.switch')}
      aria-label={t('language.switch')}
    >
      <Icon name="ri-global-line" />
      <span className="language-switcher-code">{LANGUAGE_META[language].label}</span>
    </button>
  );
};
