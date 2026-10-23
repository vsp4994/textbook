import { type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Category as CategoryComponent, EmptyState, Icon, Modal, ReorderList, StarredList, Toast, TodoItem, type ToastSeverity } from './components';
import { useDocument, type UseDocumentReturn } from './hooks/useDocument';
import { useTextPrompt } from './hooks';
import { DriveSyncProvider } from './sync/DriveSyncContext';
import { MAX_DEPTH, STARRED_LIST_ID, type Category, type TodoItemType, type TodoList } from './types';
import type { ModalConfig } from './components/types/todoItem.types';
import {
  clampCategoryTitle,
  clampListTitle,
  collectStarredItems,
  deleteCategoryRecursive,
  deleteCheckedTodoItems,
  deleteTodoItem,
  MAX_LIST_TITLE_LENGTH,
  updateCategoriesRecursive,
  updateTodoItems,
} from './utils/categoryUtils';
import { generateUUID } from './utils/uuid';
import { SyncPanel } from './components/SyncPanel';

interface ToastState {
  severity: ToastSeverity;
  message: string;
  /** Changes on every show so the Toast remounts (resetting its dismiss timer). */
  id: number;
}

// Locates a todo by its globally-unique id across every list — the Starred view
// spans all lists, so a task can live in any of them. Returns the live object
// reference (no mutation) so callers can inspect the pre-mutation state.
const findTodoAcrossLists = (lists: TodoList[], todoId: string): TodoItemType | null => {
  for (const list of lists) {
    const walk = (categories: Category[]): TodoItemType | null => {
      for (const category of categories) {
        const found = category.items.find((item) => item.id === todoId);
        if (found) return found;
        const nested = walk(category.subcategories);
        if (nested) return nested;
      }
      return null;
    };
    const found = walk(list.categories);
    if (found) return found;
  }
  return null;
};

interface AppContentProps {
  document: UseDocumentReturn;
}

const AppContent = ({ document }: AppContentProps) => {
  const {
    doc,
    activeListId,
    isLoading,
    isDbAvailable,
    setActiveListId,
    updateDocument,
  } = document;

  const [focusInputId, setFocusInputId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => undefined,
  });
  const [tabMenuOpen, setTabMenuOpen] = useState(false);
  const [tabMenuPos, setTabMenuPos] = useState({ top: 0, left: 0 });
  const tabOptionsRef = useRef<HTMLButtonElement>(null);
  const tabMenuRef = useRef<HTMLDivElement | null>(null);

  // Floating toast (success/error/info) shown transiently at the bottom of the
  // view — e.g. the "Task completed" confirmation when a task is checked from
  // the Starred view. The Toast component owns its dismiss timer; App only
  // decides when to show one.
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((severity: ToastSeverity, message: string) => {
    setToast({ severity, message, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  // Pending category-title prompt (replacement for the native prompt()).
  type CategoryPromptState =
    | { kind: 'root' }
    | { kind: 'subcategory'; parentCategory: Category };
  const [categoryPrompt, setCategoryPrompt] = useState<CategoryPromptState | null>(null);

  // Pending list-title prompt (Add List / Rename List), same themed-modal
  // pattern as the category prompt so native prompt() is gone entirely.
  type ListPromptState =
    | { kind: 'add' }
    | { kind: 'rename'; list: TodoList };
  const [listPrompt, setListPrompt] = useState<ListPromptState | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.tab-options')) {
        setTabMenuOpen(false);
      }
    };

    // Listen in the capture phase: task-action buttons (delete/copy/star) call
    // stopPropagation(), which would otherwise prevent this bubble-phase
    // listener from firing and leave the tab-options-menu open.
    window.document.addEventListener('click', handleClickOutside, true);
    return () => window.document.removeEventListener('click', handleClickOutside, true);
  }, []);

  useEffect(() => {
    const handleDropdownClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Only the currently-open dropdown (the one with `.open`) may keep its
      // menu open. Checking `.open` (instead of any `.dropdown`/`.btn-add-task`)
      // means clicking e.g. a category's "add task" (+) button — which lives
      // inside its own `.dropdown` — still closes a task menu that is open.
      if (!target.closest('.dropdown.open')) {
        setOpenDropdownId(null);
      }
    };

    // Listen in the capture phase: the task/category action buttons (copy,
    // delete, star, more-toggle, category toggles, ...) call stopPropagation(),
    // which would otherwise prevent this bubble-phase listener from firing and
    // leave the task-options dropdown open when clicking elsewhere.
    window.document.addEventListener('click', handleDropdownClickOutside, true);
    return () => window.document.removeEventListener('click', handleDropdownClickOutside, true);
  }, []);

  const getActiveList = (): TodoList | undefined =>
    doc?.lists.find((list) => list.id === activeListId);

  // The Starred view is a synthetic "list" (no TodoList row owns this id), so it
  // is never persisted as a real active list — switching to it is purely
  // in-memory navigation. While in this view the item/category mutation handlers
  // below must target the todo's actual list instead of a single idle
  // `activeListId` that no list matches. Because todo/category ids are
  // globally-unique UUIDs, running an updater across every list only ever
  // mutates the one matching entry; every other list is an untouched no-op.
  const starredView = activeListId === STARRED_LIST_ID;
  const inActiveList = starredView ? () => true : (listId: string) => listId === activeListId;

  // All starred todos across every list, recomputed whenever the document
  // changes (updates are immutable, so any mutation replaces `doc`).
  const starredEntries = useMemo(() => (doc ? collectStarredItems(doc.lists) : []), [doc]);

  // At least one real list exists. The Starred tab and the list-settings
  // (reorder) button are only useful once there's a list to act on, so both
  // are hidden until the first list is created.
  const hasLists = doc ? doc.lists.length > 0 : false;

  const handleStarredClick = () => {
    setOpenDropdownId(null);
    setTabMenuOpen(false);
    setActiveListId(STARRED_LIST_ID);
  };

  const handleAddList = () => {
    if (!doc) return;
    setListPrompt({ kind: 'add' });
  };

  const confirmAddList = (rawTitle: string) => {
    if (!doc) return;

    const newList: TodoList = {
      id: generateUUID(),
      title: clampListTitle(rawTitle),
      categories: [],
    };

    setActiveListId(newList.id);
    updateDocument({
      ...doc,
      lists: [...doc.lists, newList],
      activeListId: newList.id,
    });
  };

  const handleDeleteList = (listId: string) => {
    if (!doc) return;

    const target = doc.lists.find((list) => list.id === listId);
    if (!target) return;

    // Close the tab-options-menu so it doesn't linger behind the modal
    setTabMenuOpen(false);

    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Delete List',
      message: `Are you absolutely sure you want to delete the list "${target.title}" and all its contents?`,
      onConfirm: () => {
        const remainingLists = doc.lists.filter((list) => list.id !== listId);
        const fallbackListId = remainingLists[0]?.id ?? '';

        setActiveListId(fallbackListId);
        updateDocument({
          ...doc,
          lists: remainingLists,
          activeListId: fallbackListId,
        });
      },
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
  };

  const handleEditList = (listId: string) => {
    if (!doc) return;
    const target = doc.lists.find((list) => list.id === listId);
    if (!target) return;

    // Close the tab-options-menu so it doesn't linger behind the modal.
    setTabMenuOpen(false);
    setListPrompt({ kind: 'rename', list: target });
  };

  const confirmRenameList = (listId: string, rawTitle: string) => {
    if (!doc) return;
    updateDocument({
      ...doc,
      lists: doc.lists.map((list) =>
        list.id === listId ? { ...list, title: clampListTitle(rawTitle) } : list
      ),
    });
  };

  const confirmAddRootCategory = (rawTitle: string) => {
    if (!doc) return;

    const newCategory: Category = {
      id: generateUUID(),
      title: clampCategoryTitle(rawTitle),
      collapsed: true,
      showCheckboxes: true,
      sortCheckedToBottom: false,
      items: [],
      subcategories: [],
      depth: 1,
    };

    updateDocument({
      ...doc,
      lists: doc.lists.map((list) =>
        list.id === activeListId
          ? { ...list, categories: [...list.categories, newCategory] }
          : list
      ),
    });
  };

  const handleAddRootCategory = () => {
    if (!doc) return;
    setCategoryPrompt({ kind: 'root' });
  };

  const handleUpdateCategory = (
    categoryId: string,
    mutation: (category: Category) => Partial<Category>
  ) => {
    if (!doc) return;

    updateDocument({
      ...doc,
      lists: doc.lists.map((list) =>
        inActiveList(list.id)
          ? {
            ...list,
            categories: updateCategoriesRecursive(list.categories, categoryId, mutation),
          }
          : list
      ),
    });
  };

  const handleDeleteCategory = (categoryId: string, title: string) => {
    if (!doc) return;

    setOpenDropdownId(null);
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Delete Category',
      message: `Delete the category "${title}" and all its subcategories and checklist items?`,
      onConfirm: () => {
        updateDocument({
          ...doc,
          lists: doc.lists.map((list) =>
            list.id === activeListId
              ? {
                ...list,
                categories: deleteCategoryRecursive(list.categories, categoryId),
              }
              : list
          ),
        });
      },
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
  };

  const handleDeleteAllChecked = (categoryId: string, title: string) => {
    if (!doc) return;

    setOpenDropdownId(null);
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Delete Checked Items',
      message: `Delete all checked items in "${title}"? This only affects this category's own checked items and cannot be undone.`,
      onConfirm: () => {
        updateDocument({
          ...doc,
          lists: doc.lists.map((list) =>
            list.id === activeListId
              ? {
                ...list,
                categories: deleteCheckedTodoItems(list.categories, categoryId),
              }
              : list
          ),
        });
      },
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
  };

  const confirmAddSubcategory = (parent: Category, rawTitle: string) => {
    if (!doc) return;

    const newSubcategory: Category = {
      id: generateUUID(),
      title: clampCategoryTitle(rawTitle),
      collapsed: true,
      showCheckboxes: parent.showCheckboxes,
      sortCheckedToBottom: parent.sortCheckedToBottom,
      items: [],
      subcategories: [],
      depth: parent.depth + 1,
    };

    handleUpdateCategory(parent.id, (category) => ({
      subcategories: [...category.subcategories, newSubcategory],
    }));
  };

  const handleAddSubcategory = (parentCategory: Category) => {
    if (parentCategory.depth >= MAX_DEPTH) {
      alert(`Nesting limit reached! Maximum nesting level is ${MAX_DEPTH}.`);
      return;
    }

    setCategoryPrompt({ kind: 'subcategory', parentCategory });
  };

  const handleUpdateTodo = (
    todoId: string,
    mutation: (item: TodoItemType) => Partial<TodoItemType>
  ) => {
    if (!doc) return;

    // Checking a task while in the Starred view must not leave the view. It just
    // confirms the completion with a floating toast; the now-completed item drops
    // out of the starred list on the next render (collectStarredItems excludes
    // completed todos). Detect the unchecked → checked transition by applying the
    // mutation to the live todo and comparing its completed flag.
    if (starredView) {
      const target = findTodoAcrossLists(doc.lists, todoId);
      if (target && mutation(target).completed === true && !target.completed) {
        showToast('success', 'Task completed');
      }
    }

    updateDocument({
      ...doc,
      lists: doc.lists.map((list) =>
        inActiveList(list.id)
          ? {
            ...list,
            categories: updateTodoItems(list.categories, todoId, mutation),
          }
          : list
      ),
    });
  };

  const handleDeleteTodo = (todoId: string) => {
    if (!doc) return;

    updateDocument({
      ...doc,
      lists: doc.lists.map((list) =>
        inActiveList(list.id)
          ? {
            ...list,
            categories: deleteTodoItem(list.categories, todoId),
          }
          : list
      ),
    });
  };

  const handleAddTodoAfter = (categoryId: string, afterItemId: string) => {
    const newTodo: TodoItemType = {
      id: generateUUID(),
      title: '',
      description: '',
      completed: false,
      starred: false,
    };

    setFocusInputId(newTodo.id);

    handleUpdateCategory(categoryId, (category) => {
      const displayOrderedItems = [...category.items].reverse();
      const itemIndex = displayOrderedItems.findIndex((item) => item.id === afterItemId);
      const newItems = [...displayOrderedItems];
      newItems.splice(itemIndex + 1, 0, newTodo);
      return { items: newItems.reverse() };
    });
  };

  const renderTodoItem = (
    item: TodoItemType,
    showCheckboxes: boolean,
    categoryId?: string,
    sortCheckedToBottom = false
  ): ReactNode => (
    <TodoItem
      key={item.id}
      item={item}
      showCheckboxes={showCheckboxes}
      sortCheckedToBottom={sortCheckedToBottom}
      categoryId={categoryId}
      focusInputId={focusInputId}
      setFocusInputId={setFocusInputId}
      openDropdownId={openDropdownId}
      onUpdateTodo={handleUpdateTodo}
      onDeleteTodo={handleDeleteTodo}
      onAddTodoAfter={handleAddTodoAfter}
      setOpenDropdownId={setOpenDropdownId}
    />
  );

  const renderCategory = (category: Category): ReactNode => (
    <CategoryComponent
      key={category.id}
      category={category}
      onUpdateCategory={handleUpdateCategory}
      onAddSubcategory={handleAddSubcategory}
      onDeleteCategory={handleDeleteCategory}
      onDeleteAllChecked={handleDeleteAllChecked}
      openDropdownId={openDropdownId}
      setOpenDropdownId={setOpenDropdownId}
      setFocusInputId={setFocusInputId}
      renderTodoItem={renderTodoItem}
      renderCategory={renderCategory}
    />
  );

  const toggleTabMenu = () => {
    setTabMenuOpen((open) => !open);
  };

  const handleReorderLists = (reordered: TodoList[]) => {
    if (!doc) return;
    updateDocument({ ...doc, lists: reordered });
  };

  const handleTabClick = (listId: string) => {
    setActiveListId(listId);
    if (!doc) return;
    updateDocument({ ...doc, activeListId: listId }, false);
  };

  const handleSelectList = (listId: string) => {
    handleTabClick(listId);
    setTabMenuOpen(false);
  };

  const handleModalClose = () => {
    setModalConfig((currentConfig) => ({ ...currentConfig, isOpen: false }));
  };

  // Prompt for creating a new category/subcategory title. Reuses the existing
  // <Modal> with a themed text field as its children (no separate modal
  // component); the shared hook owns the field state, counter, and hints.
  // Must live before the `if (isLoading)` early return (hooks order).
  const categoryTitlePrompt = useTextPrompt({
    isOpen: categoryPrompt !== null,
    placeholder:
      categoryPrompt?.kind === 'subcategory' ? 'Subcategory title' : 'Category title',
    onConfirm: (value) => {
      if (categoryPrompt?.kind === 'subcategory') {
        confirmAddSubcategory(categoryPrompt.parentCategory, value);
      } else {
        confirmAddRootCategory(value);
      }
    },
    onClose: () => setCategoryPrompt(null),
  });

  // List-title prompt (Add List / Rename List), sharing the same hook + Modal.
  const listTitlePrompt = useTextPrompt({
    isOpen: listPrompt !== null,
    initialValue: listPrompt?.kind === 'rename' ? listPrompt.list.title : '',
    placeholder: 'List title',
    maxLength: MAX_LIST_TITLE_LENGTH,
    onConfirm: (value) => {
      if (listPrompt?.kind === 'rename') {
        confirmRenameList(listPrompt.list.id, value);
      } else {
        confirmAddList(value);
      }
    },
    onClose: () => setListPrompt(null),
  });

  // Position the tab-options reorder menu. Opens below the options button and
  // flips above it when the menu wouldn't fit below the viewport's bottom edge
  // (the same flip behavior as the task/category 3-dot menus, implemented per
  // menu in useDropdownFlip). The menu's real height is only known while it is
  // rendered, so it is positioned in a layout effect whenever it opens, and
  // re-positioned on scroll/resize while it stays open.
  useLayoutEffect(() => {
    if (!tabMenuOpen) return;
    const button = tabOptionsRef.current;
    const menu = tabMenuRef.current;
    if (!button || !menu) return;

    const position = () => {
      const buttonRect = button.getBoundingClientRect();
      const menuWidth = 260;
      const menuHeight = menu.offsetHeight;
      const gap = 4;
      const left = Math.max(
        8,
        Math.min(buttonRect.right - menuWidth, window.innerWidth - menuWidth - 8)
      );
      const fitsBelow =
        buttonRect.bottom + gap + menuHeight <= window.innerHeight - 8;
      const top = fitsBelow
        ? buttonRect.bottom + gap
        : Math.max(8, buttonRect.top - menuHeight - gap);
      setTabMenuPos({ top, left });
    };

    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [tabMenuOpen]);


  if (isLoading) {
    return (
      <div className="app-container">
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  const activeList = getActiveList();

  return (
    <div className="app-container">
      <nav className="app-header">
        <SyncPanel document={doc} isDbAvailable={isDbAvailable} />
      </nav>

      <main className="app-body">
        {starredView ? (
          <div className="starred-wrapper">
            <StarredList
              entries={starredEntries}
              onOpenList={handleTabClick}
              renderTodoItem={renderTodoItem}
            />
          </div>
        ) : activeList ? (
          <div className="list-wrapper">
            <div className="list-header-row">
              <button className="btn btn-outline" onClick={handleAddRootCategory} type="button">
                <Icon name="ri-add-line" />Add New Category
              </button>
            </div>

            {activeList.categories.length === 0 ? (
              <div className="empty-state">Click "Category" to get started.</div>
            ) : (
              <div className="categories-grid">
                {activeList.categories.map((category) => renderCategory(category))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon="ri-book-open-line"
            title="Every story starts with a blank page."
            subtitle="Create your first list and give your notes, plans, and ideas a home."
          />
        )}
      </main>

      <footer className="tab-navigation">
        {hasLists && (
          <button
            className={`tab-item starred-tab ${starredView ? 'active' : ''}`}
            onClick={handleStarredClick}
            type="button"
            title={`Starred (${starredEntries.length})`}
          >
            <Icon name={starredView ? 'ri-star-fill' : 'ri-star-line'} className="starred-tab-icon" />
            <span className="starred-tab-label">Starred</span>
            <span className="starred-tab-label-count">
              {starredEntries.length}
            </span>
          </button>
        )}

        <div className="tab-list">
          {doc?.lists.map((list) => (
            <button
              key={list.id}
              className={`tab-item ${list.id === activeListId ? 'active' : ''}`}
              onClick={() => handleTabClick(list.id)}
              type="button"
            >
              {list.title}
            </button>
          ))}

          <button className="tab-item add-tab" onClick={handleAddList} type="button">
            <Icon name="ri-add-line" /> List
          </button>
        </div>

        {hasLists && (
          <div className="tab-options">
            <button
              ref={tabOptionsRef}
              className="tab-options-button"
              onClick={toggleTabMenu}
              type="button"
              title="View and reorder lists"
            >
              <Icon name="ri-list-settings-line" />
            </button>


            {tabMenuOpen && doc && (
              <div
                ref={tabMenuRef}
                className="tab-options-menu"
                style={{ top: tabMenuPos.top, left: tabMenuPos.left }}
              >
                <div className="tab-options-menu-footer">Drag to reorder lists</div>
                {doc.lists.length === 0 ? (
                  <div className="tab-options-empty">No lists yet.</div>
                ) : (
                  <ReorderList
                    items={doc.lists}
                    getItemId={(list) => list.id}
                    renderItem={(list) => (
                      <>
                        <Icon name="ri-draggable" className="tab-options-drag reorder-handle" />
                        <button
                          className="tab-options-title"
                          onClick={() => handleSelectList(list.id)}
                          onPointerDown={(e) => e.stopPropagation()}
                          type="button"
                          title={`Go to ${list.title}`}
                        >
                          {list.title}
                        </button>
                        {list.id === activeListId && (
                          <Icon name="ri-check-line" className="tab-options-active" />
                        )}
                        <button
                          className="icon-btn primary"
                          onClick={() => handleEditList(list.id)}
                          onPointerDown={(e) => e.stopPropagation()}
                          type="button"
                          title="Rename list"
                        >
                          <Icon name="ri-pencil-line" />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => handleDeleteList(list.id)}
                          onPointerDown={(e) => e.stopPropagation()}
                          type="button"
                          title="Delete list"
                        >
                          <Icon name="ri-delete-bin-line" />
                        </button>
                      </>
                    )}
                    onReorder={handleReorderLists}
                    className="tab-options-list"
                    itemClassName="tab-options-item"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </footer>

      {toast && (
        <Toast
          key={toast.id}
          severity={toast.severity}
          message={toast.message}
          onClose={hideToast}
        />
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
      />

      <Modal
        isOpen={categoryPrompt !== null}
        onClose={() => setCategoryPrompt(null)}
        title={categoryPrompt?.kind === 'subcategory' ? 'Add Subcategory' : 'Add Category'}
        message=""
        type="info"
        confirmLabel="Save"
        onConfirm={categoryTitlePrompt.onPrimary}
        confirmDisabled={!categoryTitlePrompt.canConfirm}
      >
        {categoryTitlePrompt.renderField()}
      </Modal>

      <Modal
        isOpen={listPrompt !== null}
        onClose={() => setListPrompt(null)}
        title={listPrompt?.kind === 'rename' ? 'Rename List' : 'Add List'}
        message=""
        type="info"
        confirmLabel="Save"
        onConfirm={listTitlePrompt.onPrimary}
        confirmDisabled={!listTitlePrompt.canConfirm}
      >
        {listTitlePrompt.renderField()}
      </Modal>
    </div>
  );
};

export default function App() {
  const document = useDocument();

  return (
    <DriveSyncProvider document={document}>
      <AppContent document={document} />
    </DriveSyncProvider>
  );
}

