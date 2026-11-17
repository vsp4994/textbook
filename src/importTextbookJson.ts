import {
  MAX_DEPTH,
  type Category,
  type TodoItemType,
  type TodoList,
} from './types';
import { clampCategoryTitle, clampListTitle } from './utils/categoryUtils';
import { generateUUID } from './utils/uuid';

/**
 * Keep this file in src/importTextbookJson.ts.
 * It accepts a curated JSON import, not an entire AppDocument backup.
 * All imported IDs and the new list name are generated at import time.
 */

const IMPORT_FORMAT = 'textbook-import-v1';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const pad2 = (value: number): string => String(value).padStart(2, '0');

const createImportName = (now: Date): string =>
  `IMP_${pad2(now.getDate())}${pad2(now.getMonth() + 1)}_${pad2(now.getHours())}${pad2(now.getMinutes())}`;

/** The title is clickable in TextBook when its description is one URL. */
const normalizeUrl = (raw: unknown): string => {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Every imported task must have a URL.');
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new Error(`Invalid task URL: ${raw.slice(0, 80)}`);
  }

  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error('Imported links must be HTTPS URLs without credentials.');
  }

  // Instagram query strings are not needed to open the post, and can contain
  // tracking data or characters that interfere with the app's link-only parser.
  if (parsed.hostname === 'instagram.com' || parsed.hostname.endsWith('.instagram.com')) {
    parsed.search = '';
    parsed.hash = '';
  }

  return parsed.href;
};

const readCategoryTitle = (raw: unknown): string => {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Every category needs a title.');
  }

  const title = clampCategoryTitle(raw);
  if (!title) throw new Error('Category titles cannot be empty.');
  return title;
};

export interface ImportedListResult {
  list: TodoList;
  taskCount: number;
  skippedDuplicates: number;
}

/**
 * Validates everything before returning a list. The caller performs a single
 * updateDocument() only after a successful parse, so failures are non-destructive.
 */
export const createImportedList = (
  rawPayload: unknown,
  importedAt = new Date()
): ImportedListResult => {
  if (!isRecord(rawPayload) || rawPayload.format !== IMPORT_FORMAT) {
    throw new Error('Unsupported JSON format. Expected textbook-import-v1.');
  }
  if (!Array.isArray(rawPayload.categories)) {
    throw new Error('Import JSON must contain a categories array.');
  }

  const seenUrls = new Set<string>();
  let skippedDuplicates = 0;
  let taskCount = 0;

  const readCategory = (value: unknown, depth: number): Category | null => {
    if (depth > MAX_DEPTH) {
      throw new Error(`Category nesting cannot exceed ${MAX_DEPTH} levels.`);
    }
    if (!isRecord(value)) throw new Error('Invalid category object.');

    const title = readCategoryTitle(value.title);
    const rawItems = value.items === undefined ? [] : value.items;
    const rawChildren = value.subcategories === undefined ? [] : value.subcategories;
    if (!Array.isArray(rawItems) || !Array.isArray(rawChildren)) {
      throw new Error(`Invalid items or subcategories in "${title}".`);
    }

    const items: TodoItemType[] = [];
    for (const rawItem of rawItems) {
      if (!isRecord(rawItem) || typeof rawItem.title !== 'string' || !rawItem.title.trim()) {
        throw new Error(`Invalid task title in "${title}".`);
      }
      const url = normalizeUrl(rawItem.url);
      if (seenUrls.has(url)) {
        skippedDuplicates += 1;
        continue;
      }
      seenUrls.add(url);
      taskCount += 1;

      items.push({
        id: generateUUID(),
        title: rawItem.title.trim(),
        description: url,
        completed: false,
        starred: false,
      });
    }

    const subcategories: Category[] = [];
    for (const child of rawChildren) {
      const category = readCategory(child, depth + 1);
      if (category) subcategories.push(category);
    }

    // Do not create empty categories; every category should contain a post,
    // directly or through one of its nested subcategories.
    if (items.length === 0 && subcategories.length === 0) return null;

    return {
      id: generateUUID(),
      title,
      collapsed: true,
      showCheckboxes: true,
      sortCheckedToBottom: false,
      items,
      subcategories,
      depth,
    };
  };

  const categories: Category[] = [];
  for (const rawCategory of rawPayload.categories) {
    const category = readCategory(rawCategory, 1);
    if (category) categories.push(category);
  }
  if (taskCount === 0) throw new Error('No tasks found in this import JSON.');

  const list: TodoList = {
    id: generateUUID(),
    title: clampListTitle(createImportName(importedAt)),
    categories,
  };
  return { list, taskCount, skippedDuplicates };
};
