import { en, type TranslationKey, type TFunction } from './translations';

/**
 * Translates the error messages thrown by pure logic modules (moveUtils,
 * importTextbookJson) at the point where they are shown to the user (toasts).
 *
 * The modules keep throwing plain English `Error` strings (their contracts are
 * stable and testable); this helper maps those English source strings back to
 * translation keys. Exact matches are resolved through a reverse index built
 * from the `en` dictionary (whose error entries must equal the thrown strings),
 * and the few interpolated import messages are matched by pattern.
 *
 * Unknown messages (e.g. browser `JSON.parse` SyntaxErrors) are returned
 * unchanged rather than hardcoded.
 */

// Reverse index: English source string -> translation key.
const EN_TO_KEY = new Map<string, TranslationKey>();
for (const [key, value] of Object.entries(en) as [TranslationKey, string][]) {
  if (!EN_TO_KEY.has(value)) EN_TO_KEY.set(value, key);
}

interface InterpolationRule {
  pattern: RegExp;
  render: (t: TFunction, match: RegExpExecArray) => string;
}

const INTERPOLATION_RULES: InterpolationRule[] = [
  {
    // `Invalid task URL: ${...}`
    pattern: /^Invalid task URL: (.+)$/,
    render: (t, match) => t('import.error.invalidUrl', { url: match[1] }),
  },
  {
    // `Category nesting cannot exceed ${MAX_DEPTH} levels.`
    pattern: /^Category nesting cannot exceed (\d+) levels\.$/,
    render: (t, match) => t('import.error.nestingTooDeep', { level: match[1] }),
  },
  {
    // `Invalid items or subcategories in "${title}".`
    pattern: /^Invalid items or subcategories in "(.+)"\.$/,
    render: (t, match) => t('import.error.invalidItemsIn', { title: match[1] }),
  },
  {
    // `Invalid task title in "${title}".`
    pattern: /^Invalid task title in "(.+)"\.$/,
    render: (t, match) => t('import.error.invalidTaskIn', { title: match[1] }),
  },
];

/**
 * Best-effort translation of a deep-layer error message. Falls back to the
 * original message when it is not a known string.
 */
export const localizeErrorMessage = (t: TFunction, message: string): string => {
  const exactKey = EN_TO_KEY.get(message);
  if (exactKey) return t(exactKey);

  for (const rule of INTERPOLATION_RULES) {
    const match = rule.pattern.exec(message);
    if (match) return rule.render(t, match);
  }

  return message;
};
