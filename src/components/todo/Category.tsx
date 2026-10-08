import React, { useState } from 'react';
import { type Category as CategoryType, type TodoItemType } from '../../types';
import { Icon } from '../Icon';
import { Modal } from '../Modal';
import { useDropdownFlip, useTextPrompt } from '../../hooks';
import { clampCategoryTitle, countCategoryItems, hasAnyCompletedItems, uncheckAllItems, sortTodoItems, hasAnyStarredItems } from '../../utils';

interface CategoryProps {
  category: CategoryType;
  onUpdateCategory: (categoryId: string, mutation: (cat: CategoryType) => Partial<CategoryType>) => void;
  onAddSubcategory: (category: CategoryType) => void;
  onDeleteCategory: (categoryId: string, title: string) => void;
  onDeleteAllChecked: (categoryId: string, title: string) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  setFocusInputId: (id: string | null) => void;
  renderTodoItem: (
    item: TodoItemType,
    showCheckboxes: boolean,
    categoryId?: string,
    sortCheckedToBottom?: boolean
  ) => React.ReactNode;
  renderCategory: (category: CategoryType) => React.ReactNode;
}

export const Category: React.FC<CategoryProps> = ({
  category,
  onUpdateCategory,
  onAddSubcategory,
  onDeleteCategory,
  onDeleteAllChecked,
  openDropdownId,
  setOpenDropdownId,
  setFocusInputId,
  renderTodoItem,
  renderCategory,
}) => {
  const counts = countCategoryItems(category);
  const hasStarred = hasAnyStarredItems(category);

  // Opens the 3-dot settings menu upward (instead of downward) when it would
  // otherwise spill past the bottom of the viewport — see useDropdownFlip.
  const { ref: dropdownRef, flip: dropdownFlip } = useDropdownFlip(
    openDropdownId === category.id
  );

  // Session-only fold state. Clicking a category title opens/closes the
  // category for the current session WITHOUT persisting it; the persisted
  // `collapsed` value only changes through the "Keep open" dropdown option.
  const [uiCollapsed, setUiCollapsed] = useState(category.collapsed);

  // Rename prompt state (replaces native prompt(), which cannot cap length).
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  // Rename dialog. Reuses the existing <Modal> with a themed text field as its
  // children; the hook pre-fills the current title and resets on each open.
  const renamePrompt = useTextPrompt({
    isOpen: isRenameOpen,
    initialValue: category.title,
    placeholder: 'Category title',
    onConfirm: (value) => {
      onUpdateCategory(category.id, () => ({ title: clampCategoryTitle(value) }));
    },
    onClose: () => setIsRenameOpen(false),
  });

  // Reset the session-only fold state whenever the persisted `collapsed`
  // changes (via "Keep open" or a drive sync) so the UI tracks the saved
  // preference. Uses the render-time adjustment pattern (React's documented
  // replacement for an effect here) to avoid cascading renders.
  const [persistedCollapsed, setPersistedCollapsed] = useState(category.collapsed);
  if (category.collapsed !== persistedCollapsed) {
    setPersistedCollapsed(category.collapsed);
    setUiCollapsed(category.collapsed);
  }

  const handleCategoryTitleClick = () => {
    setUiCollapsed((c) => !c);
  };

  const handleAddTaskClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const newTodoId = crypto.randomUUID();
    onUpdateCategory(category.id, (c) => ({
      items: [{
        id: newTodoId,
        title: '',
        description: '',
        completed: false,
        starred: false,
      }, ...c.items],
    }));
    // Open the category for the session so the freshly added task is visible,
    // without persisting the fold state.
    setUiCollapsed(false);
    setFocusInputId(newTodoId);
  };

  const handleDropdownToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === category.id ? null : category.id);
  };

  const handleRenameClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setIsRenameOpen(true);
  };

  const handleSortCheckedToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onUpdateCategory(category.id, (c) => ({ sortCheckedToBottom: !c.sortCheckedToBottom }));
    setOpenDropdownId(null);
  };

  const handleKeepOpenToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onUpdateCategory(category.id, (c) => ({ collapsed: !c.collapsed }));
    setOpenDropdownId(null);
  };

  const hasCheckedItems = category.showCheckboxes && hasAnyCompletedItems(category.items);

  const handleModeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onUpdateCategory(category.id, (c) => ({ showCheckboxes: !c.showCheckboxes }));
    setOpenDropdownId(null);
  };

  const handleUncheckAllClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onUpdateCategory(category.id, (c) => ({
      items: uncheckAllItems(c.items)
    }));
    setOpenDropdownId(null);
  };

  const handleAddSubcategoryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAddSubcategory(category);
    setOpenDropdownId(null);
  };

  const handleDeleteCategoryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDeleteCategory(category.id, category.title);
    setOpenDropdownId(null);
  };

  const handleDeleteAllCheckedClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDeleteAllChecked(category.id, category.title);
    setOpenDropdownId(null);
  };

  const handleTodoItemRender = (item: TodoItemType) => {
    return renderTodoItem(item, category.showCheckboxes, category.id, category.sortCheckedToBottom);
  };

  const handleSubcategoryRender = (sub: CategoryType) => {
    return renderCategory(sub);
  };

  const sortedItems = sortTodoItems([...category.items].reverse(), category.sortCheckedToBottom);

  const remainingCount = counts.total - counts.completed;
  let remainingIndicator;
  if (remainingCount > 0) {
    remainingIndicator = (
      <span className="category-count">
        · {remainingCount} left
      </span>
    );
  } else if (counts.total !== 0) {
    remainingIndicator = <Icon name="ri-checkbox-circle-fill" className="checkmark" />;
  }

  return (
    <div key={category.id} className={`category-card depth-${category.depth}${openDropdownId === category.id ? ' dropdown-open' : ''}`}>
      <div className="category-header">
        <div className="category-meta">
          <button className="category-header-title-button" onClick={handleCategoryTitleClick} type='button'>
            <Icon name={uiCollapsed ? "ri-arrow-right-s-line" : "ri-arrow-down-s-line"} className="fold-icon" />
            {/* <Icon name={category.showCheckboxes ? "ri-list-view" : "ri-text-block"} className="category-mode-icon" /> */}
            <span className="category-title">{category.title}</span>
            {hasStarred && <Icon name="ri-star-fill" className="category-star-icon" />}
            {remainingIndicator}
          </button>
        </div>

        <div
          ref={dropdownRef}
          className={`dropdown ${openDropdownId === category.id ? 'open' : ''}${openDropdownId === category.id && dropdownFlip ? ' flip-up' : ''}`}
        >
          <button className="btn btn-add-task" onClick={handleAddTaskClick} type='button'>
            <Icon name="ri-add-circle-fill" className="icon-primary" />
          </button>
          <button
            className="btn btn-dropdown-toggle"
            onClick={handleDropdownToggle}
            type='button'
          >
            <Icon name="ri-settings-5-line" />
          </button>
          <div className="dropdown-menu">
            <button onClick={handleRenameClick} type='button'>
              Rename
            </button>
            <button onClick={handleKeepOpenToggle} type='button'>
              <Icon name={category.collapsed ? "ri-checkbox-blank-line" : "ri-checkbox-fill"} />
              <span style={{ marginLeft: '8px' }}>Keep open</span>
            </button>
            {category.showCheckboxes && (
              <button onClick={handleSortCheckedToggle} type='button'>
                <Icon name={category.sortCheckedToBottom ? "ri-checkbox-fill" : "ri-checkbox-blank-line"} />
                <span style={{ marginLeft: '8px' }}>Show checked at bottom</span>
              </button>
            )}
            <button onClick={handleModeToggle} disabled={hasCheckedItems} type='button'>
              {category.showCheckboxes ? 'Hide checkboxes' : 'Show checkboxes'}<br />
              {hasCheckedItems && (
                <span className="mode-toggle-note">
                  Uncheck all to hide check-boxes
                </span>
              )}
            </button>
            {category.showCheckboxes && hasCheckedItems && (
              <button onClick={handleUncheckAllClick} type='button'>
                Uncheck all items
              </button>
            )}
            <button disabled={category.depth >= 3} onClick={handleAddSubcategoryClick} type='button'>
              Add Subcategory
            </button>
            {hasCheckedItems && (
              <button className="delete-action" onClick={handleDeleteAllCheckedClick} type='button'>
                Delete all checked
              </button>
            )}
            <button className="delete-action" onClick={handleDeleteCategoryClick} type='button'>
              Delete Category
            </button>
          </div>
        </div>
      </div>

      {/* The body stays mounted and animates its height (grid-template-rows
          0fr <-> 1fr) so folding reads as a smooth open/close on every depth,
          instead of the content popping in/out. `inert` keeps the folded
          content out of the tab order and clicks while collapsed. */}
      <div className={`category-body${uiCollapsed ? ' is-collapsed' : ''}`}>
        {/* Dedicated collapse wrapper with NO padding of its own. The outer
            .category-body collapses the track via 0fr; this wrapper collapses
            its own track via 0fr + overflow: hidden so the folded height is
            truly 0 even though .category-body__inner keeps its 8px padding. */}
        <div className="category-body__collapse" inert={uiCollapsed}>
          <div className="category-body__inner">
            {sortedItems.map(handleTodoItemRender)}
            {category.subcategories.map(handleSubcategoryRender)}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename Category"
        message=""
        type="info"
        confirmLabel="Save"
        onConfirm={renamePrompt.onPrimary}
        confirmDisabled={!renamePrompt.canConfirm}
      >
        {renamePrompt.renderField()}
      </Modal>
    </div>
  );
};
