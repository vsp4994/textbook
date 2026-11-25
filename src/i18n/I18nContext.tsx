import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { translations, type TFunction } from './translations';
import {
  isLanguage,
  LANGUAGE_META,
  LANGUAGES,
  type Language,
  type TranslateParams,
} from './types';

/* eslint-disable react-refresh/only-export-components */
// This file intentionally exports both a component (I18nProvider) and a hook
// (useI18n); they belong together. Matches DriveSyncContext's pattern.

/**
 * Language preference: persisted in localStorage and defaulting from the
 * browser's `navigator.language` (any `fr*` prefix selects French).
 */
const STORAGE_KEY = 'textbook.language';

const getInitialLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // localStorage unavailable (private mode / blocked) — fall through.
  }
  try {
    const browser = navigator.language.toLowerCase();
    for (const lang of LANGUAGES) {
      if (browser === lang || browser.startsWith(`${lang}-`)) return lang;
    }
  } catch {
    // navigator.language unavailable — fall back to English.
  }
  return 'en';
};

const interpolate = (template: string, params?: TranslateParams): string =>
  params
    ? template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
        Object.prototype.hasOwnProperty.call(params, name)
          ? String(params[name])
          : match
      )
    : template;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Translate a key, replacing `{{param}}` placeholders with `params`. */
  t: TFunction;
  /** BCP-47 locale tag for the active language (used by date/time formatting). */
  locale: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persisting is best-effort; the in-memory choice still applies.
    }
  }, []);

  const t = useCallback<TFunction>(
    (key, params) => interpolate(translations[language][key], params),
    [language]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, t, locale: LANGUAGE_META[language].localeTag }),
    [language, setLanguage, t]
  );

  useEffect(() => {
    document.documentElement.lang = LANGUAGE_META[language].localeTag;
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an <I18nProvider>.');
  }
  return context;
};
