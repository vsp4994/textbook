/**
 * Core i18n types. The list of supported languages lives here; extending it
 * to ~10 languages means adding one entry to `LANGUAGES`/`LANGUAGE_META` and
 * one dictionary block in `translations.ts`.
 */

export const LANGUAGES = ['en', 'fr'] as const;

export type Language = (typeof LANGUAGES)[number];

export interface LanguageMeta {
  /** Short toggle badge (e.g. "EN"). */
  label: string;
  /** Human-readable language name in its own language. */
  nativeName: string;
  /** BCP-47 tag used for date/number formatting and <html lang>. */
  localeTag: string;
  /** Prefixes of `navigator.language` that should default to this language. */
  browserTags: readonly string[];
}

export const LANGUAGE_META: Record<Language, LanguageMeta> = {
  en: {
    label: 'EN',
    nativeName: 'English',
    localeTag: 'en',
    browserTags: ['en'],
  },
  fr: {
    label: 'FR',
    nativeName: 'Français',
    localeTag: 'fr-FR',
    browserTags: ['fr'],
  },
};

/** Params object accepted by `t(key, params)`. */
export interface TranslateParams {
  [name: string]: string | number;
}

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
