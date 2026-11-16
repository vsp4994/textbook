import type { AppDocument, Category, TodoItemType, TodoList } from '../types';
import { MAX_DEPTH } from '../types';
import { deleteCategoryRecursive, deleteTodoItem, findCategoryById } from './categoryUtils';

/**
 * Pure helpers for the "Move to ..." feature. Nothing here touches React or
 * persistence: building the destination model and applying a move are plain
 * immutable transforms on the in-memory AppDocument, so they stay consistent
 * with the rest of the document-edit logic in categoryUtils.
 *
 * Move rules (see the feature spec):
 * - A task can become a child of ANY category in its current list, but only of
 *   Main Categories in other lists.
 * - A Depth2/Depth3 category can nest into any category of its current list,
 *   and can become a Main Category (list root) in any list. In other lists only
 *   Main Categories can host it as a child.
 * - A Main Category (Depth1) can nest into any category of any list (becoming
 *   Depth2/Depth3) or become the root of another list.
 * - Depths are recomputed from the destination position; a move whose subtree
 *   would exceed MAX_DEPTH (3) is invalid. A category can never be moved into
 *   itself or one of its own descendants.
 */

/** The entity the user wants to move (ids are globally unique UUIDs). */
export type MoveEntity =
  | { kind: 'task'; todoId: string }
  | { kind: 'category'; categoryId: string };

/**
 * Where a task/category may be moved. Tasks land inside categories. Categories
 * land either at a list root (becoming a Main Category, depth 1) or as a child
 * of an existing category (depth recomputed from the target's position).
 */
export type MoveTarget =
  | { kind: 'list-root'; listId: string }
  | { kind: 'category'; listId: string; categoryId: string };

/** One clickable destination shown in the move modal. */
export interface MoveNode {
  target: MoveTarget;
  /** Unique key within the modal. */
  id: string;
  title: string;
  /** Original depth (1..MAX_DEPTH) — used only for visual indentation. */
  depth: number;
  disabled: boolean;
  disabledReason?: string;
}

/** One list's block of destinations in the modal. */
export interface MoveSection {
  listId: string;
  listTitle: string;
  isCurrentList: boolean;
  /** "Make it a Main Category in this list" entry (tasks never get one). */
  rootTarget: MoveNode | null;
  /** Category destinations in tree order. */
  nodes: MoveNode[];
}

export interface MoveModel {
  entityTitle: string;
  sections: MoveSection[];
}

export interface MoveOutcome {
  document: AppDocument;
  targetListId: string;
  /** Category ids (root → target) that must be expanded for the move to be visible. */
  expandCategoryIds: string[];
  /** Present for category moves — scrolls the moved category into view. */
  focusCategoryId?: string;
  /** Present for task moves — scrolls/focuses the moved task. */
  focusTodoId?: string;
}

const assignDepths = (category: Category, depth: number): Category => ({
  ...category,
  depth,
  subcategories: category.subcategories.map((sub) => assignDepths(sub, depth + 1)),
});

/** Every descendant id of the given tree (the top-level nodes themselves are excluded). */
const collectSubtreeIds = (categories: Category[]): string[] =>
  categories.flatMap((category) => [category.id, ...collectSubtreeIds(category.subcategories)]);

/** 1-based depth of the deepest node in the subtree (the category itself counts as 1). */
const subtreeDepthOf = (category: Category): number => {
  if (category.subcategories.length === 0) return 1;
  return 1 + Math.max(...category.subcategories.map(subtreeDepthOf));
};

export interface CategoryLocation {
  listId: string;
  category: Category;
  parentCategoryId: string | null;
  /** Id path from the list root down to (and including) this category. */
  categoryPath: string[];
  /** Every descendant id (used for cycle checks and model filtering). */
  subtreeIds: string[];
  /** Deepest-node depth inside the subtree (the category itself = 1). */
  subtreeDepth: number;
}

export const findCategoryLocation = (
  lists: TodoList[],
  categoryId: string
): CategoryLocation | null => {
  for (const list of lists) {
    const found = findCategoryInTree(list.categories, categoryId, null, []);
    if (found) return { listId: list.id, ...found };
  }
  return null;
};

const findCategoryInTree = (
  categories: Category[],
  categoryId: string,
  parentCategoryId: string | null,
  path: string[]
): Omit<CategoryLocation, 'listId'> | null => {
  for (const category of categories) {
    const nextPath = [...path, category.id];
    if (category.id === categoryId) {
      return {
        category,
        parentCategoryId,
        categoryPath: nextPath,
        subtreeIds: collectSubtreeIds(category.subcategories),
        subtreeDepth: subtreeDepthOf(category),
      };
    }
    const nested = findCategoryInTree(category.subcategories, categoryId, category.id, nextPath);
    if (nested) return nested;
  }
  return null;
};

export interface TaskLocation {
  task: TodoItemType;
  listId: string;
  /** The category that directly owns the task. */
  categoryId: string;
}

export const findTaskLocation = (lists: TodoList[], todoId: string): TaskLocation | null => {
  for (const list of lists) {
    const found = findTaskInCategoryTree(list.categories, todoId);
    if (found) return { listId: list.id, ...found };
  }
  return null;
};

const findTaskInCategoryTree = (
  categories: Category[],
  todoId: string
): Omit<TaskLocation, 'listId'> | null => {
  for (const category of categories) {
    const task = category.items.find((item) => item.id === todoId);
    if (task) return { task, categoryId: category.id };
    const nested = findTaskInCategoryTree(category.subcategories, todoId);
    if (nested) return nested;
  }
  return null;
};

/** Id path from the list root down to (and including) `categoryId`. Empty when missing. */
export const getCategoryPath = (categories: Category[], categoryId: string): string[] => {
  for (const category of categories) {
    if (category.id === categoryId) return [category.id];
    const nestedPath = getCategoryPath(category.subcategories, categoryId);
    if (nestedPath.length > 0) return [category.id, ...nestedPath];
  }
  return [];
};

/** Title version of getCategoryPath (used in success toasts). */
export const getCategoryTitlePath = (categories: Category[], categoryId: string): string[] => {
  for (const category of categories) {
    if (category.id === categoryId) return [category.title];
    const nestedPath = getCategoryTitlePath(category.subcategories, categoryId);
    if (nestedPath.length > 0) return [category.title, ...nestedPath];
  }
  return [];
};

// --- Insert helpers (all immutable tree transforms) ---

const appendTodoToCategory = (
  categories: Category[],
  categoryId: string,
  todo: TodoItemType
): Category[] =>
  categories.map((category) =>
    category.id === categoryId
      ? { ...category, items: [...category.items, todo] }
      : { ...category, subcategories: appendTodoToCategory(category.subcategories, categoryId, todo) }
  );

const appendCategoryToChild = (
  categories: Category[],
  parentId: string,
  categoryToMove: Category,
  newDepth: number
): Category[] =>
  categories.map((category) =>
    category.id === parentId
      ? {
        ...category,
        subcategories: [
          ...category.subcategories,
          assignDepths(categoryToMove, newDepth),
        ],
      }
      : {
        ...category,
        subcategories: appendCategoryToChild(category.subcategories, parentId, categoryToMove, newDepth),
      }
  );

// --- Destination model ---

const makeNode = (
  listId: string,
  category: Category,
  disabledReason?: string
): MoveNode => ({
  target: { kind: 'category', listId, categoryId: category.id },
  id: category.id,
  title: category.title,
  depth: category.depth,
  disabled: disabledReason !== undefined,
  disabledReason,
});

const makeSection = (
  list: TodoList,
  isCurrentList: boolean,
  rootTarget: MoveNode | null,
  nodes: MoveNode[]
): MoveSection => ({
  listId: list.id,
  listTitle: list.title,
  isCurrentList,
  rootTarget,
  nodes,
});

/** Depth cap check: the moved subtree must fit under a target at `targetDepth`. */
const fitsUnder = (targetDepth: number, subtreeDepth: number): string | undefined =>
  targetDepth + subtreeDepth <= MAX_DEPTH
    ? undefined
    : 'Too deep to fit here (max 3 levels)';

const walkDestinations = (
  listId: string,
  categories: Category[],
  options: {
    /** Skip this node's row but keep walking its subcategories (e.g. current parent, self). */
    excludeNodeIds: Set<string>;
    /** Skip this node and its entire subtree (e.g. own descendants — cycles). */
    pruneSubtreeIds: Set<string>;
    depthCheck: (category: Category) => boolean;
  },
  nodes: MoveNode[]
): void => {
  for (const category of categories) {
    if (options.pruneSubtreeIds.has(category.id)) continue;
    if (options.excludeNodeIds.has(category.id)) {
      // Hidden row (no-op / would-be cycle), but its other branches remain
      // valid homes — e.g. a task's current parent still contains the
      // subcategories the task could move into.
      walkDestinations(listId, category.subcategories, options, nodes);
      continue;
    }
    const valid = options.depthCheck(category);
    nodes.push(
      makeNode(listId, category, valid ? undefined : 'Too deep to fit here (max 3 levels)')
    );
    walkDestinations(listId, category.subcategories, options, nodes);
  }
};

/**
 * Builds the destination list for the move modal. Returns null when the entity
 * is not found in the current document.
 *
 * Sections are in document order, the entity's own list first. The current
 * list always shows its full category tree (the flexible rule set lets tasks
 * and sub-categories nest anywhere in it); other lists show only Main
 * Categories for tasks and Depth2/Depth3 entities, but the full tree for a
 * Main Category entity (which may nest anywhere).
 */
export const buildMoveModel = (entity: MoveEntity, doc: AppDocument): MoveModel | null => {
  const lists = doc.lists;

  if (entity.kind === 'task') {
    const taskLocation = findTaskLocation(lists, entity.todoId);
    if (!taskLocation) return null;

    const sections: MoveSection[] = lists.map((list) => {
      const isCurrentList = list.id === taskLocation.listId;
      const nodes: MoveNode[] = [];
      if (isCurrentList) {
        // Any category in the current list is a valid home, except the task's
        // current parent (moving onto it is a no-op). Its subcategories stay
        // eligible, so they are excluded from the walk without pruning them.
        walkDestinations(
          list.id,
          list.categories,
          {
            excludeNodeIds: new Set([taskLocation.categoryId]),
            pruneSubtreeIds: new Set(),
            depthCheck: () => true,
          },
          nodes
        );
      } else {
        // Other lists: only Main Categories can host a task.
        list.categories.forEach((category) =>
          nodes.push(makeNode(list.id, category))
        );
      }
      return makeSection(list, isCurrentList, null, nodes);
    });

    return { entityTitle: taskLocation.task.title, sections };
  }

  const categoryLocation = findCategoryLocation(lists, entity.categoryId);
  if (!categoryLocation) return null;

  const movedCategory = categoryLocation.category;
  const isMainCategory = movedCategory.depth === 1;
  const subtreeDepth = categoryLocation.subtreeDepth;

  const sections = lists.map((list) => {
    const isCurrentList = list.id === categoryLocation.listId;

    // "Make it a Main Category": always offered for other lists; within the
    // current list only when the entity is not already a root there.
    const rootTarget: MoveNode | null =
      !isCurrentList || !isMainCategory
        ? {
          target: { kind: 'list-root', listId: list.id },
          id: `root:${list.id}`,
          title: isCurrentList
            ? 'Make it a top-level (Main) Category'
            : `As a Main Category in “${list.title}”`,
          depth: 0,
          disabled: false,
        }
        : null;

    // Hidden rows (no-ops / cycles) vs pruned subtrees are tracked separately:
    // the entity itself and its current parent are hidden but their other
    // branches remain valid destinations, while the entity's descendants are
    // pruned entirely (moving into one's own subtree is a cycle).
    const pruneSubtreeIds = new Set(categoryLocation.subtreeIds);
    const excludeNodeIds = new Set([movedCategory.id]);
    // Dropping the entity back under its own parent is an in-place no-op.
    if (isCurrentList && categoryLocation.parentCategoryId) {
      excludeNodeIds.add(categoryLocation.parentCategoryId);
    }

    const nodes: MoveNode[] = [];
    if (isCurrentList || isMainCategory) {
      // Current list (full tree for any category) or another list hosting a
      // Main Category (Depth1 can become Depth1/2/3 anywhere). The whole tree
      // is offered, with depth-capped destinations disabled.
      walkDestinations(
        list.id,
        list.categories,
        {
          excludeNodeIds,
          pruneSubtreeIds,
          depthCheck: (category) => fitsUnder(category.depth, subtreeDepth) === undefined,
        },
        nodes
      );
    } else {
      // Other lists for a Depth2/Depth3: only Main Categories can host it.
      list.categories.forEach((category) =>
        nodes.push(makeNode(list.id, category, fitsUnder(category.depth, subtreeDepth)))
      );
    }

    return makeSection(list, isCurrentList, rootTarget, nodes);
  });

  return { entityTitle: movedCategory.title, sections };
};

// --- Applying moves ---

export const moveTask = (doc: AppDocument, todoId: string, target: MoveTarget): MoveOutcome => {
  if (target.kind !== 'category') {
    throw new Error('A task can only be moved into a category.');
  }

  const location = findTaskLocation(doc.lists, todoId);
  if (!location) throw new Error('Task not found.');
  if (location.categoryId === target.categoryId) {
    throw new Error('Task is already in that category.');
  }

  // Remove from the source category, then append at the destination. The two
  // sequential immutable maps also handle the same-list case correctly, because
  // removal and insertion target different categories.
  let lists = doc.lists.map((list) =>
    list.id === location.listId
      ? { ...list, categories: deleteTodoItem(list.categories, todoId) }
      : list
  );
  lists = lists.map((list) =>
    list.id === target.listId
      ? { ...list, categories: appendTodoToCategory(list.categories, target.categoryId, location.task) }
      : list
  );

  const targetList = lists.find((list) => list.id === target.listId);
  if (!targetList) throw new Error('Target list not found.');

  return {
    document: { ...doc, lists },
    targetListId: target.listId,
    expandCategoryIds: getCategoryPath(targetList.categories, target.categoryId),
    focusTodoId: todoId,
  };
};

export const moveCategory = (doc: AppDocument, categoryId: string, target: MoveTarget): MoveOutcome => {
  const location = findCategoryLocation(doc.lists, categoryId);
  if (!location) throw new Error('Category not found.');

  if (target.kind === 'category') {
    // Cycle guard: a category can never become a child of itself or a descendant.
    if (target.categoryId === categoryId || location.subtreeIds.includes(target.categoryId)) {
      throw new Error('A category cannot be moved into itself or its own subcategories.');
    }
    const targetCategory = findCategoryById(
      doc.lists.find((list) => list.id === target.listId)?.categories ?? [],
      target.categoryId
    );
    if (!targetCategory) throw new Error('Target category not found.');
    if (targetCategory.depth + location.subtreeDepth > MAX_DEPTH) {
      throw new Error('Target is too deep for the moved category (max 3 levels).');
    }
  }

  // Remove from the source list first (immutable), then insert at the target.
  let lists = doc.lists.map((list) =>
    list.id === location.listId
      ? { ...list, categories: deleteCategoryRecursive(list.categories, categoryId) }
      : list
  );

  if (target.kind === 'list-root') {
    lists = lists.map((list) =>
      list.id === target.listId
        ? { ...list, categories: [...list.categories, assignDepths(location.category, 1)] }
        : list
    );
  } else {
    const targetList = lists.find((list) => list.id === target.listId);
    if (!targetList) throw new Error('Target list not found.');
    const targetCategory = findCategoryById(targetList.categories, target.categoryId);
    if (!targetCategory) throw new Error('Target category not found.');
    lists = lists.map((list) =>
      list.id === target.listId
        ? {
          ...list,
          categories: appendCategoryToChild(
            list.categories,
            target.categoryId,
            location.category,
            targetCategory.depth + 1
          ),
        }
        : list
    );
  }

  const targetList = lists.find((list) => list.id === target.listId);
  if (!targetList) throw new Error('Target list not found.');

  return {
    document: { ...doc, lists },
    targetListId: target.listId,
    expandCategoryIds:
      target.kind === 'list-root'
        ? []
        : getCategoryPath(targetList.categories, target.categoryId),
    focusCategoryId: categoryId,
  };
};




