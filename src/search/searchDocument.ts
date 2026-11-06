import type { AppDocument, Category } from '../types';
import type { SearchResult } from './types';

// Hard cap so a huge document (or a very short query) can never freeze the list.
const MAX_SEARCH_RESULTS = 100;

const toLower = (value: string): string => value.toLowerCase();

/**
 * Searches every list, category, and task (title + description) in the document
 * for a case-insensitive substring of `rawQuery`. Pure and side-effect free —
 * it only reads the document and never mutates it.
 *
 * Results keep document order and are deduped by entity id (ids are globally
 * unique across the whole document). Capped at MAX_SEARCH_RESULTS.
 */
export const searchDocument = (document: AppDocument | null, rawQuery: string): SearchResult[] => {
  const query = rawQuery.trim().toLowerCase();
  if (!document || !query) return [];

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  const push = (result: SearchResult): void => {
    if (results.length >= MAX_SEARCH_RESULTS) return;
    if (seen.has(result.id)) return;
    seen.add(result.id);
    results.push(result);
  };

  for (const list of document.lists) {
    if (toLower(list.title).includes(query)) {
      push({ kind: 'list', id: list.id, listId: list.id, title: list.title, context: list.title, categoryIds: [] });
    }

    const walk = (categories: Category[], categoryIds: string[], categoryPath: string[]): void => {
      for (const category of categories) {
        const ids = [...categoryIds, category.id];
        const path = [...categoryPath, category.title];

        if (toLower(category.title).includes(query)) {
          push({
            kind: 'category',
            id: category.id,
            listId: list.id,
            title: category.title,
            context: [list.title, ...path].join(' / '),
            categoryIds: ids,
          });
        }

        for (const item of category.items) {
          const matches =
            toLower(item.title).includes(query) ||
            toLower(item.description || '').includes(query);
          if (!matches) continue;

          push({
            kind: 'task',
            id: item.id,
            listId: list.id,
            title: item.title.trim() || '(untitled task)',
            context: [list.title, ...path].join(' / '),
            categoryIds: ids,
            todoId: item.id,
          });
        }

        walk(category.subcategories, ids, path);
      }
    };

    walk(list.categories, [], []);
  }

  return results;
};
