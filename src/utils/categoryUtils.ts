import type { Category, TodoItemType } from '../types';

export const updateCategoriesRecursive = (
  categories: Category[],
  categoryId: string,
  mutation: (cat: Category) => Partial<Category>
): Category[] => {
  return categories.map((cat) => {
    if (cat.id === categoryId) {
      return { ...cat, ...mutation(cat) };
    }
    return {
      ...cat,
      subcategories: updateCategoriesRecursive(cat.subcategories, categoryId, mutation),
    };
  });
};

export const deleteCategoryRecursive = (categories: Category[], categoryId: string): Category[] => {
  return categories
    .filter((cat) => cat.id !== categoryId)
    .map((cat) => ({
      ...cat,
      subcategories: deleteCategoryRecursive(cat.subcategories, categoryId),
    }));
};

export const findCategoryById = (categories: Category[], categoryId: string): Category | null => {
  for (const cat of categories) {
    if (cat.id === categoryId) return cat;
    const found = findCategoryById(cat.subcategories, categoryId);
    if (found) return found;
  }
  return null;
};

export const addSubcategory = (categories: Category[], parentId: string, newSub: Category): Category[] => {
  return categories.map((cat) => {
    if (cat.id === parentId) {
      return { ...cat, subcategories: [...cat.subcategories, newSub] };
    }
    return { ...cat, subcategories: addSubcategory(cat.subcategories, parentId, newSub) };
  });
};

export const updateTodoItems = (
  categories: Category[],
  todoId: string,
  mutation: (item: TodoItemType) => Partial<TodoItemType>
): Category[] => {
  const updateItems = (items: TodoItemType[]): TodoItemType[] => {
    return items.map((item) => {
      if (item.id === todoId) return { ...item, ...mutation(item) };
      return item;
    });
  };
  return categories.map((cat) => ({
    ...cat,
    items: updateItems(cat.items),
    subcategories: updateTodoItems(cat.subcategories, todoId, mutation),
  }));
};

export const deleteTodoItem = (categories: Category[], todoId: string): Category[] => {
  const deleteItems = (items: TodoItemType[]): TodoItemType[] =>
    items.filter((i) => i.id !== todoId);
  return categories.map((cat) => ({
    ...cat,
    items: deleteItems(cat.items),
    subcategories: deleteTodoItem(cat.subcategories, todoId),
  }));
};

export const sortTodoItems = (items: TodoItemType[], sortCheckedToBottom: boolean): TodoItemType[] => {
  return [...items].sort((a, b) => {
    // When "show checked at bottom" is enabled, checked items sink to the
    // bottom regardless of whether they are starred.
    if (sortCheckedToBottom && a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Starred items float to the beginning of each group.
    const aStarred = Boolean(a.starred);
    const bStarred = Boolean(b.starred);
    if (aStarred !== bStarred) {
      return aStarred ? -1 : 1;
    }

    // Keep original (stable) order within equal groups.
    return 0;
  });
};

export const hasStarredTodoItems = (items: TodoItemType[]): boolean => {
  return items.some((item) => {
    // Only un-checked starred items count (so a fully-checked starred item
    // no longer marks its category as starred).
    return item.starred && !item.completed;
  });
};

export const hasAnyStarredItems = (category: Category): boolean => {
  if (hasStarredTodoItems(category.items)) return true;
  return category.subcategories.some(hasAnyStarredItems);
};

export const countCategoryItems = (category: Category): { completed: number; total: number } => {
  let completed = 0;
  let total = 0;
  for (const item of category.items) {
    if (!category.showCheckboxes) continue;
    if (item.completed) completed++;
    total++;
  }
  category.subcategories.forEach((sub) => {
    const subCounts = countCategoryItems(sub);
    completed += subCounts.completed;
    total += subCounts.total;
  });
  return { completed, total };
};

export const uncheckAllItems = (items: TodoItemType[]): TodoItemType[] => {
  return items.map((item) => ({
    ...item,
    completed: false,
  }));
};

export const hasAnyCompletedItems = (items: TodoItemType[]): boolean => {
  return items.some((item) => item.completed);
};

export const migrateTodoItems = (items: TodoItemType[]): TodoItemType[] => {
  return items.map((item) => ({
    ...item,
    starred: item.starred ?? false,
  }));
};

export const migrateCategories = (categories: Category[]): Category[] => {
  return categories.map((cat) => ({
    ...cat,
    sortCheckedToBottom: cat.sortCheckedToBottom ?? false,
    items: migrateTodoItems(cat.items),
    subcategories: migrateCategories(cat.subcategories),
  }));
};
