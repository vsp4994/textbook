import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon, Modal, ReorderList, Category as CategoryComponent, TodoItem } from './components';
import { useDocument, type UseDocumentReturn } from './hooks/useDocument';
import { useTextPrompt } from './hooks';
import { DriveSyncProvider } from './sync/DriveSyncContext';
import { MAX_DEPTH, type Category, type TodoItemType, type TodoList } from './types';
import type { ModalConfig } from './components/types/todoItem.types';
import {
  clampCategoryTitle,
  clampListTitle,
  deleteCategoryRecursive,
  deleteCheckedTodoItems,
  deleteTodoItem,
  MAX_LIST_TITLE_LENGTH,
  updateCategoriesRecursive,
  updateTodoItems,
} from './utils/categoryUtils';
import { generateUUID } from './utils/uuid';
import { SyncPanel } from './components/SyncPanel';

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
        list.id === activeListId
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

    updateDocument({
      ...doc,
      lists: doc.lists.map((list) =>
        list.id === activeListId
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
        list.id === activeListId
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
      <nav className="tab-navigation">
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
              <div className="tab-options-menu-header">Drag to reorder lists</div>
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
      </nav>

      <main className="app-body">
        {activeList ? (
          <div className="list-wrapper">
            <div className="list-header-row">
              <button className="btn btn-outline" onClick={handleAddRootCategory} type="button">
                <Icon name="ri-add-line" /> Category
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
          <div className="empty-state empty-state-hero">
            <div className="empty-state-icon">
              <Icon name="ri-book-open-line" />
            </div>
            <h2 className="empty-state-title">Every story starts with a blank page.</h2>
            <p className="empty-state-subtitle">
              Create your first list and give your notes, plans, and ideas a home.
            </p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <SyncPanel document={doc} isDbAvailable={isDbAvailable} />
      </footer>

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
