
// This feature is UI-only: it searches the in-memory document and lets the user
// navigate to a result. It never mutates the document's data or shapes.

export type SearchResultKind = 'list' | 'category' | 'task';

/** One search hit shown as a big clickable button in the results dropdown. */
export interface SearchResult {
  kind: SearchResultKind;
  /** The entity's own id (list id, category id, or task id). */
  id: string;
  /** Id of the list that owns the result. */
  listId: string;
  /** Primary display text (list title, category title, or task title). */
  title: string;
  /** Short breadcrumb/location hint shown under the title. */
  context: string;
  /**
   * Category ids from the list root down to (and including) the owning/matched
   * category — used by App to reveal the target. Empty for list results.
   */
  categoryIds: string[];
  /** Present only for task results. */
  todoId?: string;
}

/**
 * UI-only payload App hands to Category components after a search result is
 * chosen. It reveals the target in the currently mounted list without touching
 * persisted data: categories on the path are force-expanded once (session-only
 * `uiCollapsed`), and the focused entity is scrolled into view.
 */
export interface SearchNavigationTarget {
  /** Monotonic per-navigation token so each reveal expands only once. */
  token: number;
  listId: string;
  /** Category ids to expand so the target becomes visible. */
  expandCategoryIds: string[];
  /** Present for category results; scrolls that category into view. */
  focusCategoryId?: string;
  /** Present for task results; focuses + scrolls that task. */
  focusTodoId?: string;
}
